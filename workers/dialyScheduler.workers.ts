import { Worker } from "bullmq"
import connection from "@/lib/queue/connection"
import { reminderNotificationQueue } from "@/lib/queue/queues"
import type { ReminderNotificationJobData } from "@/lib/queue/jobs.types"
import prisma from "@/lib/db"
import { generateWeeklyReport } from "@/service/weeklly/weekly-report.service"

/**
 * Runs at midnight every day.
 *
 * Steps:
 * 1. Reset previous day's SENT/SKIPPED reminders back to PENDING
 * 2. Reset yesterday's MealLog / ExerciseLog back to PENDING so today gets fresh entries
 * 3. Create fresh MealLog, ExerciseLog, SleepLog entries for today
 * 4. Schedule delayed notification jobs for each reminder
 * 5. Every Sunday — generate weekly reports for all users
 */
const dailySchedulerWorker = new Worker(
  "daily-scheduler",
  async () => {
    const now = new Date()
    console.log(`[DailyScheduler] Running at ${now.toISOString()}`)

    // ── Step 1: Reset stale reminder statuses ────────────────────────────────
    await prisma.reminder.updateMany({
      where: { status: { in: ["SENT", "SKIPPED"] } },
      data: {
        status: "PENDING",
        sentAt: null,
        autoSkippedAt: null,
      },
    })

    // ── Step 2 + 3: Reset yesterday's logs & create fresh ones for today ─────
    await createDailyLogs(now)

    // ── Step 4: Schedule today's notification jobs ────────────────────────────
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

    // ── Step 5: Every Sunday — generate weekly reports for all users ──────────
    if (now.getDay() === 0) {
      console.log("[DailyScheduler] Sunday detected — generating weekly reports...")

      const allUsers = await prisma.user.findMany({ select: { id: true } })

      const results = await Promise.allSettled(
        allUsers.map((u) => generateWeeklyReport(u.id))
      )

      const succeeded = results.filter((r) => r.status === "fulfilled").length
      const failed    = results.filter((r) => r.status === "rejected").length

      if (failed > 0) {
        results.forEach((r, i) => {
          if (r.status === "rejected") {
            console.error(
              `[DailyScheduler] Weekly report failed for user ${allUsers[i].id}:`,
              r.reason
            )
          }
        })
      }

      console.log(
        `[DailyScheduler] Weekly reports — succeeded: ${succeeded}, failed: ${failed}`
      )
    }
  },
  { connection }
)

// ─── Create fresh logs for today ──────────────────────────────────────────────

const createDailyLogs = async (now: Date) => {
  // ── Today's window ──────────────────────────────────────────────────────────
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  // ── Yesterday's window ─────────────────────────────────────────────────────
  const startOfYesterday = new Date(startOfDay)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)
  const endOfYesterday = new Date(endOfDay)
  endOfYesterday.setDate(endOfYesterday.getDate() - 1)

  // ── FIX: Reset both yesterday's AND today's non-PENDING logs ────────────────
  // We reset today's logs too because:
  //   - Normal midnight run: clears yesterday's COMPLETED/SKIPPED logs
  //   - Startup backfill run during the day: clears today's COMPLETED logs
  //     that were left over from testing, so they get reset to PENDING
  await Promise.all([
    prisma.mealLog.updateMany({
      where: {
        scheduledTime: { gte: startOfYesterday, lte: endOfDay },
        status: { not: "PENDING" },
      },
      data: { status: "PENDING" },
    }),
    prisma.exerciseLog.updateMany({
      where: {
        scheduledTime: { gte: startOfYesterday, lte: endOfDay },
        status: { not: "PENDING" },
      },
      data: { status: "PENDING" },
    }),
  ])

  console.log("[DailyScheduler] Logs reset to PENDING (yesterday + today)")

  // ── MealLogs ────────────────────────────────────────────────────────────────
  const activePlans = await prisma.nutritionPlan.findMany({
    where: { isActive: true },
    include: { meals: true },
  })

  for (const plan of activePlans) {
    for (const meal of plan.meals) {
      const scheduledTime = new Date(now)
      scheduledTime.setHours(
        meal.mealTime.getHours(),
        meal.mealTime.getMinutes(),
        0,
        0
      )

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

  // ── ExerciseLogs ──────────────────────────────────────────────────────────
  // FIX: `{ not: undefined }` was a no-op in Prisma — fetches all plans.
  // ExercisePlan has no isActive field, so fetch all plans directly.
  const exercisePlans = await prisma.exercisePlan.findMany({})

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

  // ── SleepLogs ────────────────────────────────────────────────────────────
  const sleepSchedules = await prisma.sleepSchedule.findMany({})

  for (const schedule of sleepSchedules) {
    const sleptAt = new Date(now)
    sleptAt.setHours(
      schedule.bedTime.getHours(),
      schedule.bedTime.getMinutes(),
      0,
      0
    )

    const wakeAt = new Date(now)
    wakeAt.setHours(
      schedule.wakeTime.getHours(),
      schedule.wakeTime.getMinutes(),
      0,
      0
    )

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

dailySchedulerWorker.on("completed", (job) => {
  console.log(`[DailyScheduler] Job ${job.id} completed successfully`)
})

dailySchedulerWorker.on("failed", (job, err) => {
  console.error(`[DailyScheduler] Job ${job?.id} failed:`, err.message)
})

export default dailySchedulerWorker