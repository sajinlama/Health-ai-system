import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const userId = session.user.id
  const now = new Date()

  // ── Time windows ──────────────────────────────────────────────────────────
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const endOfToday = new Date(now)
  endOfToday.setHours(23, 59, 59, 999)

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 6)
  weekStart.setHours(0, 0, 0, 0)

  // ── Parallel queries ──────────────────────────────────────────────────────
  const [
    user,
    diseases,
    medications,
    goals,
    weekSleepLogs,
    weekExerciseLogs,
    weekMealLogs,
    todayReminders,
    latestWeeklyReport,
    aiRecommendations,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        fullName: true,
        weight: true,
        height: true,
        activityLevel: true,
        healthInfo: {
          select: { hasChronicDisease: true, allergies: true, notes: true },
        },
        sleepSchedules: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { targetHours: true, bedTime: true, wakeTime: true },
        },
      },
    }),

    prisma.disease.findMany({
      where: { userId },
      select: { diseaseType: true, diseaseName: true, diagnosedDate: true },
      orderBy: { createdAt: "desc" },
    }),

    prisma.medication.findMany({
      where: { userId },
      select: { id: true, medicationName: true, dosage: true },
    }),

    prisma.goal.findMany({
      where: { userId },
      select: {
        goalType: true,
        focusArea: true,
        targetWeight: true,
        targetDate: true,
        description: true,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),

    // Sleep logs for the past 7 days
    prisma.sleepLog.findMany({
      where: { userId, sleptAt: { gte: weekStart, lte: endOfToday } },
      select: { sleptAt: true, wakeAt: true, completed: true },
      orderBy: { sleptAt: "asc" },
    }),

    // Exercise logs for the past 7 days
    prisma.exerciseLog.findMany({
      where: { userId, scheduledTime: { gte: weekStart, lte: endOfToday } },
      select: { status: true, scheduledTime: true },
      orderBy: { scheduledTime: "asc" },
    }),

    // Meal logs for the past 7 days
    prisma.mealLog.findMany({
      where: { userId, scheduledTime: { gte: weekStart, lte: endOfToday } },
      select: { status: true, scheduledTime: true },
      orderBy: { scheduledTime: "asc" },
    }),

    // Today's reminders
    prisma.reminder.findMany({
      where: {
        userId,
        reminderTime: { gte: startOfToday, lte: endOfToday },
      },
      select: { type: true, status: true, reminderTime: true },
      orderBy: { reminderTime: "asc" },
    }),

    prisma.weeklyReport.findFirst({
      where: { userId },
      orderBy: { weekStart: "desc" },
    }),

    prisma.aIRecommendation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { recommendationType: true, recommendation: true, createdAt: true },
    }),
  ])

  // ── Derived: sleep per day (last 7 days) ─────────────────────────────────
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const sleepByDay = last7Days.map((day) => {
    const dayLabel = day.toLocaleDateString("en-US", { weekday: "short" })
    const log = weekSleepLogs.find((l) => {
      const logDay = new Date(l.sleptAt)
      return (
        logDay.getDate() === day.getDate() &&
        logDay.getMonth() === day.getMonth()
      )
    })
    const hours = log
      ? parseFloat(
          ((new Date(log.wakeAt).getTime() - new Date(log.sleptAt).getTime()) / 3_600_000).toFixed(1)
        )
      : 0
    return { day: dayLabel, hours }
  })

  // ── Derived: exercise per day ─────────────────────────────────────────────
  const exerciseByDay = last7Days.map((day) => {
    const dayLabel = day.toLocaleDateString("en-US", { weekday: "short" })
    const log = weekExerciseLogs.find((l) => {
      const logDay = new Date(l.scheduledTime)
      return (
        logDay.getDate() === day.getDate() &&
        logDay.getMonth() === day.getMonth()
      )
    })
    return {
      day: dayLabel,
      completed: log?.status === "DONE" ? 1 : 0,
      status: log?.status ?? null,
    }
  })

  // ── Aggregates ────────────────────────────────────────────────────────────
  const avgSleepHours =
    weekSleepLogs.length === 0
      ? 0
      : parseFloat(
          (
            weekSleepLogs.reduce((sum, l) => {
              return (
                sum +
                (new Date(l.wakeAt).getTime() - new Date(l.sleptAt).getTime()) /
                  3_600_000
              )
            }, 0) / weekSleepLogs.length
          ).toFixed(1)
        )

  const sleepTarget = user?.sleepSchedules?.[0]?.targetHours ?? 7.5

  const mealsPlanned   = weekMealLogs.length
  const mealsCompleted = weekMealLogs.filter((l) => l.status === "DONE").length

  const workoutsPlanned   = weekExerciseLogs.length
  const workoutsCompleted = weekExerciseLogs.filter((l) => l.status === "DONE").length

  const totalPlanned   = mealsPlanned + workoutsPlanned
  const totalCompleted = mealsCompleted + workoutsCompleted
  const adherenceScore =
    totalPlanned === 0
      ? 0
      : parseFloat(((totalCompleted / totalPlanned) * 100).toFixed(1))

  // Today's medication reminders
  const medRemindersToday  = todayReminders.filter((r) => r.type === "MEDICATION")
  const medCompletedToday  = medRemindersToday.filter((r) => r.status === "COMPLETED").length

  // Health score (0–10) — weighted formula
  const sleepScore      = Math.min((avgSleepHours / sleepTarget) * 10, 10)
  const adherenceScore10 = (adherenceScore / 100) * 10
  const medScore        = medRemindersToday.length === 0 ? 10 : (medCompletedToday / medRemindersToday.length) * 10
  const healthScore     = parseFloat(((sleepScore * 0.3 + adherenceScore10 * 0.4 + medScore * 0.3)).toFixed(1))

  return Response.json({
    user,
    diseases,
    medications,
    goals,
    sleepByDay,
    exerciseByDay,
    weekStats: {
      mealsPlanned,
      mealsCompleted,
      workoutsPlanned,
      workoutsCompleted,
      avgSleepHours,
      sleepTarget,
      adherenceScore,
    },
    todayMeds: {
      total:     medRemindersToday.length,
      completed: medCompletedToday,
    },
    healthScore,
    latestWeeklyReport,
    aiRecommendations,
  })
}