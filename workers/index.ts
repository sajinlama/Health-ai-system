/**
 * Worker entry point.
 *
 * Run this as a separate process alongside your Next.js app:
 *   npx ts-node workers/index.ts
 *   OR add to package.json:
 *   "worker": "ts-node workers/index.ts"
 *
 * This keeps long-running BullMQ workers out of the serverless Next.js process.
 */

import "dotenv/config"

// FIX: Lock the process timezone before anything else runs.
// Without this, date boundary calculations (startOfDay, endOfDay) can
// silently drift if the server OS timezone differs from your DB timezone,
// causing the `existing` log check to span the wrong 24-hour window.
// Change "Asia/Kolkata" to match your server/DB timezone.
process.env.TZ = "Asia/Kolkata"

import { initDailyScheduler } from "@/lib/queue/scheduler"
import dailySchedulerWorker from "./dialyScheduler.workers"
import reminderNotificationWorker from "./reminder.worker"
import autoSkipWorker from "./autoskip.worker"

const bootstrap = async () => {
  console.log("[Workers] Starting all workers...")

  // Register the midnight cron job (also fires an immediate backfill job)
  await initDailyScheduler()

  // Workers are already instantiated by importing them above.
  console.log("[Workers] daily-scheduler       ✓")
  console.log("[Workers] reminder-notification  ✓")
  console.log("[Workers] auto-skip             ✓")
  console.log("[Workers] All workers running. Waiting for jobs...")
}

bootstrap().catch((err) => {
  console.error("[Workers] Fatal error during startup:", err)
  process.exit(1)
})

// ─── Graceful shutdown ────────────────────────────────────────────────────────

const shutdown = async () => {
  console.log("[Workers] Shutting down...")
  await Promise.all([
    dailySchedulerWorker.close(),
    reminderNotificationWorker.close(),
    autoSkipWorker.close(),
  ])
  process.exit(0)
}

process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)