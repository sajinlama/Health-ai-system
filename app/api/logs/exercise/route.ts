import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const userId = session.user.id
  const searchParams = req.nextUrl.searchParams
  const dateParam = searchParams.get("date")
  const weekParam = searchParams.get("week") === "true"

  let startDate: Date
  let endDate: Date

  if (weekParam) {
    const today = new Date()
    const day = today.getDay()
    const diff = day === 0 ? 6 : day - 1
    startDate = new Date(today)
    startDate.setDate(today.getDate() - diff)
    startDate.setHours(0, 0, 0, 0)
    
    endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)
  } else if (dateParam) {
    startDate = new Date(dateParam)
    startDate.setHours(0, 0, 0, 0)
    endDate = new Date(dateParam)
    endDate.setHours(23, 59, 59, 999)
  } else {
    startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    endDate = new Date()
    endDate.setHours(23, 59, 59, 999)
  }

  const exerciseLogs = await prisma.exerciseLog.findMany({
    where: {
      userId,
      scheduledTime: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      exercisePlan: {
        select: {
          exerciseName: true,
          exerciseType: true,
          duration: true,
          instructions: true,
        },
      },
    },
    orderBy: { scheduledTime: "asc" },
  })

  return Response.json({
    logs: exerciseLogs,
    dateRange: { startDate, endDate },
    summary: {
      total: exerciseLogs.length,
      completed: exerciseLogs.filter(l => l.status === "DONE").length,
      pending: exerciseLogs.filter(l => l.status === "PENDING").length,
      skipped: exerciseLogs.filter(l => l.status === "SKIPPED").length,
      totalDuration: exerciseLogs
        .filter(l => l.status === "DONE")
        .reduce((sum, l) => sum + (l.exercisePlan?.duration || 0), 0),
    },
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const userId = session.user.id
  const { logId, status } = await req.json()

  if (!logId || !status) {
    return Response.json({ error: "Missing required fields" }, { status: 400 })
  }

  const log = await prisma.exerciseLog.findFirst({
    where: { id: logId, userId },
  })

  if (!log) {
    return Response.json({ error: "Log not found" }, { status: 404 })
  }

  const updated = await prisma.exerciseLog.update({
    where: { id: logId },
    data: { status: status === "DONE" ? "DONE" : "SKIPPED" },
    include: { exercisePlan: true },
  })

  return Response.json({ log: updated })
}