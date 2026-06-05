import workerBot from "@/lib/telegram/worker-bot";
import prisma from "@/lib/db";
import { withRetry } from "@/lib/db-retry";
import { verifyTelegramLinkCode, markCodeAsUsed } from "@/lib/telegram/linking";

export function startTelegramPolling() {
  console.log("[Telegram Worker] Starting polling...");

  workerBot.removeAllListeners();

  workerBot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
      const existingUser = await withRetry(async () => {
        return await prisma.user.findFirst({
          where: { telegramChatId: chatId.toString() }
        });
      });
      
      if (existingUser) {
        await workerBot.sendMessage(
          chatId,
          `✅ Welcome back *${existingUser.fullName}!*\n\n` +
          `Your Telegram is already linked to your health account.\n` +
          `You will receive notifications for:\n` +
          `• Meal reminders 🍽️\n` +
          `• Exercise reminders 🏋️\n` +
          `• Sleep reminders 😴\n` +
          `• Medication reminders 💊\n\n` +
          `Send /help to see available commands.`,
          { parse_mode: "Markdown" }
        );
        return;
      }
      
      await workerBot.sendMessage(
        chatId,
        `🤖 *Welcome to HealthBot!*\n\n` +
        `I'll help you stay on track with your health goals.\n\n` +
        `*To get started:*\n` +
        `1. Go to your dashboard on the web app\n` +
        `2. Go to Settings → Telegram Integration\n` +
        `3. Copy your unique linking code\n` +
        `4. Send \`/link YOUR_CODE_HERE\`\n\n` +
        `Send /help to see all commands.`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error("[Telegram Worker] Error in /start:", error);
      await workerBot.sendMessage(
        chatId,
        "❌ *Error*\n\nSomething went wrong. Please try again later.",
        { parse_mode: "Markdown" }
      );
    }
  });

  workerBot.onText(/\/link (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const code = match?.[1]?.toUpperCase();
    
    console.log(`[Telegram Worker] Link attempt with code: ${code}`);
    
    if (!code) {
      await workerBot.sendMessage(
        chatId,
        "❌ *Invalid command!*\n\nUsage: `/link YOUR_CODE`",
        { parse_mode: "Markdown" }
      );
      return;
    }
    
    try {
      // Check if already linked
      const existingUser = await withRetry(async () => {
        return await prisma.user.findFirst({
          where: { telegramChatId: chatId.toString() }
        });
      });
      
      if (existingUser) {
        await workerBot.sendMessage(
          chatId,
          "✅ *Already Linked!*\n\n" +
          `Your Telegram is already linked to account: ${existingUser.fullName}`,
          { parse_mode: "Markdown" }
        );
        return;
      }
      
      // Find the code in database using our helper
      const { userId, isValid } = await verifyTelegramLinkCode(code);
      
      if (!isValid) {
        await workerBot.sendMessage(
          chatId,
          "❌ *Invalid or expired code!*\n\n" +
          "Please generate a new linking code from your dashboard.\n\n" +
          "1. Go to your dashboard\n" +
          "2. Settings → Telegram Integration\n" +
          "3. Click 'Generate New Code'\n" +
          "4. Send `/link NEW_CODE_HERE`",
          { parse_mode: "Markdown" }
        );
        return;
      }
      
      // Get the user details
      const user = await withRetry(async () => {
        return await prisma.user.findUnique({
          where: { id: userId }
        });
      });
      
      // Link the user
      await withRetry(async () => {
        await prisma.user.update({
          where: { id: userId },
          data: { telegramChatId: chatId.toString() }
        });
        
        // Mark code as used
        const linkCode = await prisma.telegramLinkCode.findFirst({
          where: { code, used: false }
        });
        
        if (linkCode) {
          await markCodeAsUsed(linkCode.id);
        }
        
        return true;
      });
      
      await workerBot.sendMessage(
        chatId,
        `✅ *Successfully Linked!*\n\n` +
        `Your Telegram is now connected to account: *${user?.fullName}*\n\n` +
        `You will now receive notifications for:\n` +
        `• Meal reminders 🍽️\n` +
        `• Exercise reminders 🏋️\n` +
        `• Sleep reminders 😴\n` +
        `• Medication reminders 💊\n\n` +
        `Send /status to check your linked account.\n` +
        `Send /help for more commands.`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error("[Telegram Worker] Error in /link:", error);
      await workerBot.sendMessage(
        chatId,
        "❌ *Error*\n\nSomething went wrong. Please try again later.",
        { parse_mode: "Markdown" }
      );
    }
  });

  workerBot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
      const user = await withRetry(async () => {
        return await prisma.user.findFirst({
          where: { telegramChatId: chatId.toString() }
        });
      });
      
      if (user) {
        await workerBot.sendMessage(
          chatId,
          `✅ *Linked Account*\n\n` +
          `👤 Name: ${user.fullName}\n` +
          `📧 Email: ${user.email}\n` +
          `🔔 Notifications: Active\n\n` +
          `You will receive all health reminders here!`,
          { parse_mode: "Markdown" }
        );
      } else {
        await workerBot.sendMessage(
          chatId,
          "❌ *Not Linked*\n\n" +
          "Your Telegram is not linked to any health account.\n\n" +
          "To link:\n" +
          "1. Go to your dashboard\n" +
          "2. Settings → Telegram Integration\n" +
          "3. Generate a linking code\n" +
          "4. Send `/link YOUR_CODE_HERE`",
          { parse_mode: "Markdown" }
        );
      }
    } catch (error) {
      console.error("[Telegram Worker] Error in /status:", error);
      await workerBot.sendMessage(
        chatId,
        "❌ *Error*\n\nSomething went wrong. Please try again later.",
        { parse_mode: "Markdown" }
      );
    }
  });

  workerBot.onText(/\/unlink/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
      const user = await withRetry(async () => {
        return await prisma.user.findFirst({
          where: { telegramChatId: chatId.toString() }
        });
      });
      
      if (!user) {
        await workerBot.sendMessage(
          chatId,
          "❌ *Not Linked*\n\nYour Telegram is not linked to any account.",
          { parse_mode: "Markdown" }
        );
        return;
      }
      
      await withRetry(async () => {
        await prisma.user.update({
          where: { id: user.id },
          data: { telegramChatId: null }
        });
        return true;
      });
      
      await workerBot.sendMessage(
        chatId,
        "✅ *Unlinked Successfully*\n\n" +
        "Your Telegram is no longer linked to your health account.\n" +
        "You will not receive any more notifications.\n\n" +
        "To link again, generate a new code from your dashboard.",
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error("[Telegram Worker] Error in /unlink:", error);
      await workerBot.sendMessage(
        chatId,
        "❌ *Error*\n\nSomething went wrong. Please try again later.",
        { parse_mode: "Markdown" }
      );
    }
  });

  workerBot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    await workerBot.sendMessage(
      chatId,
      "📚 *Help & Commands*\n\n" +
      "Available commands:\n\n" +
      "• `/start` - Welcome message and overview\n" +
      "• `/link [code]` - Link Telegram to your account\n" +
      "• `/status` - Check your linking status\n" +
      "• `/unlink` - Unlink your Telegram account\n" +
      "• `/help` - Show this help message\n\n" +
      "*Need more help?*\n" +
      "Visit your dashboard or contact support.",
      { parse_mode: "Markdown" }
    );
  });

  workerBot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    if (text?.startsWith('/')) return;
    
    try {
      const user = await withRetry(async () => {
        return await prisma.user.findFirst({
          where: { telegramChatId: chatId.toString() }
        });
      });
      
      if (!user) {
        await workerBot.sendMessage(
          chatId,
          "👋 Hello! You need to link your account first.\n\n" +
          "Send /help to see available commands.\n\n" +
          "To link, get a code from your web dashboard and send:\n" +
          "`/link YOUR_CODE`",
          { parse_mode: "Markdown" }
        );
      } else {
        await workerBot.sendMessage(
          chatId,
          `👋 Hello ${user.fullName}! You're all set up.\n\n` +
          `You'll receive health reminders here automatically.\n\n` +
          `Send /help to see commands.`,
          { parse_mode: "Markdown" }
        );
      }
    } catch (error) {
      console.error("[Telegram Worker] Error in message handler:", error);
    }
  });

  console.log("[Telegram Worker] Polling handlers registered successfully!");
}