import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// ─── Types ─────────────────────────────────────────────────────────────────
type AIInput = {
  userName: string
  diseases: { diseaseName: string; diseaseType: string }[]
  medications: { medicationName: string; dosage: string }[]
  goals: { goalType: string; focusArea: string | null }[]
  weekStats: {
    mealsCompleted: number
    mealsPlanned: number
    workoutsCompleted: number
    workoutsPlanned: number
    avgSleepHours: number
    adherenceScore: number
  }
  activityLevel: string | null
  weight: number | null
  height: number | null
}

// ─── Fallback recommendations when API fails ───────────────────────────────
function getFallbackRecommendations(data: AIInput): Array<{ recommendationType: string; recommendation: string }> {
  const recommendations = []
  
  // Nutrition fallback
  if (data.weekStats.mealsCompleted < data.weekStats.mealsPlanned * 0.7) {
    recommendations.push({
      recommendationType: "NUTRITION",
      recommendation: `You completed ${data.weekStats.mealsCompleted}/${data.weekStats.mealsPlanned} meals this week. Try meal prepping on weekends to stay on track with your nutrition goals.`
    })
  } else {
    recommendations.push({
      recommendationType: "NUTRITION",
      recommendation: "Great job with your meals! Continue focusing on balanced nutrition with plenty of vegetables and lean proteins."
    })
  }
  
  // Exercise fallback
  if (data.weekStats.workoutsCompleted < data.weekStats.workoutsPlanned * 0.7) {
    recommendations.push({
      recommendationType: "EXERCISE",
      recommendation: `Only ${data.weekStats.workoutsCompleted}/${data.weekStats.workoutsPlanned} workouts completed. Start with 10-minute walks and gradually increase duration.`
    })
  } else {
    recommendations.push({
      recommendationType: "EXERCISE",
      recommendation: "Excellent consistency with workouts! Consider adding variety to prevent boredom and work different muscle groups."
    })
  }
  
  // Sleep/Adherence fallback
  if (data.weekStats.avgSleepHours < 7) {
    recommendations.push({
      recommendationType: "SLEEP",
      recommendation: `You're averaging ${data.weekStats.avgSleepHours}h of sleep. Aim for 7-8 hours by setting a consistent bedtime routine.`
    })
  } else if (data.weekStats.adherenceScore < 80) {
    recommendations.push({
      recommendationType: "LIFESTYLE",
      recommendation: `Your adherence score is ${data.weekStats.adherenceScore}%. Set smaller, achievable daily goals to build momentum.`
    })
  } else {
    recommendations.push({
      recommendationType: "LIFESTYLE",
      recommendation: "You're doing great! Track your progress weekly and celebrate small wins to stay motivated."
    })
  }
  
  return recommendations.slice(0, 3)
}

