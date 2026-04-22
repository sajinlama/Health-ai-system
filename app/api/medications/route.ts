// app/api/medications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { medicationName, dosage, diseaseId } = body;

    // Validate required fields
    if (!medicationName || !dosage) {
      return NextResponse.json(
        { error: 'Medication name and dosage are required' },
        { status: 400 }
      );
    }

    // Verify disease belongs to user if diseaseId is provided
    if (diseaseId) {
      const disease = await prisma.disease.findFirst({
        where: {
          id: diseaseId,
          userId: session.user.id,
        },
      });

      if (!disease) {
        return NextResponse.json(
          { error: 'Disease not found or does not belong to user' },
          { status: 404 }
        );
      }
    }

    const medication = await prisma.medication.create({
      data: {
        userId: session.user.id,
        medicationName,
        dosage,
      },
    });

    return NextResponse.json(medication, { status: 201 });
  } catch (error) {
    console.error('Error creating medication:', error);
    return NextResponse.json(
      { error: 'Failed to create medication' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const medications = await prisma.medication.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(medications);
  } catch (error) {
    console.error('Error fetching medications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medications' },
      { status: 500 }
    );
  }
}