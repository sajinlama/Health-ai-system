import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const userId = session.user.id

  const today = new Date()
  const startOfDay = new Date(today)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)

  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - 6)
  weekStart.setHours(0, 0, 0, 0)

  const [
    user,
    diseases,
    medications,
    goals,
    latestSnapshot,
    todayReminders,
    weekMealLogs,
    weekExerciseLogs,
    weekSleepLogs,
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
        healthInfo: { select: { hasChronicDisease: true, allergies: true, notes: true } },
      },
    }),

    prisma.disease.findMany({
      where: { userId },
      select: { diseaseType: true, diseaseName: true, diagnosedDate: true },
      orderBy: { createdAt: "desc" },
    }),

    prisma.medication.findMany({
      where: { userId },
      select: { medicationName: true, dosage: true },
    }),

    prisma.goal.findMany({
      where: { userId },
      select: { goalType: true, focusArea: true, targetWeight: true, targetDate: true, description: true },
      orderBy: { createdAt: "desc" },
      take: 1,
    }),

    prisma.userWeeklySnapshot.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { weight: true, activityLevel: true, createdAt: true },
    }),

    prisma.reminder.findMany({
      where: { userId, reminderTime: { gte: startOfDay, lte: endOfDay } },
      select: { type: true, status: true, reminderTime: true },
      orderBy: { reminderTime: "asc" },
    }),

    prisma.mealLog.findMany({
      where: { userId, scheduledTime: { gte: weekStart, lte: endOfDay } },
      select: { status: true },
    }),

    prisma.exerciseLog.findMany({
      where: { userId, scheduledTime: { gte: weekStart, lte: endOfDay } },
      select: { status: true },
    }),

    prisma.sleepLog.findMany({
      where: { userId, sleptAt: { gte: weekStart, lte: endOfDay } },
      select: { sleptAt: true, wakeAt: true, completed: true },
    }),

    prisma.weeklyReport.findFirst({
      where: { userId },
      orderBy: { weekStart: "desc" },
    }),

    prisma.aIRecommendation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { recommendationType: true, recommendation: true, createdAt: true },
    }),
  ])

  // ── Compute derived stats ────────────────────────────────────────────────
  const mealsPlanned   = weekMealLogs.length
  const mealsCompleted = weekMealLogs.filter((l) => l.status === "DONE").length

  const workoutsPlanned   = weekExerciseLogs.length
  const workoutsCompleted = weekExerciseLogs.filter((l) => l.status === "DONE").length

  const avgSleepHours =
    weekSleepLogs.length === 0
      ? 0
      : parseFloat(
          (
            weekSleepLogs.reduce((sum, log) => {
              return sum + (log.wakeAt.getTime() - log.sleptAt.getTime()) / 3_600_000
            }, 0) / weekSleepLogs.length
          ).toFixed(1)
        )

  const totalPlanned   = mealsPlanned + workoutsPlanned
  const totalCompleted = mealsCompleted + workoutsCompleted
  const adherenceScore =
    totalPlanned === 0
      ? 0
      : parseFloat(((totalCompleted / totalPlanned) * 100).toFixed(1))

  // Today's pending reminders
  const pendingToday   = todayReminders.filter((r) => r.status === "PENDING").length
  const completedToday = todayReminders.filter((r) => r.status === "COMPLETED").length

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening"

  return Response.json({
    greeting,
    user,
    diseases,
    medications,
    goals,
    latestSnapshot,
    weekStats: {
      mealsPlanned,
      mealsCompleted,
      workoutsPlanned,
      workoutsCompleted,
      avgSleepHours,
      adherenceScore,
    },
    todayReminders: {
      total: todayReminders.length,
      pending: pendingToday,
      completed: completedToday,
      items: todayReminders,
    },
    latestWeeklyReport,
    aiRecommendations,
  })
}