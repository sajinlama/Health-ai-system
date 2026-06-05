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

  const medicationLogs = await prisma.medicationLog.findMany({
    where: {
      userId,
      scheduledAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      medication: {
        select: {
          medicationName: true,
          dosage: true,
          frequency: true,
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
  })

  return Response.json({
    logs: medicationLogs,
    dateRange: { startDate, endDate },
    summary: {
      total: medicationLogs.length,
      taken: medicationLogs.filter(l => l.status === "TAKEN").length,
      pending: medicationLogs.filter(l => l.status === "PENDING").length,
      skipped: medicationLogs.filter(l => l.status === "SKIPPED").length,
      missed: medicationLogs.filter(l => l.status === "MISSED").length,
    },
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const userId = session.user.id
  const { logId, status, notes } = await req.json()

  if (!logId || !status) {
    return Response.json({ error: "Missing required fields" }, { status: 400 })
  }

  const log = await prisma.medicationLog.findFirst({
    where: { id: logId, userId },
  })

  if (!log) {
    return Response.json({ error: "Log not found" }, { status: 404 })
  }

  const data: any = { status }
  if (status === "TAKEN") {
    data.takenAt = new Date()
  }
  if (notes) {
    data.notes = notes
  }

  const updated = await prisma.medicationLog.update({
    where: { id: logId },
    data,
    include: { medication: true },
  })

  return Response.json({ log: updated })
}