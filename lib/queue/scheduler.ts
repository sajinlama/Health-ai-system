import { dailySchedulerQueue } from "./queues"

/**
 * Called once on app startup.
 * Registers a repeatable cron job that runs at midnight every day.
 * The actual scheduling logic lives in the daily-scheduler worker.
 */
export const initDailyScheduler = async () => {
  // Remove any stale repeatable jobs before re-registering
  const repeatableJobs = await dailySchedulerQueue.getRepeatableJobs()
  for (const job of repeatableJobs) {
    await dailySchedulerQueue.removeRepeatableByKey(job.key)
  }

  await dailySchedulerQueue.add(
    "run-daily-scheduler",
    {},
    {
      repeat: { pattern: "0 0 * * *" }, // midnight every day
      jobId: "daily-reminder-scheduler",
    }
  )

  console.log("[Scheduler] Daily reminder scheduler registered (runs at midnight)")
}