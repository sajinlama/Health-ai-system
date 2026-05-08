"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Brain, Activity, Moon, Pill, Target, Heart,
  TrendingUp, AlertCircle, CheckCircle, BarChart2,
  Dumbbell, Utensils,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────
type HealthAnalysisData = {
  user: {
    fullName: string
    weight: number | null
    height: number | null
    activityLevel: string | null
    healthInfo: { hasChronicDisease: boolean; allergies: string[] } | null
    sleepSchedules: { targetHours: number; bedTime: string; wakeTime: string }[]
  }
  diseases: { diseaseType: string; diseaseName: string; diagnosedDate: string | null }[]
  medications: { id: string; medicationName: string; dosage: string }[]
  goals: { goalType: string; focusArea: string | null; targetWeight: number | null; description: string | null }[]
  sleepByDay:    { day: string; hours: number }[]
  exerciseByDay: { day: string; completed: number; status: string | null }[]
  weekStats: {
    mealsPlanned: number
    mealsCompleted: number
    workoutsPlanned: number
    workoutsCompleted: number
    avgSleepHours: number
    sleepTarget: number
    adherenceScore: number
  }
  todayMeds: { total: number; completed: number }
  healthScore: number
  latestWeeklyReport: {
    mealsPlanned: number; mealsCompleted: number
    workoutsPlanned: number; workoutsCompleted: number
    avgSleepHours: number; adherenceScore: number
  } | null
  aiRecommendations: { recommendationType: string; recommendation: string; createdAt: string }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DISEASE_ICON: Record<string, string> = {
  HYPERTENSION: "🫀", DIABETES: "🩸", HEART_DISEASE: "❤️",
  ASTHMA: "🫁", CANCER: "🎗️", KIDNEY_DISEASE: "🫘", OTHER: "🏥",
}

const GOAL_LABEL: Record<string, string> = {
  WEIGHT_LOSS: "Weight Loss", WEIGHT_GAIN: "Weight Gain",
  MUSCLE_GAIN: "Muscle Gain", GENERAL_WELLNESS: "General Wellness",
}

function pct(done: number, total: number) {
  return total === 0 ? 0 : Math.round((done / total) * 100)
}

function scoreColor(score: number) {
  if (score >= 8) return "text-green-600"
  if (score >= 6) return "text-amber-600"
  return "text-red-500"
}

function scoreLabel(score: number) {
  if (score >= 8) return { text: "Excellent", cls: "bg-green-100 text-green-700" }
  if (score >= 6) return { text: "Good",      cls: "bg-amber-100 text-amber-700" }
  return           { text: "Needs work",       cls: "bg-red-100 text-red-600" }
}

// ─── Reusable components ──────────────────────────────────────────────────────
function SectionCard({ title, icon, children, className = "" }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; className?: string
}) {
  return (
    <div className={`bg-white/60 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-5 hover:shadow-md transition-shadow duration-200 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-stone-400">{icon}</span>
        <h3 className="font-semibold text-stone-700 text-sm tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function ProgressBar({ value, color = "bg-stone-800", height = "h-1.5" }: {
  value: number; color?: string; height?: string
}) {
  return (
    <div className={`w-full bg-stone-100 rounded-full ${height} overflow-hidden`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  )
}

function StatPill({ label, value, cls }: { label: string; value: string; cls: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-stone-100 last:border-0">
      <span className="text-xs text-stone-500">{label}</span>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>{value}</span>
    </div>
  )
}

// ─── Bar chart ────────────────────────────────────────────────────────────────
function MiniBar({ value, max, color, label, sublabel }: {
  value: number; max: number; color: string; label: string; sublabel?: string
}) {
  const pctH = max === 0 ? 0 : Math.min((value / max) * 100, 100)
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-[10px] text-stone-400 font-medium">{value > 0 ? value : ""}</span>
      <div className="w-full bg-stone-100 rounded-t-md relative" style={{ height: "80px" }}>
        <div
          className={`absolute bottom-0 left-0 right-0 rounded-t-md transition-all duration-700 ${color}`}
          style={{ height: `${pctH}%` }}
        />
      </div>
      <span className="text-[10px] text-stone-400">{label}</span>
      {sublabel && <span className="text-[9px] text-stone-300">{sublabel}</span>}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-stone-200/60 rounded-xl ${className}`} />
}

function PageSkeleton() {
  return (
    <section className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-20" />
        <div className="grid md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-52" />)}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HealthAnalysisPage() {
  const { data, isLoading, isError } = useQuery<HealthAnalysisData>({
    queryKey: ["health-analysis"],
    queryFn: async () => {
      const res = await fetch("/api/health-analysis")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) return <PageSkeleton />

  if (isError || !data) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="text-center space-y-2">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-stone-500 text-sm">Failed to load health analysis. Please refresh.</p>
        </div>
      </section>
    )
  }

  const {
    user, diseases, medications, goals,
    sleepByDay, exerciseByDay, weekStats,
    todayMeds, healthScore, latestWeeklyReport,
    aiRecommendations,
  } = data

  const report     = latestWeeklyReport ?? weekStats
  const mealPct    = pct(report.mealsCompleted, report.mealsPlanned)
  const workoutPct = pct(report.workoutsCompleted, report.workoutsPlanned)
  const medPct     = todayMeds.total === 0 ? 100 : pct(todayMeds.completed, todayMeds.total)
  const sl         = scoreLabel(healthScore)
  const maxSleep   = Math.max(...sleepByDay.map((d) => d.hours), weekStats.sleepTarget)

  return (
    <section className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              Health Analysis 📊
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Your detailed wellness &amp; vitals overview
            </p>
          </div>
          <div className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border ${sl.cls} border-current/20`}>
            <TrendingUp className="w-4 h-4" />
            Health Score: <span className="font-bold">{healthScore}/10</span> — {sl.text}
          </div>
        </div>

        {/* ── Condition alert ──────────────────────────────────────────── */}
        {diseases.length > 0 && (
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5 w-5 h-5" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {DISEASE_ICON[diseases[0].diseaseType] ?? "🏥"} Active Condition: {diseases[0].diseaseName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ongoing monitoring required. Keep consistent with medication and maintain healthy lifestyle habits.
                  {diseases[0].diagnosedDate && (
                    <span className="ml-2 text-xs opacity-60">
                      Diagnosed {new Date(diseases[0].diagnosedDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Vital metric cards ───────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Health score */}
          <div className="bg-white/60 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <Heart className="w-4 h-4 text-stone-400" />
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sl.cls}`}>{sl.text}</span>
            </div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Health Score</p>
            <p className={`text-3xl font-bold tracking-tight ${scoreColor(healthScore)}`}>{healthScore}<span className="text-base font-normal text-stone-400">/10</span></p>
          </div>

          {/* Sleep */}
          <div className="bg-white/60 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <Moon className="w-4 h-4 text-stone-400" />
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${weekStats.avgSleepHours >= weekStats.sleepTarget ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                Target {weekStats.sleepTarget}h
              </span>
            </div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Avg Sleep</p>
            <p className="text-3xl font-bold tracking-tight text-stone-800">{weekStats.avgSleepHours}<span className="text-base font-normal text-stone-400">h</span></p>
          </div>

          {/* Medication */}
          <div className="bg-white/60 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <Pill className="w-4 h-4 text-stone-400" />
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${medPct === 100 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                Today
              </span>
            </div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Medications</p>
            <p className="text-3xl font-bold tracking-tight text-stone-800">
              {todayMeds.completed}<span className="text-base font-normal text-stone-400">/{todayMeds.total} taken</span>
            </p>
          </div>

          {/* Adherence */}
          <div className="bg-white/60 backdrop-blur-sm border border-stone-200/80 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <Activity className="w-4 h-4 text-stone-400" />
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${weekStats.adherenceScore >= 80 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                7-day
              </span>
            </div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-1">Adherence</p>
            <p className="text-3xl font-bold tracking-tight text-stone-800">{weekStats.adherenceScore}<span className="text-base font-normal text-stone-400">%</span></p>
          </div>
        </div>

        {/* ── 3-col grid ───────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-5">

          {/* Medications */}
          <SectionCard title="Medications" icon={<Pill className="w-4 h-4" />}>
            <div className="mb-4">
              <p className={`text-3xl font-bold tracking-tight ${medPct === 100 ? "text-green-600" : "text-amber-600"}`}>
                {todayMeds.completed}/{todayMeds.total}
                <span className="text-sm font-normal text-stone-400 ml-1">taken today</span>
              </p>
              <div className="mt-2">
                <ProgressBar value={medPct} color={medPct === 100 ? "bg-green-500" : "bg-amber-400"} />
              </div>
            </div>
            <div className="space-y-0">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">Active</p>
              {medications.length === 0 && (
                <p className="text-sm text-stone-400 italic">No medications recorded</p>
              )}
              {medications.map((med) => (
                <div key={med.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                  <span className="text-sm text-stone-700">{med.medicationName}</span>
                  <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{med.dosage}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Goals */}
          <SectionCard title="Wellness Goals" icon={<Target className="w-4 h-4" />}>
            <div className="mb-4">
              <p className="text-3xl font-bold tracking-tight text-blue-600">
                {weekStats.adherenceScore}%
                <span className="text-sm font-normal text-stone-400 ml-1">weekly progress</span>
              </p>
            </div>
            <div className="space-y-3">
              {/* Meals */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Utensils className="w-3 h-3" />
                    Meals
                  </div>
                  <span className="text-xs font-semibold text-stone-700">{report.mealsCompleted}/{report.mealsPlanned}</span>
                </div>
                <ProgressBar value={mealPct} color="bg-amber-400" />
              </div>
              {/* Exercise */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Dumbbell className="w-3 h-3" />
                    Workouts
                  </div>
                  <span className="text-xs font-semibold text-stone-700">{report.workoutsCompleted}/{report.workoutsPlanned}</span>
                </div>
                <ProgressBar value={workoutPct} color="bg-green-500" />
              </div>
              {/* Sleep */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Moon className="w-3 h-3" />
                    Sleep avg
                  </div>
                  <span className="text-xs font-semibold text-stone-700">{weekStats.avgSleepHours}h</span>
                </div>
                <ProgressBar value={pct(weekStats.avgSleepHours, weekStats.sleepTarget)} color="bg-indigo-400" />
              </div>
              {/* Goals */}
              {goals.slice(0, 2).map((g, i) => (
                <div key={i} className="flex items-center gap-2 pt-1">
                  {weekStats.adherenceScore >= 80
                    ? <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    : <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                  <span className="text-xs text-stone-500">{GOAL_LABEL[g.goalType]}{g.focusArea ? ` — ${g.focusArea}` : ""}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Health score breakdown */}
          <SectionCard title="Health Score" icon={<TrendingUp className="w-4 h-4" />}>
            <div className="mb-4">
              <p className={`text-3xl font-bold tracking-tight ${scoreColor(healthScore)}`}>
                {healthScore}<span className="text-sm font-normal text-stone-400">/10</span>
              </p>
              <div className="mt-2">
                <ProgressBar value={(healthScore / 10) * 100} color={healthScore >= 8 ? "bg-green-500" : healthScore >= 6 ? "bg-amber-400" : "bg-red-400"} height="h-2" />
              </div>
            </div>
            <div className="space-y-0">
              <StatPill
                label="Medication"
                value={medPct === 100 ? "Excellent" : medPct >= 70 ? "Good" : "Needs work"}
                cls={medPct === 100 ? "bg-green-100 text-green-700" : medPct >= 70 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}
              />
              <StatPill
                label="Sleep"
                value={weekStats.avgSleepHours >= weekStats.sleepTarget ? "On target" : `${weekStats.avgSleepHours}h / ${weekStats.sleepTarget}h`}
                cls={weekStats.avgSleepHours >= weekStats.sleepTarget ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}
              />
              <StatPill
                label="Exercise"
                value={workoutPct >= 80 ? "Excellent" : workoutPct >= 50 ? "Good" : "Low"}
                cls={workoutPct >= 80 ? "bg-green-100 text-green-700" : workoutPct >= 50 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}
              />
              <StatPill
                label="Nutrition"
                value={mealPct >= 80 ? "On track" : "Behind"}
                cls={mealPct >= 80 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}
              />
              {diseases.length > 0 && (
                <StatPill
                  label="Condition"
                  value="Monitored"
                  cls="bg-blue-100 text-blue-700"
                />
              )}
            </div>
          </SectionCard>
        </div>

        {/* ── Charts ───────────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Sleep chart */}
          <SectionCard title="Weekly Sleep" icon={<Moon className="w-4 h-4" />}>
            <p className="text-xs text-stone-400 mb-3">Hours of sleep per night</p>
            <div className="flex items-end gap-1.5 h-24 mb-2">
              {sleepByDay.map((d, i) => (
                <MiniBar
                  key={i}
                  value={parseFloat(d.hours.toFixed(1))}
                  max={maxSleep}
                  color={d.hours >= weekStats.sleepTarget ? "bg-indigo-400" : d.hours >= weekStats.sleepTarget - 1 ? "bg-indigo-300" : "bg-stone-200"}
                  label={d.day}
                />
              ))}
            </div>
            {/* Target line label */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-6 border-t-2 border-dashed border-indigo-300" />
              <span className="text-xs text-stone-400">Target: {weekStats.sleepTarget}h</span>
              <span className="ml-auto text-xs font-semibold text-stone-600">
                Avg: {weekStats.avgSleepHours}h
                {weekStats.avgSleepHours < weekStats.sleepTarget
                  ? <span className="text-amber-500 ml-1">⚠️</span>
                  : <span className="text-green-500 ml-1">✓</span>}
              </span>
            </div>
          </SectionCard>

          {/* Exercise chart */}
          <SectionCard title="Weekly Exercise" icon={<Dumbbell className="w-4 h-4" />}>
            <p className="text-xs text-stone-400 mb-3">Workout completion per day</p>
            <div className="flex items-end gap-1.5 h-24 mb-2">
              {exerciseByDay.map((d, i) => (
                <MiniBar
                  key={i}
                  value={d.completed}
                  max={1}
                  color={d.status === "DONE" ? "bg-green-400" : d.status === "SKIPPED" ? "bg-stone-200" : "bg-stone-100"}
                  label={d.day}
                />
              ))}
            </div>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-green-400" />
                <span className="text-xs text-stone-400">Done</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-stone-200" />
                <span className="text-xs text-stone-400">Skipped / Pending</span>
              </div>
              <span className="ml-auto text-xs font-semibold text-stone-600">
                {report.workoutsCompleted}/{report.workoutsPlanned} this week
              </span>
            </div>
          </SectionCard>
        </div>

        {/* ── Bottom: weekly summary + AI insights + actions ───────────── */}
        <div className="space-y-5">

          {/* Weekly summary */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-5">
            <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-primary" />
              Weekly Summary
            </h3>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground">
              <p>
                {medPct >= 80 ? "✅" : "⚠️"}{" "}
                <span className="font-medium text-stone-700">Medication:</span>{" "}
                {todayMeds.completed}/{todayMeds.total} today ({medPct}%)
              </p>
              <p>
                {mealPct >= 80 ? "✅" : "⚠️"}{" "}
                <span className="font-medium text-stone-700">Meals:</span>{" "}
                {report.mealsCompleted}/{report.mealsPlanned} completed
              </p>
              <p>
                {weekStats.avgSleepHours >= weekStats.sleepTarget ? "✅" : "⚠️"}{" "}
                <span className="font-medium text-stone-700">Sleep:</span>{" "}
                {weekStats.avgSleepHours}h avg (target {weekStats.sleepTarget}h)
              </p>
              <p>
                {workoutPct >= 80 ? "✅" : "⚠️"}{" "}
                <span className="font-medium text-stone-700">Workouts:</span>{" "}
                {report.workoutsCompleted}/{report.workoutsPlanned} done
              </p>
            </div>
          </div>

          {/* AI Insights */}
          <SectionCard title="AI Insights" icon={<Brain className="w-4 h-4" />}>
            {aiRecommendations.length === 0 ? (
              <p className="text-sm text-stone-400 italic">No AI recommendations yet. Keep logging your data!</p>
            ) : (
              <div className="space-y-3">
                {aiRecommendations.map((rec, i) => (
                  <div key={i} className="p-3.5 bg-primary/5 rounded-xl border border-primary/10">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
                      💡 {rec.recommendationType}
                    </p>
                    <p className="text-sm text-stone-600 leading-relaxed">{rec.recommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Recommended actions */}
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-5">
            <h3 className="font-semibold text-stone-700 mb-3 flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-blue-500" />
              Recommended Actions
            </h3>
            <ul className="space-y-2.5">
              {([
                weekStats.avgSleepHours < weekStats.sleepTarget &&
                  `Improve sleep — aim for ${weekStats.sleepTarget}h/night consistently`,
                medications.length > 0 && medPct < 100 &&
                  `Take remaining ${todayMeds.total - todayMeds.completed} medication(s) as scheduled`,
                workoutPct < 80 &&
                  "Stay consistent with your exercise plan this week",
                mealPct < 80 &&
                  "Follow your nutrition plan to hit meal targets",
                diseases.length > 0 &&
                  "Log your daily health vitals for condition monitoring",
                weekStats.adherenceScore >= 80 &&
                  "Excellent adherence — maintain your current routine",
              ] as (string | false)[])
                .filter((x): x is string => Boolean(x))
                .slice(0, 4)
                .map((action, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="font-bold text-blue-500 text-sm mt-0.5">{i + 1}.</span>
                    <span className="text-sm text-muted-foreground">{action}</span>
                  </li>
                ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  )
}