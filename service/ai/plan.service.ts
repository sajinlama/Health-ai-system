import prisma from "@/lib/db"

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Converts "HH:MM" into a full Date using today's date.
 */
function toDateTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date
}

// ─── Types ────────────────────────────────────────────────────────────────────

type MealInput = {
  mealName: string
  mealTime: string
  description: string
  calories: number
  protein: number
  carbs: number
  fats: number
}

type ExercisePlanInput = {
  exerciseName: string
  exerciseType: string
  duration: number
  scheduledTime: string
  instructions: string
}

type SleepScheduleInput = {
  bedTime: string
  wakeTime: string
  targetHours: number
}

type NutritionPlanInput = {
  dailyCalories: number
  proteinGrams: number
  carbsGrams: number
  fatsGrams: number
  meals: MealInput[]
}

// ─── Nutrition + MealLogs ─────────────────────────────────────────────────────

export const saveNutrition = async (userId: string, nutritionPlan: NutritionPlanInput) => {
  const { meals, ...planData } = nutritionPlan

  // Step 1: Create NutritionPlan with nested Meals
  const savedPlan = await prisma.nutritionPlan.create({
    data: {
      userId,
      ...planData,
      startDate: new Date(),
      isActive: true,
      version: 1,
      meals: {
        create: meals.map((meal) => ({
          mealName: meal.mealName,
          mealTime: toDateTime(meal.mealTime),
          description: meal.description,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fats: meal.fats,
        })),
      },
    },
    include: { meals: true },
  })

  // Step 2: Create a MealLog (status: PENDING) for each meal for today
  await prisma.mealLog.createMany({
    data: savedPlan.meals.map((meal) => ({
      userId,
      mealId: meal.id,
      status: "PENDING",
      scheduledTime: meal.mealTime, // already a Date from step 1
    })),
  })

  return savedPlan
}

// ─── Exercise Plans + ExerciseLogs ───────────────────────────────────────────

export const saveExercisePlans = async (
  userId: string,
  exercisePlans: ExercisePlanInput[]
) => {
  // Step 1: Create ExercisePlans
  const saved = await Promise.all(
    exercisePlans.map((plan) =>
      prisma.exercisePlan.create({
        data: {
          userId,
          exerciseName: plan.exerciseName,
          exerciseType: plan.exerciseType,
          duration: plan.duration,
          scheduledTime: toDateTime(plan.scheduledTime),
          instructions: plan.instructions,
        },
      })
    )
  )

  // Step 2: Create an ExerciseLog (status: PENDING) for each plan for today
  await prisma.exerciseLog.createMany({
    data: saved.map((plan) => ({
      userId,
      exercisePlanId: plan.id,
      status: "PENDING",
      scheduledTime: plan.scheduledTime, // already a Date from step 1
    })),
  })

  return saved
}

// ─── Sleep Schedule + SleepLog ────────────────────────────────────────────────

export const saveSleepSchedule = async (
  userId: string,
  sleepSchedule: SleepScheduleInput
) => {
  const bedTime = toDateTime(sleepSchedule.bedTime)
  const wakeTime = toDateTime(sleepSchedule.wakeTime)

  // Step 1: Create SleepSchedule (the plan)
  const savedSchedule = await prisma.sleepSchedule.create({
    data: {
      userId,
      bedTime,
      wakeTime,
      targetHours: sleepSchedule.targetHours,
    },
  })

  // Step 2: Create today's SleepLog entry as a placeholder.
  // completed: false — will be updated when user actually logs sleep.
  // sleptAt = bedTime, wakeAt = wakeTime (scheduled targets for tonight).
  await prisma.sleepLog.create({
    data: {
      userId,
      sleptAt: bedTime,
      wakeAt: wakeTime,
      completed: false,
    },
  })

  return savedSchedule
}

// ─── Reminders ────────────────────────────────────────────────────────────────

type ReminderInput = {
  type: "MEAL" | "EXERCISE" | "SLEEP" | "MEDICATION"
  reminderTime: string
  linkedTo: string
}

type SavedNutrition = Awaited<ReturnType<typeof saveNutrition>>
type SavedExercises = Awaited<ReturnType<typeof saveExercisePlans>>
type SavedSleep = Awaited<ReturnType<typeof saveSleepSchedule>>

export const saveReminders = async (
  userId: string,
  reminders: ReminderInput[],
  savedNutrition: SavedNutrition,
  savedExercises: SavedExercises,
  savedSleep: SavedSleep
) => {
  return Promise.all(
    reminders.map((reminder) => {
      const linked = reminder.linkedTo.toLowerCase()

      const mealId =
        reminder.type === "MEAL"
          ? savedNutrition.meals.find((m) =>
              m.mealName.toLowerCase().includes(linked)
            )?.id ?? null
          : null

      const exercisePlanId =
        reminder.type === "EXERCISE"
          ? savedExercises.find((e) =>
              e.exerciseName.toLowerCase().includes(linked)
            )?.id ?? null
          : null

      const sleepScheduleId =
        reminder.type === "SLEEP" ? savedSleep.id : null

      return prisma.reminder.create({
        data: {
          userId,
          type: reminder.type,
          reminderTime: toDateTime(reminder.reminderTime),
          status: "PENDING",
          taskData: { linkedTo: reminder.linkedTo },
          mealId,
          exercisePlanId,
          sleepScheduleId,
        },
      })
    })
  )
}