import { z } from "zod"

// 🔥 Reusable time validator (HH:MM)
const timeString = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
  message: "Time must be in HH:MM format (00:00 - 23:59)"
})

export const planSchema = z.object({
  nutritionPlan: z.object({
    dailyCalories: z.number().int().positive("Daily calories must be positive"),
    proteinGrams: z.number().int().positive(),
    carbsGrams: z.number().int().positive(),
    fatsGrams: z.number().int().positive(),
    meals: z.array(
      z.object({
        mealName: z.string().min(1),
        mealTime: timeString,
        description: z.string(),
        calories: z.number().int().positive(),
        protein: z.number().int().nonnegative(),
        carbs: z.number().int().nonnegative(),
        fats: z.number().int().nonnegative(),
      })
    ),
  }),

  exercisePlans: z.array(
    z.object({
      exerciseName: z.string().min(1),
      exerciseType: z.enum(["Cardio", "Strength", "Flexibility", "Recovery", "Yoga", "HIIT"]),
      duration: z.number().int().positive(),
      frequency: z.string().min(1),
      scheduledTime: timeString,
      instructions: z.string(),
    })
  ),

  sleepSchedule: z.object({
    bedTime: timeString,
    wakeTime: timeString,
    targetHours: z.number().positive(),
  }),

  reminders: z.array(
    z.object({
      type: z.enum(["MEAL", "EXERCISE", "SLEEP", "MEDICATION"]),
      reminderTime: timeString,
      linkedTo: z.string().min(1),
    })
  ),
})