import prisma from "@/lib/db"

// ─── Data Fetcher ──────────────────────────────────────────────────────────────

export const getHealthingo = async (userId: string) => {
  const [userInfo, healthInfo, diseaseInfo, goalInfo] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.healthInfo.findUnique({ where: { userId } }),
    prisma.disease.findMany({ where: { userId } }),
    prisma.goal.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ])

  return { userInfo, healthInfo, goalInfo, diseaseInfo }
}

// ─── Prompt Builder ────────────────────────────────────────────────────────────

export function buildPrompt({
  userInfo,
  healthInfo,
  diseaseInfo,
  goalInfo,
}: ReturnType<typeof getHealthingo> extends Promise<infer T> ? T : never): string {
  const diseases =
    diseaseInfo && diseaseInfo.length > 0
      ? diseaseInfo
          .map(
            (d) =>
              `- [${d.diseaseType}] ${d.diseaseName}` +
              (d.diagnosedDate
                ? ` | Diagnosed: ${new Date(d.diagnosedDate).toDateString()}`
                : "")
          )
          .join("\n")
      : "None"

  const allergies =
    healthInfo?.allergies?.length ? healthInfo.allergies.join(", ") : "None"

  return `
You are an expert AI health planner. Generate a complete, safe, and personalized health plan.

Return ONLY valid JSON. No markdown, no explanation, no extra text outside the JSON object.

USER PROFILE
Name: ${userInfo?.fullName ?? "User"}
Gender: ${userInfo?.gender ?? "Not specified"}
Date of Birth: ${userInfo?.dateOfBirth ?? "Not specified"}
Height: ${userInfo?.height ? `${userInfo.height} cm` : "Not specified"}
Weight: ${userInfo?.weight ? `${userInfo.weight} kg` : "Not specified"}
Activity Level: ${userInfo?.activityLevel ?? "Not specified"}

HEALTH INFORMATION
Has Chronic Disease: ${healthInfo?.hasChronicDisease ?? false}
Allergies: ${allergies}
Notes: ${healthInfo?.notes ?? "None"}

DIAGNOSED CONDITIONS
${diseases}

GOAL
Type: ${goalInfo?.goalType ?? "GENERAL_WELLNESS"}
Focus Area: ${goalInfo?.focusArea ?? "OVERALL"}
Target Weight: ${goalInfo?.targetWeight ? `${goalInfo.targetWeight} kg` : "N/A"}
Target Date: ${goalInfo?.targetDate ? new Date(goalInfo.targetDate).toDateString() : "N/A"}
Muscle Mass %: ${goalInfo?.muscleMassPercentage ?? "N/A"}
Description: ${goalInfo?.description ?? "None"}

SAFETY RULES (strictly follow all)
- DIABETES: low-GI meals only, avoid high-sugar foods
- HYPERTENSION: low-sodium meals, no intense cardio without clearance
- HEART_DISEASE: no saturated fats, low-impact exercise only
- CANCER / KIDNEY_DISEASE: conservative approach — gentle nutrition and recovery exercises only
- ASTHMA: avoid high-intensity triggers, always include warm-up and cool-down
- Respect ALL allergies — never include any allergen in any meal
- Plans must be safe, realistic, and achievable by the target date

OUTPUT FORMAT (strict JSON — no extra fields, no markdown)
{
  "nutritionPlan": {
    "dailyCalories": number,
    "proteinGrams": number,
    "carbsGrams": number,
    "fatsGrams": number,
    "meals": [
      {
        "mealName": "Breakfast | Morning Snack | Lunch | Evening Snack | Dinner",
        "mealTime": "HH:MM",
        "description": "what to eat and why",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fats": number
      }
    ]
  },
  "exercisePlans": [
    {
      "exerciseName": "string",
      "exerciseType": "Cardio | Strength | Flexibility | Recovery | Yoga | HIIT",
      "duration": number,
      "frequency": "Daily | 3x per week | etc.",
      "scheduledTime": "HH:MM",
      "instructions": "step-by-step instructions"
    }
  ],
  "sleepSchedule": {
    "bedTime": "HH:MM",
    "wakeTime": "HH:MM",
    "targetHours": number
  },
  "reminders": [
    {
      "type": "MEAL | EXERCISE | SLEEP | MEDICATION",
      "reminderTime": "HH:MM",
      "linkedTo": "exact meal name or exercise name this reminder is for"
    }
  ]
}
`.trim()
}