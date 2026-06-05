import bot from "./bot";
import prisma from "@/lib/db";

// Store linking codes temporarily (use Redis in production)
const linkingCodes = new Map<string, { userId: string; expiresAt: Date }>();

// Generate a linking code for a user
export function generateLinkingCode(userId: string): string {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minute expiry
  
  linkingCodes.set(code, { userId, expiresAt });
  return code;
}

// Clean up expired codes every hour
setInterval(() => {
  const now = new Date();
  for (const [code, data] of linkingCodes.entries()) {
    if (data.expiresAt < now) {
      linkingCodes.delete(code);
    }
  }
}, 60 * 60 * 1000);

export function startPolling() {
  console.log("[Telegram] Starting polling mode...");

  // Handle /start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from?.username || "User";
    
    // Check if already linked
    const existingUser = await prisma.user.findFirst({
      where: { telegramChatId: chatId.toString() }
    });
    
    if (existingUser) {
      await bot.sendMessage(
        chatId,
        `✅ *Welcome back ${existingUser.fullName}!*\n\n` +
        `Your Telegram is already linked to your health account.\n` +
        `You will receive notifications for:\n` +
        `• Meal reminders 🍽️\n` +
        `• Exercise reminders 🏋️\n` +
        `• Sleep reminders 😴\n` +
        `• Medication reminders 💊\n\n` +
        `Use /help to see available commands.`,
        { parse_mode: "Markdown" }
      );
      return;
    }
    
    await bot.sendMessage(
      chatId,
      `🤖 *Welcome ${username}!*\n\n` +
      `I'll help you stay on track with your health goals by sending you reminders.\n\n` +
      `*To get started:*\n` +
      `1. Go to your dashboard on the web app\n` +
      `2. Go to Settings → Telegram Integration\n` +
      `3. Copy your unique linking code\n` +
      `4. Send \`/link YOUR_CODE_HERE\`\n\n` +
      `Use /help to see all commands.`,
      { parse_mode: "Markdown" }
    );
  });

  // Handle /link command
  bot.onText(/\/link (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const code = match?.[1]?.toUpperCase();
    
    if (!code) {
      await bot.sendMessage(
        chatId,
        "❌ *Invalid command!*\n\n" +
        "Usage: `/link YOUR_CODE`\n\n" +
        "Get your code from the web dashboard.",
        { parse_mode: "Markdown" }
      );
      return;
    }
    
    // Check if already linked
    const existingUser = await prisma.user.findFirst({
      where: { telegramChatId: chatId.toString() }
    });
    
    if (existingUser) {
      await bot.sendMessage(
        chatId,
        "✅ *Already Linked!*\n\n" +
        `Your Telegram is already linked to account: ${existingUser.fullName}`,
        { parse_mode: "Markdown" }
      );
      return;
    }
    
    // Find linking code
    const linkingRequest = linkingCodes.get(code);
    
    if (!linkingRequest) {
      await bot.sendMessage(
        chatId,
        "❌ *Invalid or expired code!*\n\n" +
        "Please generate a new linking code from your dashboard and try again.\n\n" +
        "1. Go to your dashboard\n" +
        "2. Settings → Telegram Integration\n" +
        "3. Click 'Generate Link Code'\n" +
        "4. Send `/link NEW_CODE_HERE`",
        { parse_mode: "Markdown" }
      );
      return;
    }
    
    // Check if code expired
    if (linkingRequest.expiresAt < new Date()) {
      linkingCodes.delete(code);
      await bot.sendMessage(
        chatId,
        "❌ *Code expired!*\n\n" +
        "Please generate a new linking code from your dashboard.",
        { parse_mode: "Markdown" }
      );
      return;
    }
    
    // Link the user
    await prisma.user.update({
      where: { id: linkingRequest.userId },
      data: { telegramChatId: chatId.toString() }
    });
    
    // Remove used code
    linkingCodes.delete(code);
    
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: linkingRequest.userId }
    });
    
    await bot.sendMessage(
      chatId,
      `✅ *Successfully Linked!*\n\n` +
      `Your Telegram is now connected to account: *${user?.fullName}*\n\n` +
      `You will now receive notifications for:\n` +
      `• Meal reminders 🍽️\n` +
      `• Exercise reminders 🏋️\n` +
      `• Sleep reminders 😴\n` +
      `• Medication reminders 💊\n\n` +
      `Use /status to check your linked account.\n` +
      `Use /help for more commands.`,
      { parse_mode: "Markdown" }
    );
  });

  // Handle /status command
  bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    
    const user = await prisma.user.findFirst({
      where: { telegramChatId: chatId.toString() },
      select: {
        fullName: true,
        email: true,
        telegramChatId: true
      }
    });
    
    if (!user) {
      await bot.sendMessage(
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
      return;
    }
    
    await bot.sendMessage(
      chatId,
      `✅ *Linked Account*\n\n` +
      `👤 Name: ${user.fullName}\n` +
      `📧 Email: ${user.email}\n` +
      `🔔 Notifications: Active\n\n` +
      `You will receive all health reminders here!`,
      { parse_mode: "Markdown" }
    );
  });

  // Handle /unlink command
  bot.onText(/\/unlink/, async (msg) => {
    const chatId = msg.chat.id;
    
    const user = await prisma.user.findFirst({
      where: { telegramChatId: chatId.toString() }
    });
    
    if (!user) {
      await bot.sendMessage(
        chatId,
        "❌ *Not Linked*\n\n" +
        "Your Telegram is not linked to any account.",
        { parse_mode: "Markdown" }
      );
      return;
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: { telegramChatId: null }
    });
    
    await bot.sendMessage(
      chatId,
      "✅ *Unlinked Successfully*\n\n" +
      "Your Telegram is no longer linked to your health account.\n" +
      "You will not receive any more notifications.\n\n" +
      "To link again, generate a new code from your dashboard.",
      { parse_mode: "Markdown" }
    );
  });

  // Handle /help command
  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    
    await bot.sendMessage(
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

  // Handle any other messages
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    // Ignore commands (already handled)
    if (text?.startsWith('/')) return;
    
    // Check if user is linked
    const user = await prisma.user.findFirst({
      where: { telegramChatId: chatId.toString() }
    });
    
    if (!user) {
      await bot.sendMessage(
        chatId,
        "👋 Hello! You need to link your account first.\n\n" +
        "Send /help to see available commands.\n\n" +
        "To link, get a code from your web dashboard and send:\n" +
        "`/link YOUR_CODE`",
        { parse_mode: "Markdown" }
      );
    } else {
      await bot.sendMessage(
        chatId,
        `👋 Hello ${user.fullName}! You're all set up.\n\n` +
        `You'll receive health reminders here automatically.\n\n` +
        `Send /help to see commands.`,
        { parse_mode: "Markdown" }
      );
    }
  });

  console.log("[Telegram] Polling handlers registered successfully!");
}

// Export generateLinkingCode for API routes
export { generateLinkingCode as generateTelegramLinkCode };