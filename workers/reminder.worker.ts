import { Worker } from "bullmq"
import connection from "@/lib/queue/connection"
import { autoSkipQueue } from "@/lib/queue/queues"
import type { ReminderNotificationJobData, AutoSkipJobData } from "@/lib/queue/jobs.types"
import prisma from "@/lib/db"
import { sendReminderNotification, type ReminderType } from "@/lib/telegram/notifications"

const AUTO_SKIP_DELAY_MS = 15 * 60 * 1000

const reminderNotificationWorker = new Worker<ReminderNotificationJobData>(
  "reminder-notification",
  async (job) => {
    const { reminderId, userId, type, linkedTo, telegramChatId } = job.data

    console.log(`[ReminderWorker] Processing reminder ${reminderId} (${type}: ${linkedTo})`)

    // ── Step 1: Mark as SENT ─────────────────────────────────────────────────
    const reminder = await prisma.reminder.update({
      where: { id: reminderId },
      data: { status: "SENT", sentAt: new Date() },
    })

    if (!reminder) {
      console.warn(`[ReminderWorker] Reminder ${reminderId} not found, skipping`)
      return
    }

    // ── Step 2: Send Telegram notification ───────────────────────────────────
    await sendReminderNotification({
      telegramChatId,
      type: type as ReminderType,
      linkedTo,
    })

    // ── Step 3: Queue auto-skip job after 15 minutes ─────────────────────────
    const autoSkipData: AutoSkipJobData = { reminderId }

    await autoSkipQueue.add("auto-skip-reminder", autoSkipData, {
      delay: AUTO_SKIP_DELAY_MS,
      jobId: `auto-skip-${reminderId}-${new Date().toDateString()}`,
    })

    console.log(`[ReminderWorker] Reminder ${reminderId} sent. Auto-skip queued in 15 min.`)
  },
  { connection }
)

reminderNotificationWorker.on("completed", (job) => {
  console.log(`[ReminderWorker] Job ${job.id} completed`)
})

reminderNotificationWorker.on("failed", (job, err) => {
  console.error(`[ReminderWorker] Job ${job?.id} failed:`, err.message)
})

export default reminderNotificationWorker