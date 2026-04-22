import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import onboardingSchema from "@/lib/validator/unboarding.schema";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";



type OnboardingInput = z.infer<typeof onboardingSchema>;

export async function POST(req: NextRequest) {
  try {

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Login first." },
        { status: 401 }
      );
    }

    const userEmail: string = session.user.email;

    const body = await req.json();
    let validatedData: OnboardingInput;

    try {
      validatedData = onboardingSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation failed", issues: error },
          { status: 400 }
        );
      }
      throw error;
    }

    console.log(validatedData);

    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { healthInfo: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (existingUser.healthInfo) {
      return NextResponse.json(
        { error: "User has already completed onboarding" },
        { status: 409 }
      );
    }

    const user = await prisma.$transaction(async (tx) => {

      // Step 1 & 2 — personal info + body stats
      const updatedUser = await tx.user.update({
        where: { email: userEmail },
        data: {
          dateOfBirth: new Date(validatedData.dateOfBirth),
          gender: validatedData.gender,
          height: validatedData.height,
          weight: validatedData.weight,
          activityLevel: validatedData.activityLevel,
        },
      });

      // Step 3 — health info
      await tx.healthInfo.create({
        data: {
          userId: updatedUser.id,
          hasChronicDisease: validatedData.hasChronicDisease,
          allergies: validatedData.allergies || [],
          notes: validatedData.notes,
        },
      });

      // Step 3 — disease (only if chronic disease declared)
      if (
        validatedData.hasChronicDisease &&
        validatedData.diseaseType &&
        validatedData.diseaseName
      ) {
    await tx.disease.create({
  data: {
    userId: updatedUser.id,
    diseaseType: validatedData.diseaseType,
    diseaseName: validatedData.diseaseName,
    diagnosedDate: validatedData.diagnosedDate
      ? new Date(validatedData.diagnosedDate)
      : null
  }
})
      }

      // Step 4 — goal (fields vary by goalType)
      await tx.goal.create({
        data: {
          userId: updatedUser.id,
          goalType: validatedData.goalType,
          targetDate: validatedData.targetDate
            ? new Date(validatedData.targetDate)
            : null,
          // Weight-based goals
          targetWeight:
            validatedData.goalType !== 'GENERAL_WELLNESS'
              ? validatedData.targetWeight
              : null,
          // MUSCLE_GAIN only
          muscleMassPercentage:
            validatedData.goalType === 'MUSCLE_GAIN'
              ? validatedData.muscleMassPercentage
              : null,
          // GENERAL_WELLNESS only
          focusArea:
            validatedData.goalType === 'GENERAL_WELLNESS'
              ? validatedData.focusArea
              : null,
        },
      });

      return updatedUser;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Onboarding completed successfully",
        data: {
          userId: user.id,
          email: user.email,
          fullName: user.fullName,
          onboardingComplete: true,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

