// app/api/diseases/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const diseases = await prisma.disease.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(diseases);
  } catch (error) {
    console.error('Error fetching diseases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch diseases' },
      { status: 500 }
    );
  }
}

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
    const { diseaseType, diseaseName, diagnosedDate } = body;

    if (!diseaseType || !diseaseName) {
      return NextResponse.json(
        { error: 'Disease type and name are required' },
        { status: 400 }
      );
    }

    const disease = await prisma.disease.create({
      data: {
        userId: session.user.id,
        diseaseType,
        diseaseName,
        diagnosedDate: diagnosedDate ? new Date(diagnosedDate) : null,
      },
    });

    return NextResponse.json(disease, { status: 201 });
  } catch (error) {
    console.error('Error creating disease:', error);
    return NextResponse.json(
      { error: 'Failed to create disease' },
      { status: 500 }
    );
  }
}