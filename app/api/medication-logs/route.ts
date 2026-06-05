import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const searchParams = request.nextUrl.searchParams;
  const dateParam = searchParams.get("date");

  try {
    let logs;

    if (dateParam) {
      // Get logs for specific date
      const startOfDay = new Date(dateParam);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateParam);
      endOfDay.setHours(23, 59, 59, 999);

      logs = await prisma.medicationLog.findMany({
        where: {
          userId,
          scheduledAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          medication: {
            select: {
              medicationName: true,
              dosage: true,
            },
          },
        },
        orderBy: {
          scheduledAt: "asc",
        },
      });
    } else {
      // Get recent logs (last 7 days)
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);

      logs = await prisma.medicationLog.findMany({
        where: {
          userId,
          scheduledAt: {
            gte: weekStart,
          },
        },
        include: {
          medication: {
            select: {
              medicationName: true,
              dosage: true,
            },
          },
        },
        orderBy: {
          scheduledAt: "desc",
        },
      });
    }

    return Response.json(logs);
  } catch (error) {
    console.error("Error fetching medication logs:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();
  const { medicationId, scheduledAt } = body;

  if (!medicationId || !scheduledAt) {
    return new Response("Missing required fields", { status: 400 });
  }

  try {
    // Check if medication exists and belongs to user
    const medication = await prisma.medication.findFirst({
      where: {
        id: medicationId,
        userId,
      },
    });

    if (!medication) {
      return new Response("Medication not found", { status: 404 });
    }

    // Create medication log
    const log = await prisma.medicationLog.create({
      data: {
        userId,
        medicationId,
        scheduledAt: new Date(scheduledAt),
        status: "PENDING",
      },
      include: {
        medication: {
          select: {
            medicationName: true,
            dosage: true,
          },
        },
      },
    });

    return Response.json(log);
  } catch (error) {
    console.error("Error creating medication log:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const body = await request.json();
  const { logId, status } = body;

  if (!logId || !status) {
    return new Response("Missing required fields", { status: 400 });
  }

  try {
    // Verify log belongs to user
    const existingLog = await prisma.medicationLog.findFirst({
      where: {
        id: logId,
        userId,
      },
    });

    if (!existingLog) {
      return new Response("Log not found", { status: 404 });
    }

    // Update log status
    const updatedLog = await prisma.medicationLog.update({
      where: { id: logId },
      data: {
        status: status as any,
        takenAt: status === "TAKEN" ? new Date() : null,
      },
      include: {
        medication: {
          select: {
            medicationName: true,
            dosage: true,
          },
        },
      },
    });

    return Response.json(updatedLog);
  } catch (error) {
    console.error("Error updating medication log:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}