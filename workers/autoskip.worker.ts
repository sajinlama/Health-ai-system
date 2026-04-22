import { Worker } from "bullmq"
import connection from "@/lib/queue/connection"
import type { AutoSkipJobData } from "@/lib/queue/jobs.types"
import prisma from "@/lib/db"

/**
 * Fires 15 minutes after a reminder notification was sent.
 *
 * If the reminder is still SENT (user has NOT acted):
 *   → marks Reminder as SKIPPED
 *   → marks MealLog / ExerciseLog as SKIPPED (for history tracking)
 *
 * If the user already marked it COMPLETED:
 *   → no-op (logs already updated by reminder.service.ts)
 */
const autoSkipWorker = new Worker<AutoSkipJobData>(
  "auto-skip",
  async (job) => {
    const { reminderId } = job.data

    console.log(`[AutoSkip] Checking reminder ${reminderId}`)

    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
      select: {
        status: true,
        userId: true,
        type: true,
        mealId: true,
        exercisePlanId: true,
      },
    })

    if (!reminder) {
      console.warn(`[AutoSkip] Reminder ${reminderId} not found`)
      return
    }

    // User already acted — logs are already updated, nothing to do
    if (reminder.status !== "SENT") {
      console.log(
        `[AutoSkip] Reminder ${reminderId} is already ${reminder.status}, skipping`
      )
      return
    }

    // Mark reminder SKIPPED + sync logs in parallel
    await Promise.all([
      prisma.reminder.update({
        where: { id: reminderId },
        data: {
          status: "SKIPPED",
          autoSkippedAt: new Date(),
        },
      }),
      syncLogSkipped(reminder),
    ])

    console.log(`[AutoSkip] Reminder ${reminderId} auto-skipped (logs updated)`)
  },
  { connection }
)

// ─── Sync log status to SKIPPED ───────────────────────────────────────────────

const syncLogSkipped = async (reminder: {
  userId: string
  type: string
  mealId: string | null
  exercisePlanId: string | null
}) => {
  if (reminder.type === "MEAL" && reminder.mealId) {
    await prisma.mealLog.updateMany({
      where: {
        userId: reminder.userId,
        mealId: reminder.mealId,
        status: "PENDING",
      },
      data: { status: "SKIPPED" },
    })
  }

  if (reminder.type === "EXERCISE" && reminder.exercisePlanId) {
    await prisma.exerciseLog.updateMany({
      where: {
        userId: reminder.userId,
        exercisePlanId: reminder.exercisePlanId,
        status: "PENDING",
      },
      data: { status: "SKIPPED" },
    })
  }

  // SLEEP → SleepLog has no status field, skip
  // MEDICATION → no log model in schema
}

// ─── Events ───────────────────────────────────────────────────────────────────

autoSkipWorker.on("failed", (job, err) => {
  console.error(`[AutoSkip] Job ${job?.id} failed:`, err.message)
})

export default autoSkipWorker