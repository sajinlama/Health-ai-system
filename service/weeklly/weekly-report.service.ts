import prisma from "@/lib/db"

export const generateWeeklyReport = async (userId: string) => {
  const now = new Date()

  // Build Mon–Sun window for the past week
  const weekEnd = new Date(now)
  weekEnd.setHours(23, 59, 59, 999)

  const weekStart = new Date(weekEnd)
  weekStart.setDate(weekEnd.getDate() - 6)
  weekStart.setHours(0, 0, 0, 0)

  const [mealLogs, exerciseLogs, sleepLogs] = await Promise.all([
    prisma.mealLog.findMany({
      where: { userId, scheduledTime: { gte: weekStart, lte: weekEnd } },
      select: { status: true },
    }),
    prisma.exerciseLog.findMany({
      where: { userId, scheduledTime: { gte: weekStart, lte: weekEnd } },
      select: { status: true },
    }),
    prisma.sleepLog.findMany({
      where: { userId, sleptAt: { gte: weekStart, lte: weekEnd } },
      select: { sleptAt: true, wakeAt: true },
    }),
  ])

  const mealsPlanned   = mealLogs.length
  const mealsCompleted = mealLogs.filter((l) => l.status === "DONE").length

  const workoutsPlanned   = exerciseLogs.length
  const workoutsCompleted = exerciseLogs.filter((l) => l.status === "DONE").length

  const avgSleepHours =
    sleepLogs.length === 0
      ? 0
      : parseFloat(
          (
            sleepLogs.reduce((sum, log) => {
              const hrs =
                (log.wakeAt.getTime() - log.sleptAt.getTime()) / 3_600_000
              return sum + hrs
            }, 0) / sleepLogs.length
          ).toFixed(2)
        )

  const totalPlanned   = mealsPlanned + workoutsPlanned
  const totalCompleted = mealsCompleted + workoutsCompleted
  const adherenceScore =
    totalPlanned === 0
      ? 0
      : parseFloat(((totalCompleted / totalPlanned) * 100).toFixed(1))

  return prisma.weeklyReport.upsert({
    where: { userId_weekStart: { userId, weekStart } },
    update: {
      mealsPlanned, mealsCompleted,
      workoutsPlanned, workoutsCompleted,
      avgSleepHours, adherenceScore,
    },
    create: {
      userId, weekStart, weekEnd,
      mealsPlanned, mealsCompleted,
      workoutsPlanned, workoutsCompleted,
      avgSleepHours, adherenceScore,
    },
  })
}