"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Brain, Activity, Moon, Pill, Target, Heart,
  TrendingUp, AlertCircle, CheckCircle, Flame,
  Utensils, BedDouble, Bell, Dumbbell, Sparkles, Zap,
} from "lucide-react"
import { Card } from "@/components/ui/card"

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

const REC_TYPE_COLORS: Record<string, string> = {
  NUTRITION:     "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
  EXERCISE:      "from-green-500/20 to-emerald-500/10 border-green-500/30 text-green-400",
  SLEEP:         "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400",
  MEDICATION:    "from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-400",
  LIFESTYLE:     "from-purple-500/20 to-violet-500/10 border-purple-500/30 text-purple-400",
  MENTAL_HEALTH: "from-cyan-500/20 to-teal-500/10 border-cyan-500/30 text-cyan-400",
}

function pct(done: number, total: number) {
  if (total === 0) return 0
  return Math.round((done / total) * 100)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, sub, accentClass,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  accentClass?: string
}) {
  return (
    <Card className="p-5 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50 hover:border-border hover:from-secondary/60 hover:to-secondary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group cursor-default">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
          <span className="text-background [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${accentClass ?? "bg-secondary/60 border-border/50 text-muted-foreground"}`}>
          {sub}
        </span>
      </div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
    </Card>
  )
}

