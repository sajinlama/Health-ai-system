import { Worker } from "bullmq"
import connection from "@/lib/queue/connection"
import { reminderNotificationQueue } from "@/lib/queue/queues"
import type { ReminderNotificationJobData } from "@/lib/queue/jobs.types"
import prisma from "@/lib/db"

/**
 * Runs at midnight every day.
 *
 * Steps:
 * 1. Reset previous day's SENT/SKIPPED reminders back to PENDING
 * 2. Create fresh MealLog, ExerciseLog, SleepLog entries for today
 * 3. Schedule delayed notification jobs for each reminder
 */
const dailySchedulerWorker = new Worker(
  "daily-scheduler",
  async () => {
    const now = new Date()
    console.log(`[DailyScheduler] Running at ${now.toISOString()}`)

    // ── Step 1: Reset stale reminder statuses from yesterday ─────────────────
    await prisma.reminder.updateMany({
      where: { status: { in: ["SENT", "SKIPPED"] } },
      data: {
        status: "PENDING",
        sentAt: null,
        completedAt: null,
        autoSkippedAt: null,
      },
    })

    // ── Step 2: Create fresh logs for today ───────────────────────────────────
    await createDailyLogs(now)

    // ── Step 3: Schedule today's notification jobs ────────────────────────────
    const reminders = await prisma.reminder.findMany({
      where: { status: "PENDING" },
      include: {
        user: { select: { telegramChatId: true } },
      },
    })

    let scheduled = 0
    let skipped = 0

    for (const reminder of reminders) {
      const hours = reminder.reminderTime.getHours()
      const minutes = reminder.reminderTime.getMinutes()

      const todayTarget = new Date()
      todayTarget.setHours(hours, minutes, 0, 0)

      if (todayTarget <= now) {
        skipped++
        continue
      }

      const delay = todayTarget.getTime() - now.getTime()

      const jobData: ReminderNotificationJobData = {
        reminderId: reminder.id,
        userId: reminder.userId,
        type: reminder.type as ReminderNotificationJobData["type"],
        linkedTo: (reminder.taskData as { linkedTo: string }).linkedTo ?? "",
        telegramChatId: reminder.user.telegramChatId,
      }

      await reminderNotificationQueue.add("send-reminder", jobData, {
        delay,
        jobId: `reminder-${reminder.id}-${now.toDateString()}`,
      })

      scheduled++
    }

    console.log(
      `[DailyScheduler] Done — scheduled: ${scheduled}, skipped (past): ${skipped}`
    )
  },
  { connection }
)

// ─── Create fresh logs for today ──────────────────────────────────────────────

const createDailyLogs = async (now: Date) => {
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  // ── MealLogs ────────────────────────────────────────────────────────────────
  // Get all active nutrition plans and their meals
  const activePlans = await prisma.nutritionPlan.findMany({
    where: { isActive: true },
    include: { meals: true },
  })

  for (const plan of activePlans) {
    for (const meal of plan.meals) {
      // Build today's scheduled time from meal's HH:MM
      const scheduledTime = new Date(now)
      scheduledTime.setHours(
        meal.mealTime.getHours(),
        meal.mealTime.getMinutes(),
        0,
        0
      )

      // Avoid duplicates — only create if no log exists for this meal today
      const existing = await prisma.mealLog.findFirst({
        where: {
          userId: plan.userId,
          mealId: meal.id,
          scheduledTime: { gte: startOfDay, lte: endOfDay },
        },
      })

      if (!existing) {
        await prisma.mealLog.create({
          data: {
            userId: plan.userId,
            mealId: meal.id,
            status: "PENDING",
            scheduledTime,
          },
        })
      }
    }
  }

  // ── ExerciseLogs ─────────────────────────────────────────────────────────────
  const exercisePlans = await prisma.exercisePlan.findMany({
    where: { userId: { not: undefined } },
  })

  for (const plan of exercisePlans) {
    const scheduledTime = new Date(now)
    scheduledTime.setHours(
      plan.scheduledTime.getHours(),
      plan.scheduledTime.getMinutes(),
      0,
      0
    )

    const existing = await prisma.exerciseLog.findFirst({
      where: {
        userId: plan.userId,
        exercisePlanId: plan.id,
        scheduledTime: { gte: startOfDay, lte: endOfDay },
      },
    })

    if (!existing) {
      await prisma.exerciseLog.create({
        data: {
          userId: plan.userId,
          exercisePlanId: plan.id,
          status: "PENDING",
          scheduledTime,
        },
      })
    }
  }

  // ── SleepLogs ────────────────────────────────────────────────────────────────
  // Create a placeholder SleepLog for tonight's target sleep window
  const sleepSchedules = await prisma.sleepSchedule.findMany({})

  for (const schedule of sleepSchedules) {
    const sleptAt = new Date(now)
    sleptAt.setHours(schedule.bedTime.getHours(), schedule.bedTime.getMinutes(), 0, 0)

    const wakeAt = new Date(now)
    wakeAt.setHours(schedule.wakeTime.getHours(), schedule.wakeTime.getMinutes(), 0, 0)

    // Avoid duplicates — check if a sleep log already exists for tonight
    const existing = await prisma.sleepLog.findFirst({
      where: {
        userId: schedule.userId,
        sleptAt: { gte: startOfDay, lte: endOfDay },
      },
    })

    if (!existing) {
      await prisma.sleepLog.create({
        data: {
          userId: schedule.userId,
          sleptAt,
          wakeAt,
          completed: false,
        },
      })
    }
  }

  console.log("[DailyScheduler] Fresh logs created for today")
}

// ─── Events ───────────────────────────────────────────────────────────────────

dailySchedulerWorker.on("failed", (job, err) => {
  console.error(`[DailyScheduler] Job ${job?.id} failed:`, err.message)
})

export default dailySchedulerWorker