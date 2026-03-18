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