function ProgressBar({ value, colorClass = "bg-primary" }: { value: number; colorClass?: string }) {
  return (
    <div className="w-full bg-secondary/60 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  )
}

function SectionCard({ title, icon, iconBg, children }: {
  title: string
  icon: React.ReactNode
  iconBg?: string
  children: React.ReactNode
}) {
  return (
    <Card className="p-5 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg ?? "bg-gradient-to-br from-primary to-accent"}`}>
          <span className="text-background [&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span>
        </div>
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      </div>
      {children}
    </Card>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-secondary/60 rounded-xl ${className}`} />
}

function DashboardSkeleton() {
  return (
    <section className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48" />)}
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
      <section className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-muted-foreground text-sm">Failed to load dashboard. Please refresh.</p>
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
    <section className="min-h-screen py-8 px-6 bg-background relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-muted-foreground mt-1">Your chronic care &amp; wellness overview</p>
          </div>
          {todayReminders.pending > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium px-3.5 py-2 rounded-xl">
              <Bell className="w-4 h-4" />
              {todayReminders.pending} pending today
            </div>
          )}
        </div>

        {/* ── Chronic condition alert ─────────────────────────────────────── */}
        {diseases.length > 0 && (
          <Card className="p-5 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {DISEASE_ICON[diseases[0].diseaseType] ?? "🏥"} Active Condition:{" "}
                  {diseases[0].diseaseName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ongoing monitoring required. Stay consistent with medication and maintain healthy lifestyle habits.
                  {diseases[0].diagnosedDate && (
                    <span className="ml-2 text-xs opacity-60">
                      Since {new Date(diseases[0].diagnosedDate).getFullYear()}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ── Vital metric cards ──────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Activity />}
            label="Weight"
            value={user.weight ? `${user.weight} kg` : "—"}
            sub="Stable"
            accentClass="bg-green-500/10 border-green-500/30 text-green-400"
          />
          <StatCard
            icon={<Moon />}
            label="Avg Sleep"
            value={weekStats.avgSleepHours ? `${weekStats.avgSleepHours}h` : "—"}
            sub="This week"
            accentClass={weekStats.avgSleepHours >= 7
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-amber-500/10 border-amber-500/30 text-amber-400"}
          />
          <StatCard
            icon={<Flame />}
            label="Adherence"
            value={`${weekStats.adherenceScore}%`}
            sub="7-day"
            accentClass={weekStats.adherenceScore >= 80
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-amber-500/10 border-amber-500/30 text-amber-400"}
          />
          <StatCard
            icon={<Target />}
            label="Primary Goal"
            value={primaryGoal ? GOAL_LABEL[primaryGoal.goalType] : "—"}
            sub={primaryGoal?.focusArea ?? "Active"}
            accentClass="bg-primary/10 border-primary/30 text-primary"
          />
        </div>

        {/* ── Main 3-col grid ─────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-5">

          {/* Medication */}
          <SectionCard title="Medication" icon={<Pill />} iconBg="bg-gradient-to-br from-pink-500 to-rose-600">
            <div className="mb-4 p-3 rounded-xl bg-secondary/40 border border-border/30">
              <p className="text-3xl font-bold text-green-400 tracking-tight">
                {weekStats.adherenceScore}%
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Adherence this week</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Medications</p>
              {medications.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No medications recorded</p>
              )}
              {medications.map((med, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <span className="text-sm text-foreground">{med.medicationName}</span>
                  <span className="text-xs bg-secondary/60 border border-border/40 text-muted-foreground px-2 py-0.5 rounded-full">
                    {med.dosage}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Conditions */}
          <SectionCard title="Conditions" icon={<Heart />} iconBg="bg-gradient-to-br from-red-500 to-rose-600">
            {diseases.length === 0 ? (
              <div className="flex items-center gap-2 text-green-400 p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">No chronic conditions</span>
              </div>
            ) : (
              <div className="space-y-3">
                {diseases.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-500/5 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-colors">
                    <span className="text-xl">{DISEASE_ICON[d.diseaseType] ?? "🏥"}</span>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{d.diseaseName}</p>
                      {d.diagnosedDate && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Since {new Date(d.diagnosedDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1.5">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-muted-foreground">Active monitoring</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Weekly progress */}
          <SectionCard title="Weekly Progress" icon={<TrendingUp />} iconBg="bg-gradient-to-br from-primary to-accent">
            <div className="space-y-4">
              {[
                { label: "Meals", done: report.mealsCompleted, total: report.mealsPlanned, colorClass: "bg-amber-400", val: mealPct },
                { label: "Workouts", done: report.workoutsCompleted, total: report.workoutsPlanned, colorClass: "bg-green-500", val: workoutPct },
                { label: "Sleep avg", done: report.avgSleepHours, total: 8, colorClass: "bg-blue-400", val: pct(report.avgSleepHours, 8), unit: "h" },
                { label: "Adherence", done: report.adherenceScore, total: 100, colorClass: "bg-primary", val: report.adherenceScore, unit: "%" },
              ].map((row, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-xs font-semibold text-foreground">
                      {row.unit ? `${row.done}${row.unit}` : `${row.done}/${row.total}`}
                    </span>
                  </div>
                  <ProgressBar value={row.val} colorClass={row.colorClass} />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ── Today's reminders + AI insight ─────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Today's reminders */}
          <SectionCard title="Today's Reminders" icon={<Bell />} iconBg="bg-gradient-to-br from-amber-500 to-orange-500">
            {todayReminders.items.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No reminders scheduled for today</p>
            ) : (
              <div className="space-y-1">
                {todayReminders.items.slice(0, 6).map((r, i) => {
                  const typeConfig: Record<string, { bg: string; icon: React.ReactNode }> = {
                    MEAL:       { bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",  icon: <Utensils  className="w-3.5 h-3.5" /> },
                    EXERCISE:   { bg: "bg-green-500/10 border-green-500/20 text-green-400",  icon: <Dumbbell  className="w-3.5 h-3.5" /> },
                    SLEEP:      { bg: "bg-blue-500/10 border-blue-500/20 text-blue-400",     icon: <BedDouble className="w-3.5 h-3.5" /> },
                    MEDICATION: { bg: "bg-pink-500/10 border-pink-500/20 text-pink-400",     icon: <Pill      className="w-3.5 h-3.5" /> },
                  }
                  const cfg = typeConfig[r.type] ?? typeConfig.MEDICATION
                  return (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-2.5">
                        <span className={`p-1.5 rounded-lg border ${cfg.bg}`}>{cfg.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground capitalize">{r.type.toLowerCase()}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(r.reminderTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        r.status === "COMPLETED" ? "bg-green-500/10 border-green-500/30 text-green-400" :
                        r.status === "SKIPPED"   ? "bg-secondary/60 border-border/40 text-muted-foreground" :
                                                   "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      }`}>
                        {r.status === "COMPLETED" ? "✓ Done" : r.status === "SKIPPED" ? "Skipped" : "Pending"}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>

          {/* AI recommendations */}
          <SectionCard title="AI Insights" icon={<Brain />} iconBg="bg-gradient-to-br from-violet-500 to-purple-600">
            {aiRecommendations.length === 0 ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                <p className="text-sm italic">No recommendations yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {aiRecommendations.map((rec, i) => {
                  const colorCls = REC_TYPE_COLORS[rec.recommendationType] ?? REC_TYPE_COLORS.LIFESTYLE
                  return (
                    <div key={i} className={`p-3 bg-gradient-to-br ${colorCls} rounded-xl border`}>
                      <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${colorCls.split(" ").pop()}`}>
                        {rec.recommendationType.replace("_", " ")}
                      </p>
                      <p className="text-sm text-foreground/80 leading-relaxed">{rec.recommendation}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Weekly summary + Recommended actions ───────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5">

          <Card className="p-5 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 hover:border-primary/40 transition-all">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <CheckCircle className="w-3.5 h-3.5 text-background" />
              </div>
              Weekly Summary
            </h3>
            <div className="space-y-2.5 text-sm">
              {[
                { ok: mealPct >= 80,                    label: "Meals",     detail: `${report.mealsCompleted}/${report.mealsPlanned} completed (${mealPct}%)` },
                { ok: workoutPct >= 80,                 label: "Workouts",  detail: `${report.workoutsCompleted}/${report.workoutsPlanned} completed (${workoutPct}%)` },
                { ok: report.avgSleepHours >= 7,        label: "Sleep",     detail: `${report.avgSleepHours}h avg (target: 7–8h)` },
                { ok: report.adherenceScore >= 80,      label: "Adherence", detail: `${report.adherenceScore}% overall` },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span>{row.ok ? "✅" : "⚠️"}</span>
                  <span className="font-medium text-foreground">{row.label}:</span>
                  <span className="text-muted-foreground">{row.detail}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40 transition-all">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-background" />
              </div>
              Recommended Actions
            </h3>
            <ul className="space-y-2.5">
              {([
                medications.length > 0 && `Take ${medications[0].medicationName} as scheduled`,
                report.avgSleepHours < 7 && "Improve sleep — aim for 7+ hours per night",
                workoutPct < 80 && "Stay consistent with your exercise plan this week",
                diseases.length > 0 && "Log your health vitals for condition monitoring",
              ] as (string | false)[])
                .filter(Boolean)
                .slice(0, 4)
                .map((action, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-400">{i + 1}</span>
                    </span>
                    <span className="text-sm text-muted-foreground">{action as string}</span>
                  </li>
                ))}
              {[
                medications.length > 0,
                report.avgSleepHours < 7,
                workoutPct < 80,
                diseases.length > 0,
              ].filter(Boolean).length === 0 && (
                <li className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">All on track — great work!</span>
                </li>
              )}
            </ul>
          </Card>
        </div>

        {/* ── Activity level footer ───────────────────────────────────────── */}
        {user.activityLevel && (
          <Card className="px-5 py-3.5 bg-secondary/20 border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="w-4 h-4" />
                <span className="text-sm">Activity level:</span>
                <span className="text-sm font-semibold text-foreground">
                  {ACTIVITY_LABEL[user.activityLevel] ?? user.activityLevel}
                </span>
              </div>
              {user.height && user.weight && (
                <div className="text-sm text-muted-foreground">
                  BMI:{" "}
                  <span className="font-semibold text-foreground">
                    {(user.weight / Math.pow(user.height / 100, 2)).toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

      </div>
    </section>
  )
}