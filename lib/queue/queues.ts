import { Queue } from "bullmq"
import connection from "./connection"

// Fires at each reminder's scheduled time → sends notification
export const reminderNotificationQueue = new Queue("reminder-notification", {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 200,
  },
})

// Fires 15 minutes after notification → auto-skips if user hasn't acted
export const autoSkipQueue = new Queue("auto-skip", {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 200,
  },
})

// Cron job — runs at midnight daily to schedule that day's reminders
export const dailySchedulerQueue = new Queue("daily-scheduler", {
  connection,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 50,
  },
})