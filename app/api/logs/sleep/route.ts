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

  const sleepLogs = await prisma.sleepLog.findMany({
    where: {
      userId,
      sleptAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { sleptAt: "desc" },
  })

  // Calculate sleep duration for each log
  const logsWithDuration = sleepLogs.map(log => ({
    ...log,
    durationHours: (log.wakeAt.getTime() - log.sleptAt.getTime()) / 3_600_000,
  }))

  const totalSleepHours = logsWithDuration.reduce((sum, log) => sum + log.durationHours, 0)

  return Response.json({
    logs: logsWithDuration,
    dateRange: { startDate, endDate },
    summary: {
      total: sleepLogs.length,
      completed: sleepLogs.filter(l => l.completed).length,
      totalHours: totalSleepHours.toFixed(1),
      avgHours: sleepLogs.length > 0 ? (totalSleepHours / sleepLogs.length).toFixed(1) : 0,
    },
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const userId = session.user.id
  const { sleptAt, wakeAt, completed, logId } = await req.json()

  if (logId) {
    // Update existing log
    const updated = await prisma.sleepLog.update({
      where: { id: logId },
      data: { sleptAt: new Date(sleptAt), wakeAt: new Date(wakeAt), completed },
    })
    return Response.json({ log: updated })
  }

  // Create new log
  const newLog = await prisma.sleepLog.create({
    data: {
      userId,
      sleptAt: new Date(sleptAt),
      wakeAt: new Date(wakeAt),
      completed: completed || true,
    },
  })

  return Response.json({ log: newLog })
}