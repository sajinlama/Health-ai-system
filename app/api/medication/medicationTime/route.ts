import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import {z} from "zod";
import prisma from "@/lib/db";
import medicationTimeSchema from "@/lib/validator/medicationtime.schema";
import { exportPages } from "next/dist/export/worker";


export async function  POST (req:NextRequest){
  const session=await getServerSession(authOptions);
  if (!session || !session.user?.email) {
       return NextResponse.json(
         { error: "Unauthorized.  login first." },
         { status: 401 }
       );
     }

     const body= await req.json();
     type medicationTimeInput= z.infer<typeof medicationTimeSchema>

     let validatedData: medicationTimeInput;

     try {
        validatedData = medicationTimeSchema.parse(body);
     } catch (error) {
        return  NextResponse.json({
            error:error
        },
        {
            status:403
        }
    )
        
     }

     const medicationTime = await prisma.medicationTime.create({
        data:{
            medicationId:validatedData.medicationId,
            time:validatedData.time,
            
        }
     })
     return medicationTime;
}

export async function PUT(req: NextRequest) {
  // 1. Check session
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized. Login first." },
      { status: 401 }
    );
  }

  // 2. Parse request body
  const body = await req.json();
  type MedicationTimeInput = z.infer<typeof medicationTimeSchema>;

  let validatedData: MedicationTimeInput;
  try {
    validatedData = medicationTimeSchema.parse(body);
  } catch (error) {
    return NextResponse.json(
      { error },
      { status: 403 }
    );
  }

  // 3. Update medication time based on medicationId and oldTime
  try {
    
    const { medicationId, time, oldTime } = validatedData as any;

    const updatedMedicationTime = await prisma.medicationTime.update({
      where: {
        medicationId_time: {
          medicationId,
          time: oldTime, 
        },
      },
      data: {
        time, 
      },
    });

    return NextResponse.json(updatedMedicationTime);
  } catch (err) {
    return NextResponse.json(
      { error: "Medication time not found or could not be updated." },
      { status: 404 }
    );
  }
}