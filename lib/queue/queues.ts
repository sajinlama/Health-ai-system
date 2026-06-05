import { Queue } from "bullmq"
import connection from "./connection"

// ─── Queue Definitions ────────────────────────────────────────────────────────

/**
 * Queue for sending notifications (meal, exercise, sleep, medication)
 * Replaces the old reminder-notification queue
 */
export const notificationQueue = new Queue("notification", { connection })

/**
 * Queue for daily scheduler (creates logs and schedules notifications)
 */
export const dailySchedulerQueue = new Queue("daily-scheduler", { connection })

/**
 * Queue for generating weekly reports
 */
export const weeklyReportQueue = new Queue("weekly-report", { connection })

// ─── Removed Queues (no longer needed) ────────────────────────────────────────

// ❌ export const reminderNotificationQueue = new Queue("reminder-notification", { connection })
// ❌ export const autoSkipQueue = new Queue("auto-skip", { connection })

// ─── Helper function to get queue by name (optional) ─────────────────────────

export const getQueue = (name: string): Queue => {
  switch (name) {
    case "notification":
      return notificationQueue
    case "daily-scheduler":
      return dailySchedulerQueue
    case "weekly-report":
      return weeklyReportQueue
    default:
      throw new Error(`Unknown queue: ${name}`)
  }
}