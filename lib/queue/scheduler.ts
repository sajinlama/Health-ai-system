import { dailySchedulerQueue } from "./queues"

/**
 * Called once on app startup.
 * Registers a repeatable cron job that runs at midnight every day.
 *
 * FIX: Also fires one immediate job on startup so that if the server
 * restarts after midnight (but before the next midnight), logs are still
 * created and reminders are still scheduled for the current day.
 */
export const initDailyScheduler = async () => {
  // Remove any stale repeatable jobs before re-registering
  const repeatableJobs = await dailySchedulerQueue.getRepeatableJobs()
  for (const job of repeatableJobs) {
    await dailySchedulerQueue.removeRepeatableByKey(job.key)
  }

  // Register the midnight cron
  await dailySchedulerQueue.add(
    "run-daily-scheduler",
    {},
    {
      repeat: { pattern: "0 0 * * *" }, // midnight every day
      jobId: "daily-reminder-scheduler",
    }
  )

  // FIX: Fire an immediate job on startup so logs & reminders are always
  // created even if the server restarts during the day after midnight.
  // Uses Date.now() in jobId to avoid deduplication conflicts.
  await dailySchedulerQueue.add(
    "run-daily-scheduler-startup",
    {},
    {
      jobId: `daily-scheduler-startup-${Date.now()}`,
    }
  )

  console.log("[Scheduler] Daily reminder scheduler registered (runs at midnight)")
  console.log("[Scheduler] Startup backfill job queued")
}