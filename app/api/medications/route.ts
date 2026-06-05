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

  try {
    const medications = await prisma.medication.findMany({
      where: {
        userId,
      },
      include: {
        medicationLogs: {
          take: 1,
          orderBy: { scheduledAt: "desc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(medications);
  } catch (error) {
    console.error("Error fetching medications:", error);
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
  const { medicationName, dosage, frequency, scheduledTimes, diseaseId } = body;

  if (!medicationName || !dosage) {
    return new Response("Missing required fields", { status: 400 });
  }

  try {
    // Create medication
    const medication = await prisma.medication.create({
      data: {
        userId,
        medicationName,
        dosage,
        frequency: frequency || "Once daily",
        scheduledTimes: scheduledTimes || ["09:00"],
        isActive: true,
      },
    });

    // Create logs for today and next 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logsToCreate = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      for (const time of medication.scheduledTimes) {
        const [hours, minutes] = time.split(":");
        const scheduledAt = new Date(date);
        scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        logsToCreate.push({
          userId,
          medicationId: medication.id,
          scheduledAt,
          status: "PENDING" as const,
        });
      }
    }

    if (logsToCreate.length > 0) {
      await prisma.medicationLog.createMany({
        data: logsToCreate,
      });
    }

    return Response.json(medication);
  } catch (error) {
    console.error("Error creating medication:", error);
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
  const { medicationId, isActive } = body;

  if (!medicationId) {
    return new Response("Missing medication ID", { status: 400 });
  }

  try {
    const medication = await prisma.medication.updateMany({
      where: {
        id: medicationId,
        userId,
      },
      data: {
        isActive,
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating medication:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}