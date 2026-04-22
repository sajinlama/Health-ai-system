import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getHealthingo } from "@/service/prompt/prompt"
import { generateHealthPlan } from "@/service/ai/aiOutput"
import { planSchema } from "@/lib/validator/aiPlan"
import {
  saveNutrition,
  saveExercisePlans,
  saveSleepSchedule,
  saveReminders,
} from "@/service/ai/plan.service"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const userId = session.user.id

  // 1. Fetch user health data
  const data = await getHealthingo(userId)

  // 2. Generate AI plan
  const raw = await generateHealthPlan(data)

  // 3. Validate AI output
  const result = planSchema.safeParse(raw)
  if (!result.success) {
    console.error("Zod validation failed:", result.error.flatten())
    return Response.json(
      { error: "Invalid AI response", details: result.error.flatten() },
      { status: 400 }
    )
  }

  const { nutritionPlan, exercisePlans, sleepSchedule, reminders } = result.data

  // 4. Save all plans (nutrition + exercise + sleep in parallel)
  const [savedNutrition, savedExercises, savedSleep] = await Promise.all([
    saveNutrition(userId, nutritionPlan),
    saveExercisePlans(userId, exercisePlans),
    saveSleepSchedule(userId, sleepSchedule),
  ])

  // 5. Save reminders (needs IDs from step 4)
  await saveReminders(userId, reminders, savedNutrition, savedExercises, savedSleep)

  return Response.json({
    message: "Health plan generated and saved successfully",
    planId: savedNutrition.id,
  })
}