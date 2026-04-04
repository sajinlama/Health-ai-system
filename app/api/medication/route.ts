import { NextRequest, NextResponse } from "next/server";
import {z} from "zod";
import medicationSchema from "@/lib/validator/medication.schema";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/db";




export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  console.log("the session is ",session )

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const body = await req.json();

  type medicationInput = z.infer<typeof medicationSchema>;

  let validatedData: medicationInput;
  try {
    validatedData = medicationSchema.parse(body);
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const result = await prisma.medication.create({
  data: {
    userId: session.user.id,
    diseaseId: validatedData.diseaseId,
    medicationName: validatedData.medicationName,
    dosage: validatedData.dosage,
    timesPerDay: validatedData.timesPerDay,
    startDate: validatedData.startDate,
    endDate: validatedData.endDate,
    instructions: validatedData.instructions,
  },
});

return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Not allowed" },
      { status: 403 }
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        medications: {
          include: {
            times: true,        
            reminders: true,   
          },
        },
        reminders: true,        
      },
    })

    return NextResponse.json({
      medications: user?.medications ?? [],
      reminders: user?.reminders ?? [],
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Not allowed" },
      { status: 403 }
    )
  }

  const body = await req.json() // ✅ FIXED

  type MedicationInput = z.infer<typeof medicationSchema>
  let validatedData: MedicationInput

  try {
    validatedData = medicationSchema.parse(body)
  } catch (error) {
    return NextResponse.json(
      { error },
      { status: 400 }
    )
  }

  try {
    // ✅ 1. Check ownership
    const existing = await prisma.medication.findUnique({
      where: { id: session.user.id },
    })

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // ✅ 2. Update medication
    const updatedMedication = await prisma.medication.update({
      where: { id: session.user.id },
      data: {
        medicationName: validatedData.medicationName,
        dosage: validatedData.dosage,
        timesPerDay: validatedData.timesPerDay,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        instructions: validatedData.instructions,
      },
    })

    // ✅ 3. Update times (important)
    if (validatedData.times) {
      // delete old times
      await prisma.medicationTime.deleteMany({
        where: { medicationId: validatedData.id },
      })

      // create new ones
      await prisma.medicationTime.createMany({
        data: validatedData.times.map((t) => ({
          medicationId: validatedData.id,
          time: t.time,
        })),
      })
    }

    // ✅ 4. Invalidate Redis cache
    // await redis.del(`medications:${session.user.id}`)

    return NextResponse.json(updatedMedication)

  } catch (error) {
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    )
  }
}