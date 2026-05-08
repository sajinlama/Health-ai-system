"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Brain, Activity, Moon, Pill, Target, Heart,
  TrendingUp, AlertCircle, CheckCircle, Flame,
  Utensils, BedDouble, Bell, ChevronRight, Dumbbell,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────
type DashboardData = {
  greeting: string
  user: {
    fullName: string
    weight: number | null
    height: number | null
    activityLevel: string | null
    healthInfo: { hasChronicDisease: boolean; allergies: string[]; notes: string | null } | null
  }
  diseases: { diseaseType: string; diseaseName: string; diagnosedDate: string | null }[]
  medications: { medicationName: string; dosage: string }[]
  goals: {
    goalType: string
    focusArea: string | null
    targetWeight: number | null
    targetDate: string | null
    description: string | null
  }[]
  latestSnapshot: { weight: number | null; activityLevel: string | null; createdAt: string } | null
  weekStats: {
    mealsPlanned: number
    mealsCompleted: number
    workoutsPlanned: number
    workoutsCompleted: number
    avgSleepHours: number
    adherenceScore: number
  }
  todayReminders: {
    total: number
    pending: number
    completed: number
    items: { type: string; status: string; reminderTime: string }[]
  }
  latestWeeklyReport: {
    mealsPlanned: number
    mealsCompleted: number
    workoutsPlanned: number
    workoutsCompleted: number
    avgSleepHours: number
    adherenceScore: number
  } | null
  aiRecommendations: { recommendationType: string; recommendation: string; createdAt: string }[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const GOAL_LABEL: Record<string, string> = {
  WEIGHT_LOSS: "Weight Loss",
  WEIGHT_GAIN: "Weight Gain",
  MUSCLE_GAIN: "Muscle Gain",
  GENERAL_WELLNESS: "General Wellness",
}

const ACTIVITY_LABEL: Record<string, string> = {
  SEDENTARY: "Sedentary",
  LIGHTLY_ACTIVE: "Lightly Active",
  MODERATELY_ACTIVE: "Moderately Active",
  VERY_ACTIVE: "Very Active",
}

const DISEASE_ICON: Record<string, string> = {
  HYPERTENSION: "🫀",
  DIABETES: "🩸",
  HEART_DISEASE: "❤️",
  ASTHMA: "🫁",
  CANCER: "🎗️",
  KIDNEY_DISEASE: "🫘",
  OTHER: "🏥",
}

const REMINDER_ICON: Record<string, React.ReactNode> = {
  MEAL:       <Utensils  className="w-3.5 h-3.5" />,
  EXERCISE:   <Dumbbell  className="w-3.5 h-3.5" />,
  SLEEP:      <BedDouble className="w-3.5 h-3.5" />,
  MEDICATION: <Pill      className="w-3.5 h-3.5" />,
}

function pct(done: number, total: number) {
  if (total === 0) return 0
  return Math.round((done / total) * 100)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, sub, accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  accent?: string
}) {
  return (
    <div className="bg-white/60 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-stone-400">{icon}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${accent ?? "bg-stone-100 text-stone-500"}`}>
          {sub}
        </span>
      </div>
      <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-semibold text-stone-800 tracking-tight">{value}</p>
    </div>
  )
}

function ProgressBar({ value, color = "bg-stone-800" }: { value: number; color?: string }) {
  return (
    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  )
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white/60 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-stone-500">{icon}</span>
        <h3 className="font-semibold text-stone-700 text-sm">{title}</h3>
      </div>
      {children}
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-stone-200/70 rounded-xl ${className}`} />
}

function DashboardSkeleton() {
  return (
    <section className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-14 w-72" />
        <div className="grid md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    </section>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard")
      if (!res.ok) throw new Error("Failed to load dashboard")
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) return <DashboardSkeleton />

  if (isError || !data) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-stone-500 text-sm">Failed to load dashboard. Please refresh.</p>
        </div>
      </section>
    )
  }

  const { greeting, user, diseases, medications, goals, weekStats, todayReminders, latestWeeklyReport, aiRecommendations } = data
  const firstName = user.fullName?.split(" ")[0] ?? "there"
  const primaryGoal = goals[0]
  const report = latestWeeklyReport ?? weekStats
  const mealPct    = pct(report.mealsCompleted, report.mealsPlanned)
  const workoutPct = pct(report.workoutsCompleted, report.workoutsPlanned)

  return (
    <section className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Your chronic care &amp; wellness overview
            </p>
          </div>
          {todayReminders.pending > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium px-3.5 py-2 rounded-xl">
              <Bell className="w-4 h-4" />
              {todayReminders.pending} pending today
            </div>
          )}
        </div>

        {/* ── Chronic condition alert ─────────────────────────────────────── */}
        {diseases.length > 0 && (
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5 w-5 h-5" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {DISEASE_ICON[diseases[0].diseaseType] ?? "🏥"} Active Condition:{" "}
                  {diseases[0].diseaseName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ongoing monitoring required. Keep consistent with medication and maintain healthy lifestyle habits.
                  {diseases[0].diagnosedDate && (
                    <span className="ml-2 text-xs opacity-70">
                      Since {new Date(diseases[0].diagnosedDate).getFullYear()}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Vital metric cards ──────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Activity className="w-4 h-4" />}
            label="Weight"
            value={user.weight ? `${user.weight} kg` : "—"}
            sub="Stable"
            accent="bg-green-100 text-green-700"
          />
          <StatCard
            icon={<Moon className="w-4 h-4" />}
            label="Avg Sleep"
            value={weekStats.avgSleepHours ? `${weekStats.avgSleepHours}h` : "—"}
            sub="This week"
            accent={weekStats.avgSleepHours >= 7 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}
          />
          <StatCard
            icon={<Flame className="w-4 h-4" />}
            label="Adherence"
            value={`${weekStats.adherenceScore}%`}
            sub="7-day"
            accent={weekStats.adherenceScore >= 80 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}
          />
          <StatCard
            icon={<Target className="w-4 h-4" />}
            label="Primary Goal"
            value={primaryGoal ? GOAL_LABEL[primaryGoal.goalType] : "—"}
            sub={primaryGoal?.focusArea ?? "Active"}
            accent="bg-blue-100 text-blue-700"
          />
        </div>

        {/* ── Main 3-col grid ─────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-5">

          {/* Medication */}
          <SectionCard title="Medication" icon={<Pill className="w-4 h-4" />}>
            <div className="mb-4">
              <p className="text-3xl font-bold text-green-600 tracking-tight">
                {weekStats.adherenceScore}%
              </p>
              <p className="text-xs text-stone-400 mt-0.5">Adherence this week</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Active</p>
              {medications.length === 0 && (
                <p className="text-sm text-stone-400 italic">No medications recorded</p>
              )}
              {medications.map((med, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-stone-100 last:border-0">
                  <span className="text-sm text-stone-700">{med.medicationName}</span>
                  <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{med.dosage}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Conditions */}
          <SectionCard title="Conditions" icon={<Heart className="w-4 h-4" />}>
            {diseases.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">No chronic conditions</span>
              </div>
            ) : (
              <div className="space-y-3">
                {diseases.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-50/60 rounded-xl border border-red-100">
                    <span className="text-xl">{DISEASE_ICON[d.diseaseType] ?? "🏥"}</span>
                    <div>
                      <p className="font-semibold text-stone-800 text-sm">{d.diseaseName}</p>
                      {d.diagnosedDate && (
                        <p className="text-xs text-stone-400 mt-0.5">
                          Since {new Date(d.diagnosedDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1.5">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-stone-400">Active monitoring</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Weekly progress */}
          <SectionCard title="Weekly Progress" icon={<TrendingUp className="w-4 h-4" />}>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-stone-500">Meals</span>
                  <span className="text-xs font-semibold text-stone-700">
                    {report.mealsCompleted}/{report.mealsPlanned}
                  </span>
                </div>
                <ProgressBar value={mealPct} color="bg-amber-400" />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-stone-500">Workouts</span>
                  <span className="text-xs font-semibold text-stone-700">
                    {report.workoutsCompleted}/{report.workoutsPlanned}
                  </span>
                </div>
                <ProgressBar value={workoutPct} color="bg-green-500" />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-stone-500">Sleep avg</span>
                  <span className="text-xs font-semibold text-stone-700">
                    {report.avgSleepHours}h
                  </span>
                </div>
                <ProgressBar value={pct(report.avgSleepHours, 8)} color="bg-blue-400" />
              </div>
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-stone-500">Overall adherence</span>
                  <span className="text-xs font-semibold text-stone-700">
                    {report.adherenceScore}%
                  </span>
                </div>
                <ProgressBar value={report.adherenceScore} color="bg-stone-700" />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Today's reminders + AI insight ─────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Today's reminders */}
          <SectionCard title="Today's reminders" icon={<Bell className="w-4 h-4" />}>
            {todayReminders.items.length === 0 ? (
              <p className="text-sm text-stone-400 italic">No reminders scheduled for today</p>
            ) : (
              <div className="space-y-2">
                {todayReminders.items.slice(0, 6).map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <span className={`p-1.5 rounded-lg ${
                        r.type === "MEAL"       ? "bg-amber-100 text-amber-600"  :
                        r.type === "EXERCISE"   ? "bg-green-100 text-green-600"  :
                        r.type === "SLEEP"      ? "bg-blue-100 text-blue-600"    :
                                                  "bg-pink-100 text-pink-600"
                      }`}>
                        {REMINDER_ICON[r.type]}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-stone-700 capitalize">
                          {r.type.toLowerCase()}
                        </p>
                        <p className="text-xs text-stone-400">
                          {new Date(r.reminderTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      r.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                      r.status === "SKIPPED"   ? "bg-stone-100 text-stone-500" :
                                                 "bg-amber-100 text-amber-700"
                    }`}>
                      {r.status === "COMPLETED" ? "✓ Done" : r.status === "SKIPPED" ? "Skipped" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* AI recommendations */}
          <SectionCard title="AI Insights" icon={<Brain className="w-4 h-4" />}>
            {aiRecommendations.length === 0 ? (
              <p className="text-sm text-stone-400 italic">No recommendations yet</p>
            ) : (
              <div className="space-y-3">
                {aiRecommendations.map((rec, i) => (
                  <div key={i} className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                      {rec.recommendationType}
                    </p>
                    <p className="text-sm text-stone-600 leading-relaxed">{rec.recommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Weekly summary + Recommended actions ───────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5">

          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-5">
            <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              Weekly Summary
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                {mealPct >= 80 ? "✅" : "⚠️"}{" "}
                <span className="font-medium text-stone-700">Meals:</span>{" "}
                {report.mealsCompleted}/{report.mealsPlanned} completed ({mealPct}%)
              </p>
              <p>
                {workoutPct >= 80 ? "✅" : "⚠️"}{" "}
                <span className="font-medium text-stone-700">Workouts:</span>{" "}
                {report.workoutsCompleted}/{report.workoutsPlanned} completed ({workoutPct}%)
              </p>
              <p>
                {report.avgSleepHours >= 7 ? "✅" : "⚠️"}{" "}
                <span className="font-medium text-stone-700">Sleep:</span>{" "}
                {report.avgSleepHours}h avg (target: 7–8h)
              </p>
              <p>
                {report.adherenceScore >= 80 ? "✅" : "⚠️"}{" "}
                <span className="font-medium text-stone-700">Adherence:</span>{" "}
                {report.adherenceScore}% overall
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-5">
            <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Recommended Actions
            </h3>
            <ul className="space-y-2.5">
              {[
                medications.length > 0 && `Take ${medications[0].medicationName} as scheduled`,
                report.avgSleepHours < 7 && "Improve sleep — aim for 7+ hours per night",
                workoutPct < 80 && "Stay consistent with your exercise plan this week",
                diseases.length > 0 && "Log your health vitals for condition monitoring",
              ]
                .filter(Boolean)
                .slice(0, 4)
                .map((action, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="font-semibold text-blue-500 text-sm mt-0.5">{i + 1}.</span>
                    <span className="text-sm text-muted-foreground">{action as string}</span>
                  </li>
                ))}
              {[
                medications.length > 0,
                report.avgSleepHours < 7,
                workoutPct < 80,
                diseases.length > 0,
              ].filter(Boolean).length === 0 && (
                <li className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">All on track — great work!</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* ── Activity level footer ───────────────────────────────────────── */}
        {user.activityLevel && (
          <div className="flex items-center justify-between bg-white/40 border border-stone-200/60 rounded-2xl px-5 py-3.5">
            <div className="flex items-center gap-2 text-stone-500">
              <Activity className="w-4 h-4" />
              <span className="text-sm">Activity level:</span>
              <span className="text-sm font-semibold text-stone-700">
                {ACTIVITY_LABEL[user.activityLevel] ?? user.activityLevel}
              </span>
            </div>
            {user.height && user.weight && (
              <div className="text-sm text-stone-400">
                BMI:{" "}
                <span className="font-semibold text-stone-700">
                  {(user.weight / Math.pow(user.height / 100, 2)).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  )
}