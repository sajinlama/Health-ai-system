import { Worker } from "bullmq"
import connection from "@/lib/queue/connection"
import { autoSkipQueue } from "@/lib/queue/queues"
import type { ReminderNotificationJobData, AutoSkipJobData } from "@/lib/queue/jobs.types"
import prisma from "@/lib/db"

const AUTO_SKIP_DELAY_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Fires at the reminder's scheduled time.
 *
 * Steps:
 * 1. Mark reminder as SENT in the database
 * 2. Send Telegram notification (placeholder — will be wired later)
 * 3. Queue an auto-skip job to fire in 15 minutes
 */
const reminderNotificationWorker = new Worker<ReminderNotificationJobData>(
  "reminder-notification",
  async (job) => {
    const { reminderId, userId, type, linkedTo, telegramChatId } = job.data

    console.log(`[ReminderWorker] Processing reminder ${reminderId} (${type}: ${linkedTo})`)

    // ── Step 1: Mark as SENT ─────────────────────────────────────────────────
    const reminder = await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    })

    // Guard: if it was already completed/skipped somehow, do nothing
    if (!reminder) {
      console.warn(`[ReminderWorker] Reminder ${reminderId} not found, skipping`)
      return
    }

    // ── Step 2: Send Telegram notification (placeholder) ─────────────────────
    await sendTelegramNotification({ telegramChatId, type, linkedTo })

    // ── Step 3: Queue auto-skip job after 15 minutes ─────────────────────────
    const autoSkipData: AutoSkipJobData = { reminderId }

    await autoSkipQueue.add("auto-skip-reminder", autoSkipData, {
      delay: AUTO_SKIP_DELAY_MS,
      jobId: `auto-skip-${reminderId}-${new Date().toDateString()}`,
    })

    console.log(
      `[ReminderWorker] Reminder ${reminderId} sent. Auto-skip queued in 15 min.`
    )
  },
  { connection }
)

// ─── Telegram Placeholder ──────────────────────────────────────────────────────

async function sendTelegramNotification({
  telegramChatId,
  type,
  linkedTo,
}: {
  telegramChatId: string | null
  type: string
  linkedTo: string
}) {
  if (!telegramChatId) {
    console.log("[Telegram] No chatId configured for this user, skipping")
    return
  }

  // TODO: Wire Telegram bot here
  // Example:
  // await bot.sendMessage(telegramChatId, `⏰ Reminder: ${type} — ${linkedTo}`)
  console.log(
    `[Telegram] Would notify chatId=${telegramChatId}: [${type}] ${linkedTo}`
  )
}

// ─── Events ───────────────────────────────────────────────────────────────────

reminderNotificationWorker.on("completed", (job) => {
  console.log(`[ReminderWorker] Job ${job.id} completed`)
})

reminderNotificationWorker.on("failed", (job, err) => {
  console.error(`[ReminderWorker] Job ${job?.id} failed:`, err.message)
})

export default reminderNotificationWorker