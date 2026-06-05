import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { NextRequest } from "next/server"

function parseDateLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const userId = session.user.id
    const searchParams = req.nextUrl.searchParams
    const dateParam = searchParams.get("date")
    const weekParam = searchParams.get("week") === "true"
    const weekStartParam = searchParams.get("weekStart")

    let startDate: Date
    let endDate: Date

    if (weekParam) {
      if (weekStartParam) {
        startDate = parseDateLocal(weekStartParam)
      } else {
        const today = new Date()
        const day = today.getDay()
        const diff = day === 0 ? 6 : day - 1
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - diff)
      }
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)
      endDate.setHours(23, 59, 59, 999)
    } else if (dateParam) {
      startDate = parseDateLocal(dateParam)
      if (isNaN(startDate.getTime())) {
        return Response.json({ error: "Invalid date format" }, { status: 400 })
      }
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setHours(23, 59, 59, 999)
    } else {
      const today = new Date()
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
      endDate   = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
    }

    const mealLogs = await prisma.mealLog.findMany({
      where: {
        userId,
        scheduledTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        meal: {
          select: {
            mealName: true,
            description: true,
            calories: true,
            protein: true,
            carbs: true,
            fats: true,
            mealTime: true,
          },
        },
      },
      orderBy: { scheduledTime: "asc" },
    })

    const completedLogs = mealLogs.filter(l => l.status === "DONE")
    const totalCalories = completedLogs.reduce((sum, l) => sum + (l.meal?.calories || 0), 0)

    return Response.json({
      logs: mealLogs,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        total: mealLogs.length,
        completed: completedLogs.length,
        pending: mealLogs.filter(l => l.status === "PENDING").length,
        skipped: mealLogs.filter(l => l.status === "SKIPPED").length,
        totalCalories,
      },
    })
  } catch (error) {
    console.error("Error in meal logs GET:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()
    const { logId, status } = body

    console.log("[meal POST] logId:", logId, "status:", status, "userId:", userId)

    if (!logId || !status) {
      return Response.json({ error: "Missing required fields: logId or status" }, { status: 400 })
    }

    if (status !== "DONE" && status !== "SKIPPED") {
      return Response.json({ error: "Invalid status. Must be DONE or SKIPPED" }, { status: 400 })
    }

    const log = await prisma.mealLog.findFirst({
      where: { id: logId },
    })

    if (!log) {
      console.log("[meal POST] Log not found for logId:", logId)
      return Response.json({ error: "Log not found" }, { status: 404 })
    }

    if (log.userId !== userId) {
      console.log("[meal POST] Ownership mismatch. log.userId:", log.userId, "session userId:", userId)
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const updated = await prisma.mealLog.update({
      where: { id: logId },
      data: { status },
      include: { meal: true },
    })

    return Response.json({ log: updated })
  } catch (error) {
    console.error("Error in meal logs POST:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()
    const { logId, status } = body

    console.log("[meal PATCH] logId:", logId, "status:", status, "userId:", userId)

    if (!logId || !status) {
      return Response.json({ error: "Missing required fields: logId or status" }, { status: 400 })
    }

    if (status !== "DONE" && status !== "SKIPPED") {
      return Response.json({ error: "Invalid status. Must be DONE or SKIPPED" }, { status: 400 })
    }

    const log = await prisma.mealLog.findFirst({
      where: { id: logId },
    })

    if (!log) {
      console.log("[meal PATCH] Log not found for logId:", logId)
      return Response.json({ error: "Log not found" }, { status: 404 })
    }

    if (log.userId !== userId) {
      console.log("[meal PATCH] Ownership mismatch. log.userId:", log.userId, "session userId:", userId)
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const updated = await prisma.mealLog.update({
      where: { id: logId },
      data: { status },
      include: { meal: true },
    })

    return Response.json({ log: updated })
  } catch (error) {
    console.error("Error in meal logs PATCH:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}