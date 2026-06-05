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
    weekMedicationLogs,
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
      where: { userId, isActive: true },
      select: { id: true, medicationName: true, dosage: true, frequency: true, scheduledTimes: true },
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

    // Medication logs for the past 7 days
    prisma.medicationLog.findMany({
      where: { userId, scheduledAt: { gte: weekStart, lte: endOfToday } },
      select: { status: true, scheduledAt: true },
      orderBy: { scheduledAt: "asc" },
    }),

    // Today's medication logs
    prisma.medicationLog.findMany({
      where: {
        userId,
        scheduledAt: { gte: startOfToday, lte: endOfToday },
      },
      select: { status: true, scheduledAt: true, medication: { select: { medicationName: true } } },
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
    const logs = weekExerciseLogs.filter((l) => {
      const logDay = new Date(l.scheduledTime)
      return (
        logDay.getDate() === day.getDate() &&
        logDay.getMonth() === day.getMonth()
      )
    })
    const completed = logs.filter(l => l.status === "DONE").length
    const total = logs.length
    return {
      day: dayLabel,
      completed,
      total,
      completionRate: total === 0 ? 0 : (completed / total) * 100,
    }
  })

  // ── Derived: medication adherence per day ─────────────────────────────────
  const medicationByDay = last7Days.map((day) => {
    const dayLabel = day.toLocaleDateString("en-US", { weekday: "short" })
    const logs = weekMedicationLogs.filter((l) => {
      const logDay = new Date(l.scheduledAt)
      return (
        logDay.getDate() === day.getDate() &&
        logDay.getMonth() === day.getMonth()
      )
    })
    const taken = logs.filter(l => l.status === "TAKEN").length
    const total = logs.length
    return {
      day: dayLabel,
      taken,
      total,
      adherenceRate: total === 0 ? 100 : (taken / total) * 100,
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

  const mealsPlanned = weekMealLogs.length
  const mealsCompleted = weekMealLogs.filter((l) => l.status === "DONE").length

  const workoutsPlanned = weekExerciseLogs.length
  const workoutsCompleted = weekExerciseLogs.filter((l) => l.status === "DONE").length

  const medsPlanned = weekMedicationLogs.length
  const medsTaken = weekMedicationLogs.filter((l) => l.status === "TAKEN").length

  const totalPlanned = mealsPlanned + workoutsPlanned + medsPlanned
  const totalCompleted = mealsCompleted + workoutsCompleted + medsTaken
  const adherenceScore =
    totalPlanned === 0
      ? 0
      : parseFloat(((totalCompleted / totalPlanned) * 100).toFixed(1))

  // Today's medication stats
  const medsToday = todayReminders.length
  const medsTakenToday = todayReminders.filter((r) => r.status === "TAKEN").length

  // Health score (0–10) — weighted formula
  const sleepScore = Math.min((avgSleepHours / sleepTarget) * 10, 10)
  const adherenceScore10 = (adherenceScore / 100) * 10
  const medScore = medsToday === 0 ? 10 : (medsTakenToday / medsToday) * 10
  const healthScore = parseFloat(((sleepScore * 0.3 + adherenceScore10 * 0.4 + medScore * 0.3)).toFixed(1))

  // Calculate BMI
  const bmi = user?.weight && user?.height
    ? parseFloat((user.weight / Math.pow(user.height / 100, 2)).toFixed(1))
    : null

  // BMI category
  let bmiCategory = ""
  if (bmi) {
    if (bmi < 18.5) bmiCategory = "Underweight"
    else if (bmi < 25) bmiCategory = "Normal weight"
    else if (bmi < 30) bmiCategory = "Overweight"
    else bmiCategory = "Obese"
  }

  return Response.json({
    user: {
      ...user,
      bmi,
      bmiCategory,
    },
    diseases,
    medications,
    goals,
    sleepByDay,
    exerciseByDay,
    medicationByDay,
    weekStats: {
      mealsPlanned,
      mealsCompleted,
      workoutsPlanned,
      workoutsCompleted,
      medsPlanned,
      medsTaken,
      avgSleepHours,
      sleepTarget,
      adherenceScore,
      mealCompletionRate: mealsPlanned === 0 ? 0 : (mealsCompleted / mealsPlanned) * 100,
      workoutCompletionRate: workoutsPlanned === 0 ? 0 : (workoutsCompleted / workoutsPlanned) * 100,
      medCompletionRate: medsPlanned === 0 ? 100 : (medsTaken / medsPlanned) * 100,
    },
    todayMeds: {
      total: medsToday,
      taken: medsTakenToday,
      completionRate: medsToday === 0 ? 100 : (medsTakenToday / medsToday) * 100,
    },
    healthScore,
    latestWeeklyReport,
    aiRecommendations,
  })
}