import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// GET /api/weekly-report — fetch latest or all weekly reports
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const { searchParams } = new URL(req.url)
  const latest = searchParams.get("latest") === "true"

  if (latest) {
    const report = await prisma.weeklyReport.findFirst({
      where: { userId: session.user.id },
      orderBy: { weekStart: "desc" },
    })
    return Response.json(report)
  }

  const reports = await prisma.weeklyReport.findMany({
    where: { userId: session.user.id },
    orderBy: { weekStart: "desc" },
  })
  return Response.json(reports)
}

// POST /api/weekly-report — create or update a weekly report
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const body = await req.json()

  const {
    weekStart,
    weekEnd,
    mealsPlanned,
    mealsCompleted,
    workoutsPlanned,
    workoutsCompleted,
    avgSleepHours,
    adherenceScore,
  } = body

  // Upsert — unique constraint is [userId, weekStart]
  const report = await prisma.weeklyReport.upsert({
    where: {
      userId_weekStart: {
        userId: session.user.id,
        weekStart: new Date(weekStart),
      },
    },
    update: {
      weekEnd: new Date(weekEnd),
      mealsPlanned,
      mealsCompleted,
      workoutsPlanned,
      workoutsCompleted,
      avgSleepHours,
      adherenceScore,
    },
    create: {
      userId: session.user.id,
      weekStart: new Date(weekStart),
      weekEnd: new Date(weekEnd),
      mealsPlanned,
      mealsCompleted,
      workoutsPlanned,
      workoutsCompleted,
      avgSleepHours,
      adherenceScore,
    },
  })

  return Response.json(report)
}