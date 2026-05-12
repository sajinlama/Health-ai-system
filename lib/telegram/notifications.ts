import bot from "./bot"

export type ReminderType = "MEAL" | "EXERCISE" | "SLEEP" | "MEDICATION"

const EMOJI: Record<ReminderType, string> = {
  MEAL:       "🍽️",
  EXERCISE:   "🏋️",
  SLEEP:      "😴",
  MEDICATION: "💊",
}

const LABEL: Record<ReminderType, string> = {
  MEAL:       "Meal Reminder",
  EXERCISE:   "Workout Reminder",
  SLEEP:      "Sleep Reminder",
  MEDICATION: "Medication Reminder",
}

export async function sendReminderNotification({
  telegramChatId,
  type,
  linkedTo,
}: {
  telegramChatId: string | null
  type: ReminderType
  linkedTo: string
}): Promise<void> {
  if (!telegramChatId) {
    console.log("[Telegram] No chatId configured for this user, skipping")
    return
  }

  const emoji = EMOJI[type] ?? "⏰"
  const label = LABEL[type] ?? "Reminder"

  const message = [
    `${emoji} *${label}*`,
    ``,
    `It's time for: *${linkedTo}*`,
    ``,
    `_Reply ✅ to mark as done or it will be auto-skipped in 15 minutes._`,
  ].join("\n")

  try {
    await bot.sendMessage(telegramChatId, message, {
      parse_mode: "Markdown",
    })
    console.log(`[Telegram] Sent ${type} reminder to chatId=${telegramChatId}`)
  } catch (err: any) {
    // Don't crash the worker if Telegram fails
    console.error(
      `[Telegram] Failed to send to chatId=${telegramChatId}:`,
      err?.response?.body ?? err.message
    )
  }
}

export async function sendWeeklyReportNotification({
  telegramChatId,
  adherenceScore,
  mealsCompleted,
  mealsPlanned,
  workoutsCompleted,
  workoutsPlanned,
  avgSleepHours,
}: {
  telegramChatId: string | null
  adherenceScore: number
  mealsCompleted: number
  mealsPlanned: number
  workoutsCompleted: number
  workoutsPlanned: number
  avgSleepHours: number
}): Promise<void> {
  if (!telegramChatId) return

  const score = Math.round(adherenceScore * 100)
  const scoreEmoji = score >= 80 ? "🌟" : score >= 50 ? "💪" : "📈"

  const message = [
    `📊 *Your Weekly Health Report*`,
    ``,
    `${scoreEmoji} *Adherence Score: ${score}%*`,
    ``,
    `🍽️ Meals:    ${mealsCompleted}/${mealsPlanned} completed`,
    `🏋️ Workouts: ${workoutsCompleted}/${workoutsPlanned} completed`,
    `😴 Avg Sleep: ${avgSleepHours.toFixed(1)} hrs/night`,
    ``,
    `Keep it up — consistency is everything! 💙`,
  ].join("\n")

  try {
    await bot.sendMessage(telegramChatId, message, { parse_mode: "Markdown" })
    console.log(`[Telegram] Sent weekly report to chatId=${telegramChatId}`)
  } catch (err: any) {
    console.error(`[Telegram] Weekly report send failed:`, err?.response?.body ?? err.message)
  }
}