// ─── Retry logic for Gemini API ───────────────────────────────────────────
async function generateHealthInsightsWithRetry(
  data: AIInput, 
  maxRetries: number = 3,
  initialDelay: number = 32000 // 32 seconds from error
): Promise<Array<{ recommendationType: string; recommendation: string }>> {
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const prompt = buildPrompt(data)
      
      const res = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      })
      
      const raw = res.text().trim()
      const clean = raw.replace(/```json|```/g, "").trim()
      
      const parsed = JSON.parse(clean)
      const recommendations = Array.isArray(parsed) ? parsed : []
      
      if (recommendations.length > 0) {
        console.log(`✅ Gemini generation succeeded on attempt ${attempt}`)
        return recommendations
      }
      
      return getFallbackRecommendations(data)
      
    } catch (err: any) {
      console.error(`❌ Attempt ${attempt}/${maxRetries} failed:`, err?.message || err)
      
      // Check if it's a quota error
      const isQuotaError = err?.status === 429 || 
                          err?.message?.includes("quota") || 
                          err?.message?.includes("RESOURCE_EXHAUSTED")
      
      if (isQuotaError && attempt < maxRetries) {
        // Extract retry delay from error if available
        let delay = initialDelay
        if (err?.message?.includes("retry in")) {
          const match = err.message.match(/retry in (\d+(?:\.\d+)?)s/)
          if (match) {
            delay = parseFloat(match[1]) * 1000
            console.log(`⏳ Using retry delay from error: ${delay}ms`)
          }
        }
        
        console.log(`⏳ Quota exceeded. Waiting ${delay/1000}s before retry ${attempt + 1}...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      // Non-retryable error or last attempt failed
      console.error("Gemini generation failed permanently, using fallback recommendations")
      return getFallbackRecommendations(data)
    }
  }
  
  // All retries exhausted
  console.warn("All retry attempts exhausted, using fallback recommendations")
  return getFallbackRecommendations(data)
}

// ─── Build structured prompt ───────────────────────────────────────────────
function buildPrompt(data: AIInput): string {
  const bmi =
    data.weight && data.height
      ? (data.weight / Math.pow(data.height / 100, 2)).toFixed(1)
      : null

  return `
You are an expert chronic care and wellness advisor. Analyze the following patient health data and provide 3 concise, personalized, actionable health recommendations.

Patient Profile:
- Name: ${data.userName}
- BMI: ${bmi ?? "Unknown"}
- Activity Level: ${data.activityLevel ?? "Unknown"}
- Chronic Conditions: ${data.diseases.map((d) => d.diseaseName).join(", ") || "None"}
- Current Medications: ${data.medications.map((m) => `${m.medicationName} (${m.dosage})`).join(", ") || "None"}
- Primary Goal: ${data.goals[0]?.goalType ?? "General Wellness"}${data.goals[0]?.focusArea ? ` — ${data.goals[0].focusArea}` : ""}

Weekly Performance:
- Meals: ${data.weekStats.mealsCompleted}/${data.weekStats.mealsPlanned} completed
- Workouts: ${data.weekStats.workoutsCompleted}/${data.weekStats.workoutsPlanned} completed
- Avg Sleep: ${data.weekStats.avgSleepHours}h/night
- Adherence Score: ${data.weekStats.adherenceScore}%

Return ONLY a valid JSON array with exactly 3 items (no markdown, no extra text):
[
  {
    "recommendationType": "NUTRITION" | "EXERCISE" | "SLEEP" | "MEDICATION" | "LIFESTYLE" | "MENTAL_HEALTH",
    "recommendation": "Short, actionable tip (2–3 sentences max)"
  }
]
`.trim()
}

// ─── Generate AI recommendations with retry ─────────────────────────────────
async function generateHealthInsights(data: AIInput) {
  return generateHealthInsightsWithRetry(data)
}

// ─── GET /api/dashboard ───────────────────────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const userId = session.user.id

  const today = new Date()
  const startOfDay = new Date(today)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(today)
  endOfDay.setHours(23, 59, 59, 999)

  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - 6)
  weekStart.setHours(0, 0, 0, 0)

  const [
    user,
    diseases,
    medications,
    goals,
    latestSnapshot,
    todayMedicationLogs,
    weekMealLogs,
    weekExerciseLogs,
    weekSleepLogs,
    latestWeeklyReport,
    cachedRecommendations,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        fullName: true,
        weight: true,
        height: true,
        activityLevel: true,
        healthInfo: { select: { hasChronicDisease: true, allergies: true, notes: true } },
      },
    }),

    prisma.disease.findMany({
      where: { userId },
      select: { diseaseType: true, diseaseName: true, diagnosedDate: true },
      orderBy: { createdAt: "desc" },
    }),

    prisma.medication.findMany({
      where: { userId, isActive: true },
      select: { medicationName: true, dosage: true, frequency: true, scheduledTimes: true },
    }),

    prisma.goal.findMany({
      where: { userId },
      select: { goalType: true, focusArea: true, targetWeight: true, targetDate: true, description: true },
      orderBy: { createdAt: "desc" },
      take: 1,
    }),

    prisma.userWeeklySnapshot.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { weight: true, activityLevel: true, createdAt: true },
    }),

    // Get today's medication logs instead of reminders
    prisma.medicationLog.findMany({
      where: { 
        userId, 
        scheduledAt: { gte: startOfDay, lte: endOfDay } 
      },
      include: {
        medication: { select: { medicationName: true, dosage: true } },
      },
      orderBy: { scheduledAt: "asc" },
    }),

    prisma.mealLog.findMany({
      where: { userId, scheduledTime: { gte: weekStart, lte: endOfDay } },
      select: { status: true },
    }),

    prisma.exerciseLog.findMany({
      where: { userId, scheduledTime: { gte: weekStart, lte: endOfDay } },
      select: { status: true },
    }),

    prisma.sleepLog.findMany({
      where: { userId, sleptAt: { gte: weekStart, lte: endOfDay } },
      select: { sleptAt: true, wakeAt: true, completed: true },
    }),

    prisma.weeklyReport.findFirst({
      where: { userId },
      orderBy: { weekStart: "desc" },
    }),

    prisma.aIRecommendation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { recommendationType: true, recommendation: true, createdAt: true },
    }),
  ])

  // ── Compute derived stats ──────────────────────────────────────────────
  const mealsPlanned   = weekMealLogs.length
  const mealsCompleted = weekMealLogs.filter((l) => l.status === "DONE").length

  const workoutsPlanned   = weekExerciseLogs.length
  const workoutsCompleted = weekExerciseLogs.filter((l) => l.status === "DONE").length

  const avgSleepHours =
    weekSleepLogs.length === 0
      ? 0
      : parseFloat(
          (
            weekSleepLogs.reduce((sum, log) => {
              return sum + (log.wakeAt.getTime() - log.sleptAt.getTime()) / 3_600_000
            }, 0) / weekSleepLogs.length
          ).toFixed(1)
        )

  const totalPlanned   = mealsPlanned + workoutsPlanned
  const totalCompleted = mealsCompleted + workoutsCompleted
  const adherenceScore =
    totalPlanned === 0
      ? 0
      : parseFloat(((totalCompleted / totalPlanned) * 100).toFixed(1))

  // Calculate medication stats
  const pendingToday   = todayMedicationLogs.filter((l) => l.status === "PENDING").length
  const takenToday     = todayMedicationLogs.filter((l) => l.status === "TAKEN").length
  const skippedToday   = todayMedicationLogs.filter((l) => l.status === "SKIPPED").length
  const missedToday    = todayMedicationLogs.filter((l) => l.status === "MISSED").length

  const weekStats = {
    mealsPlanned,
    mealsCompleted,
    workoutsPlanned,
    workoutsCompleted,
    avgSleepHours,
    adherenceScore,
  }

  // ── Decide whether to regenerate AI insights ──────────────────────────
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000)
  const shouldRefresh =
    cachedRecommendations.length === 0 ||
    new Date(cachedRecommendations[0].createdAt) < sixHoursAgo

  let aiRecommendations = cachedRecommendations

  if (shouldRefresh && user) {
    try {
      const fresh = await generateHealthInsights({
        userName: user.fullName ?? "User",
        diseases,
        medications,
        goals,
        weekStats,
        activityLevel: user.activityLevel,
        weight: user.weight,
        height: user.height,
      })

      if (fresh.length > 0) {
        // Delete old recommendations
        await prisma.aIRecommendation.deleteMany({ where: { userId } })
        
        // Persist new recommendations
        await prisma.aIRecommendation.createMany({
          data: fresh.map((r: { recommendationType: string; recommendation: string }) => ({
            userId,
            recommendationType: r.recommendationType,
            recommendation: r.recommendation,
          })),
        })

        aiRecommendations = fresh.map((r: { recommendationType: string; recommendation: string }) => ({
          ...r,
          createdAt: new Date().toISOString(),
        }))
      } else {
        aiRecommendations = cachedRecommendations.length > 0 ? cachedRecommendations : fresh
      }
    } catch (err) {
      console.error("Gemini generation failed in main flow:", err)
      // Keep cached recommendations if available
      if (cachedRecommendations.length === 0) {
        // Generate fallback recommendations on the fly
        aiRecommendations = getFallbackRecommendations({
          userName: user.fullName ?? "User",
          diseases,
          medications,
          goals,
          weekStats,
          activityLevel: user.activityLevel,
          weight: user.weight,
          height: user.height,
        }).map(r => ({ ...r, createdAt: new Date().toISOString() }))
      }
    }
  }

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening"

  return Response.json({
    greeting,
    user,
    diseases,
    medications,
    goals,
    latestSnapshot,
    weekStats,
    todayMedications: {
      total: todayMedicationLogs.length,
      pending: pendingToday,
      taken: takenToday,
      skipped: skippedToday,
      missed: missedToday,
      items: todayMedicationLogs,
    },
    latestWeeklyReport,
    aiRecommendations,
  })
}
