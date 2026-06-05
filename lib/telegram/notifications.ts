import bot from "./bot";
import prisma from "@/lib/db";

export type NotificationType = "MEAL" | "EXERCISE" | "SLEEP" | "MEDICATION";

interface NotificationPayload {
  telegramChatId: string | null | undefined;
  type: NotificationType;
  linkedTo: string;
  extraMessage?: string;
}

const EMOJI: Record<NotificationType, string> = {
  MEAL: "🍽️",
  EXERCISE: "🏋️",
  SLEEP: "😴",
  MEDICATION: "💊",
};

const TITLE: Record<NotificationType, string> = {
  MEAL: "Meal Reminder",
  EXERCISE: "Exercise Reminder",
  SLEEP: "Sleep Reminder",
  MEDICATION: "Medication Reminder",
};

const ACTION_HINT: Record<NotificationType, string> = {
  MEAL: "Time to eat! Log it when done ✅",
  EXERCISE: "Time to work out! Mark complete when done 💪",
  SLEEP: "Wind down and prepare for sleep 🌙",
  MEDICATION: "Take your medication now. Log it when done 💊",
};

export const sendNotification = async ({
  telegramChatId,
  type,
  linkedTo,
  extraMessage,
}: NotificationPayload): Promise<void> => {
  if (!telegramChatId) {
    console.warn(`[Telegram] No chatId for notification type=${type} linkedTo=${linkedTo}`);
    return;
  }

  const emoji = EMOJI[type];
  const title = TITLE[type];
  const hint = ACTION_HINT[type];

  const message = [
    `${emoji} *${title}*`,
    ``,
    `📌 *${linkedTo}*`,
    ``,
    hint,
    extraMessage ? `\n${extraMessage}` : "",
  ]
    .filter((line) => line !== undefined)
    .join("\n")
    .trim();

  try {
    await bot.sendMessage(telegramChatId, message, {
      parse_mode: "Markdown",
    });
    console.log(`[Telegram] Sent ${type} notification to ${telegramChatId}`);
  } catch (err: any) {
    console.error(`[Telegram] Failed to send to ${telegramChatId}:`, err.message);
  }
};

// Medication-specific notification (richer)
export const sendMedicationNotification = async (
  telegramChatId: string | null | undefined,
  medicationName: string,
  dosage: string,
  scheduledAt: Date
): Promise<void> => {
  if (!telegramChatId) return;

  const time = scheduledAt.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const message = [
    `💊 *Medication Reminder*`,
    ``,
    `📌 *${medicationName}*`,
    `💉 Dosage: ${dosage}`,
    `⏰ Scheduled: ${time}`,
    ``,
    `Please take your medication now and log it. ✅`,
  ].join("\n");

  try {
    await bot.sendMessage(telegramChatId, message, { parse_mode: "Markdown" });
    console.log(`[Telegram] Sent medication notification to ${telegramChatId}`);
  } catch (err: any) {
    console.error(`[Telegram] Failed to send medication notification:`, err.message);
  }
};

// Test notification function
export const sendTestNotification = async (telegramChatId: string): Promise<void> => {
  const message = [
    `🔔 *Test Notification*`,
    ``,
    `Your Telegram bot is working correctly! ✅`,
    ``,
    `You will receive real notifications for:`,
    `• Meals 🍽️`,
    `• Exercise 🏋️`,
    `• Sleep 😴`,
    `• Medications 💊`,
  ].join("\n");

  try {
    await bot.sendMessage(telegramChatId, message, { parse_mode: "Markdown" });
    console.log(`[Telegram] Sent test notification to ${telegramChatId}`);
  } catch (err: any) {
    console.error(`[Telegram] Failed to send test notification:`, err.message);
  }
};