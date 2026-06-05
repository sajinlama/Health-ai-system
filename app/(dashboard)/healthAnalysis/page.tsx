"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Brain, Activity, Moon, Pill, Target, Heart,
  TrendingUp, AlertCircle, CheckCircle, BarChart2,
  Dumbbell, Utensils, Clock, Sun, Sparkles, Calendar,
  Droplets, Zap, Award, TrendingDown, Flame, Leaf,
  BedDouble, Coffee, Users, Battery, Shield
} from "lucide-react"
import { Card } from "@/components/ui/card"

// ─── Types ────────────────────────────────────────────────────────────────────
type HealthAnalysisData = {
  user: {
    fullName: string
    weight: number | null
    height: number | null
    activityLevel: string | null
    bmi: number | null
    bmiCategory: string
    healthInfo: { hasChronicDisease: boolean; allergies: string[] } | null
    sleepSchedules: { targetHours: number; bedTime: string; wakeTime: string }[]
  }
  diseases: { diseaseType: string; diseaseName: string; diagnosedDate: string | null }[]
  medications: { id: string; medicationName: string; dosage: string; frequency: string; scheduledTimes: string[] }[]
  goals: { goalType: string; focusArea: string | null; targetWeight: number | null; description: string | null }[]
  sleepByDay: { day: string; hours: number }[]
  exerciseByDay: { day: string; completed: number; total: number; completionRate: number }[]
  medicationByDay: { day: string; taken: number; total: number; adherenceRate: number }[]
  weekStats: {
    mealsPlanned: number
    mealsCompleted: number
    workoutsPlanned: number
    workoutsCompleted: number
    medsPlanned: number
    medsTaken: number
    avgSleepHours: number
    sleepTarget: number
    adherenceScore: number
    mealCompletionRate: number
    workoutCompletionRate: number
    medCompletionRate: number
  }
  todayMeds: { total: number; taken: number; completionRate: number }
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

const ACTIVITY_ICON: Record<string, React.ReactNode> = {
  SEDENTARY: <Coffee className="w-4 h-4" />,
  LIGHTLY_ACTIVE: <Users className="w-4 h-4" />,
  MODERATELY_ACTIVE: <Activity className="w-4 h-4" />,
  VERY_ACTIVE: <Battery className="w-4 h-4" />,
}

const ACTIVITY_LABEL: Record<string, string> = {
  SEDENTARY: "Sedentary",
  LIGHTLY_ACTIVE: "Lightly Active",
  MODERATELY_ACTIVE: "Moderately Active",
  VERY_ACTIVE: "Very Active",
}

const GOAL_LABEL: Record<string, string> = {
  WEIGHT_LOSS: "Weight Loss", WEIGHT_GAIN: "Weight Gain",
  MUSCLE_GAIN: "Muscle Gain", GENERAL_WELLNESS: "General Wellness",
}

const GOAL_ICON: Record<string, React.ReactNode> = {
  WEIGHT_LOSS: <TrendingDown className="w-3.5 h-3.5" />,
  WEIGHT_GAIN: <TrendingUp className="w-3.5 h-3.5" />,
  MUSCLE_GAIN: <Zap className="w-3.5 h-3.5" />,
  GENERAL_WELLNESS: <Heart className="w-3.5 h-3.5" />,
}

function pct(done: number, total: number) {
  return total === 0 ? 0 : Math.round((done / total) * 100)
}

function scoreColor(score: number) {
  if (score >= 8) return "text-green-400"
  if (score >= 6) return "text-amber-400"
  return "text-red-400"
}

function scoreBgColor(score: number) {
  if (score >= 8) return "from-green-500 to-emerald-500"
  if (score >= 6) return "from-amber-500 to-orange-500"
  return "from-red-500 to-rose-500"
}

function scoreLabel(score: number) {
  if (score >= 8) return { text: "Excellent", cls: "bg-green-500/20 text-green-400 border-green-500/30" }
  if (score >= 6) return { text: "Good", cls: "bg-amber-500/20 text-amber-400 border-amber-500/30" }
  return { text: "Needs work", cls: "bg-red-500/20 text-red-400 border-red-500/30" }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-secondary/40 rounded-xl ${className}`} />
}

function PageSkeleton() {
  return (
    <section className="min-h-screen py-8 px-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-24" />
        <div className="grid md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-80" />)}
        </div>
      </div>
    </section>
  )
}

// ─── Stat Card Component ─────────────────────────────────────────────────────
function StatCard({ title, value, subtitle, icon, trend, trendValue, color }: {
  title: string; value: string | number; subtitle?: string; icon: React.ReactNode;
  trend?: "up" | "down" | "neutral"; trendValue?: string; color?: string
}) {
  return (
    <Card className="p-5 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50 hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted-foreground">{icon}</span>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            trend === "up" ? "bg-green-500/20 text-green-400" :
            trend === "down" ? "bg-red-500/20 text-red-400" :
            "bg-secondary/60 text-muted-foreground"
          }`}>
            {trendValue}
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
      <p className={`text-3xl font-bold tracking-tight ${color || "text-foreground"}`}>{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </Card>
  )
}

// ─── Progress Ring Component ─────────────────────────────────────────────────
function ProgressRing({ value, size = 120, strokeWidth = 8, color }: {
  value: number; size?: number; strokeWidth?: number; color?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-secondary/40"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={`${color || "text-primary"} transition-all duration-1000`}
      />
    </svg>
  )
}

// ─── Mini Bar Chart Component ────────────────────────────────────────────────
function MiniBar({ value, max, color, label, sublabel }: {
  value: number; max: number; color: string; label: string; sublabel?: string
}) {
  const pctH = max === 0 ? 0 : Math.min((value / max) * 100, 100)
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-[10px] text-muted-foreground font-medium">{value > 0 ? value.toFixed(1) : ""}</span>
      <div className="w-full bg-secondary/40 rounded-t-md relative" style={{ height: "80px" }}>
        <div
          className={`absolute bottom-0 left-0 right-0 rounded-t-md transition-all duration-700 ${color}`}
          style={{ height: `${pctH}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
      {sublabel && <span className="text-[9px] text-muted-foreground/60">{sublabel}</span>}
    </div>
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
      <section className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-muted-foreground text-sm">Failed to load health analysis. Please refresh.</p>
        </div>
      </section>
    )
  }

  const {
    user, diseases, medications, goals,
    sleepByDay, exerciseByDay, medicationByDay,
    weekStats, todayMeds, healthScore, aiRecommendations,
  } = data

  const sl = scoreLabel(healthScore)
  const maxSleep = Math.max(...sleepByDay.map((d) => d.hours), weekStats.sleepTarget)
  const maxExercise = Math.max(...exerciseByDay.map((d) => d.completionRate), 100)
  const maxMedication = Math.max(...medicationByDay.map((d) => d.adherenceRate), 100)

  return (
    <section className="min-h-screen py-8 px-6 bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Health Analysis 📊
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Your detailed wellness &amp; vitals overview
            </p>
          </div>
          <div className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-gradient-to-r ${scoreBgColor(healthScore)}/10 border ${scoreBgColor(healthScore)}/30`}>
            <Sparkles className="w-4 h-4" />
            Health Score: <span className={`font-bold ${scoreColor(healthScore)}`}>{healthScore}/10</span> — <span className={scoreColor(healthScore)}>{sl.text}</span>
          </div>
        </div>

        {/* ── Condition alert ────────────────────────────────────────── */}
        {diseases.length > 0 && (
          <Card className="p-5 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5 w-5 h-5" />
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
          </Card>
        )}

        {/* ── Stat Cards ─────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Health Score"
            value={`${healthScore}/10`}
            subtitle={sl.text}
            icon={<Heart className="w-4 h-4" />}
            trend={healthScore >= 8 ? "up" : healthScore >= 6 ? "neutral" : "down"}
            trendValue={sl.text}
            color={scoreColor(healthScore)}
          />

          <StatCard
            title="Avg Sleep"
            value={`${weekStats.avgSleepHours}h`}
            subtitle={`Target: ${weekStats.sleepTarget}h`}
            icon={<Moon className="w-4 h-4" />}
            trend={weekStats.avgSleepHours >= weekStats.sleepTarget ? "up" : "down"}
            trendValue={weekStats.avgSleepHours >= weekStats.sleepTarget ? "On target" : "Low"}
          />

          <StatCard
            title="Medications"
            value={`${todayMeds.taken}/${todayMeds.total}`}
            subtitle="taken today"
            icon={<Pill className="w-4 h-4" />}
            trend={todayMeds.completionRate === 100 ? "up" : todayMeds.completionRate >= 70 ? "neutral" : "down"}
            trendValue={todayMeds.completionRate === 100 ? "Complete" : "Pending"}
          />

          <StatCard
            title="Adherence"
            value={`${weekStats.adherenceScore}%`}
            subtitle="7-day average"
            icon={<Activity className="w-4 h-4" />}
            trend={weekStats.adherenceScore >= 80 ? "up" : weekStats.adherenceScore >= 60 ? "neutral" : "down"}
            trendValue={weekStats.adherenceScore >= 80 ? "Excellent" : weekStats.adherenceScore >= 60 ? "Good" : "Needs work"}
          />
        </div>

        {/* ── 3-col grid ───────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Health Score Breakdown with Ring */}
          <Card className="p-5 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-muted-foreground"><TrendingUp className="w-4 h-4" /></span>
              <h3 className="font-semibold text-foreground text-sm tracking-tight">Health Score Breakdown</h3>
            </div>
            
            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                <ProgressRing value={healthScore * 10} size={100} strokeWidth={6} color={scoreColor(healthScore).replace("text-", "text")} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${scoreColor(healthScore)}`}>{healthScore}</span>
                </div>
              </div>
              <p className={`text-xs font-medium mt-2 px-2 py-0.5 rounded-full border ${sl.cls}`}>{sl.text}</p>
            </div>

            <div className="space-y-2">
              <StatPill
                label="Medication"
                value={`${weekStats.medCompletionRate.toFixed(0)}%`}
                cls={weekStats.medCompletionRate >= 90 ? "bg-green-500/20 text-green-400" : weekStats.medCompletionRate >= 70 ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"}
              />
              <StatPill
                label="Sleep"
                value={`${weekStats.avgSleepHours}h / ${weekStats.sleepTarget}h`}
                cls={weekStats.avgSleepHours >= weekStats.sleepTarget ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}
              />
              <StatPill
                label="Exercise"
                value={`${weekStats.workoutCompletionRate.toFixed(0)}%`}
                cls={weekStats.workoutCompletionRate >= 80 ? "bg-green-500/20 text-green-400" : weekStats.workoutCompletionRate >= 50 ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"}
              />
              <StatPill
                label="Nutrition"
                value={`${weekStats.mealCompletionRate.toFixed(0)}%`}
                cls={weekStats.mealCompletionRate >= 80 ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}
              />
            </div>
          </Card>

          {/* Medications Section */}
          <Card className="p-5 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-muted-foreground"><Pill className="w-4 h-4" /></span>
              <h3 className="font-semibold text-foreground text-sm tracking-tight">Medications</h3>
            </div>
            
            <div className="mb-4">
              <p className={`text-3xl font-bold tracking-tight ${todayMeds.completionRate === 100 ? "text-green-400" : "text-amber-400"}`}>
                {todayMeds.taken}/{todayMeds.total}
                <span className="text-sm font-normal text-muted-foreground ml-1">taken today</span>
              </p>
              <div className="mt-2">
                <ProgressBar value={todayMeds.completionRate} color={todayMeds.completionRate === 100 ? "bg-green-500" : "bg-amber-400"} />
              </div>
            </div>
            
            <div className="space-y-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Active Medications</p>
              {medications.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No medications recorded</p>
              )}
              {medications.slice(0, 4).map((med) => (
                <div key={med.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm text-foreground">{med.medicationName}</span>
                  <span className="text-xs bg-secondary/60 text-muted-foreground px-2 py-0.5 rounded-full">{med.dosage}</span>
                </div>
              ))}
              {medications.length > 4 && (
                <p className="text-xs text-muted-foreground italic mt-2">+{medications.length - 4} more</p>
              )}
            </div>
          </Card>

          {/* Profile Snapshot */}
          <Card className="p-5 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-muted-foreground"><Activity className="w-4 h-4" /></span>
              <h3 className="font-semibold text-foreground text-sm tracking-tight">Profile Snapshot</h3>
            </div>
            
            <div className="space-y-3">
              {user.bmi && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">BMI</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-foreground">{user.bmi}</span>
                    <span className="text-xs text-muted-foreground ml-2">({user.bmiCategory})</span>
                  </div>
                </div>
              )}
              {user.activityLevel && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Activity Level</span>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                    {ACTIVITY_ICON[user.activityLevel]} {ACTIVITY_LABEL[user.activityLevel]}
                  </span>
                </div>
              )}
              {user.weight && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Current Weight</span>
                  <span className="text-sm font-semibold text-foreground">{user.weight} kg</span>
                </div>
              )}
              {user.height && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Height</span>
                  <span className="text-sm font-semibold text-foreground">{user.height} cm</span>
                </div>
              )}
              {user.sleepSchedules?.[0] && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Moon className="w-3 h-3" />
                    Sleep target: {user.sleepSchedules[0].targetHours}h/night
                  </div>
                </div>
              )}
            </div>

            {/* Goals summary */}
            {goals.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Active Goals</p>
                {goals.slice(0, 2).map((goal, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    {GOAL_ICON[goal.goalType] || <Target className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />}
                    <div>
                      <p className="text-xs font-medium text-foreground capitalize">{GOAL_LABEL[goal.goalType]}</p>
                      {goal.focusArea && (
                        <p className="text-xs text-muted-foreground">{goal.focusArea}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── Weekly Progress Charts ────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-5">
          
          {/* Sleep Chart */}
          <Card className="p-5 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-muted-foreground"><BedDouble className="w-4 h-4" /></span>
              <h3 className="font-semibold text-foreground text-sm tracking-tight">Weekly Sleep</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Hours of sleep per night</p>
            <div className="flex items-end gap-1.5 h-24 mb-2">
              {sleepByDay.map((d, i) => (
                <MiniBar
                  key={i}
                  value={d.hours}
                  max={maxSleep}
                  color={d.hours >= weekStats.sleepTarget ? "bg-indigo-400" : d.hours >= weekStats.sleepTarget - 1 ? "bg-indigo-300" : "bg-secondary/40"}
                  label={d.day}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-6 border-t-2 border-dashed border-indigo-400" />
              <span className="text-xs text-muted-foreground">Target: {weekStats.sleepTarget}h</span>
              <span className="ml-auto text-xs font-semibold text-foreground">
                Avg: {weekStats.avgSleepHours}h
              </span>
            </div>
          </Card>

          {/* Exercise Chart */}
          <Card className="p-5 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-muted-foreground"><Dumbbell className="w-4 h-4" /></span>
              <h3 className="font-semibold text-foreground text-sm tracking-tight">Weekly Exercise</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Completion rate per day</p>
            <div className="flex items-end gap-1.5 h-24 mb-2">
              {exerciseByDay.map((d, i) => (
                <MiniBar
                  key={i}
                  value={d.completionRate}
                  max={maxExercise}
                  color="bg-green-400"
                  label={d.day}
                  sublabel={`${d.completed}/${d.total}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-6 border-t-2 border-dashed border-green-400" />
              <span className="text-xs text-muted-foreground">Completion Rate</span>
              <span className="ml-auto text-xs font-semibold text-foreground">
                {weekStats.workoutCompletionRate.toFixed(0)}% avg
              </span>
            </div>
          </Card>

          {/* Medication Chart */}
          <Card className="p-5 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-muted-foreground"><Shield className="w-4 h-4" /></span>
              <h3 className="font-semibold text-foreground text-sm tracking-tight">Weekly Medication</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Adherence rate per day</p>
            <div className="flex items-end gap-1.5 h-24 mb-2">
              {medicationByDay.map((d, i) => (
                <MiniBar
                  key={i}
                  value={d.adherenceRate}
                  max={maxMedication}
                  color="bg-pink-400"
                  label={d.day}
                  sublabel={`${d.taken}/${d.total}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-6 border-t-2 border-dashed border-pink-400" />
              <span className="text-xs text-muted-foreground">Adherence Rate</span>
              <span className="ml-auto text-xs font-semibold text-foreground">
                {weekStats.medCompletionRate.toFixed(0)}% avg
              </span>
            </div>
          </Card>
        </div>

        {/* ── Progress Summary ─────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Weekly Progress Summary */}
          <Card className="p-5 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-muted-foreground"><Calendar className="w-4 h-4" /></span>
              <h3 className="font-semibold text-foreground text-sm tracking-tight">Weekly Progress</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Utensils className="w-3.5 h-3.5" />
                    Meals
                  </div>
                  <span className="text-xs font-semibold text-foreground">{weekStats.mealsCompleted}/{weekStats.mealsPlanned}</span>
                </div>
                <ProgressBar value={weekStats.mealCompletionRate} color="bg-amber-400" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Dumbbell className="w-3.5 h-3.5" />
                    Workouts
                  </div>
                  <span className="text-xs font-semibold text-foreground">{weekStats.workoutsCompleted}/{weekStats.workoutsPlanned}</span>
                </div>
                <ProgressBar value={weekStats.workoutCompletionRate} color="bg-green-500" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Pill className="w-3.5 h-3.5" />
                    Medications
                  </div>
                  <span className="text-xs font-semibold text-foreground">{weekStats.medsTaken}/{weekStats.medsPlanned}</span>
                </div>
                <ProgressBar value={weekStats.medCompletionRate} color="bg-pink-500" />
              </div>
            </div>
          </Card>

          {/* AI Insights */}
          <Card className="p-5 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-muted-foreground"><Brain className="w-4 h-4" /></span>
              <h3 className="font-semibold text-foreground text-sm tracking-tight">AI Health Insights</h3>
            </div>
            {aiRecommendations.length === 0 ? (
              <div className="text-center py-6">
                <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground italic">No AI recommendations yet.</p>
                <p className="text-xs text-muted-foreground/60">Keep logging your data regularly!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {aiRecommendations.map((rec, i) => (
                  <div key={i} className="p-3.5 bg-primary/5 rounded-xl border border-primary/10 hover:bg-primary/10 transition-colors">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {rec.recommendationType}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{rec.recommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ─── Quick Health Tips ───────────────────────────────────────────── */}
        <Card className="p-5 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-muted-foreground"><Sun className="w-4 h-4" /></span>
            <h3 className="font-semibold text-foreground text-sm tracking-tight">Quick Health Tips</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <span className="text-lg">💧</span>
                <span className="text-sm text-muted-foreground">Stay hydrated — drink water throughout the day</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-lg">🥗</span>
                <span className="text-sm text-muted-foreground">Balance your meals with protein, fiber, and healthy fats</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-lg">📊</span>
                <span className="text-sm text-muted-foreground">Log your daily activities to track progress accurately</span>
              </li>
            </ul>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <span className="text-lg">😴</span>
                <span className="text-sm text-muted-foreground">Prioritize sleep — it's essential for recovery and health</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-lg">🏃</span>
                <span className="text-sm text-muted-foreground">Consistency beats intensity — small steps every day matter</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-lg">🧘</span>
                <span className="text-sm text-muted-foreground">Take breaks and manage stress for better health outcomes</span>
              </li>
            </ul>
          </div>

          {/* Motivational message */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              {weekStats.adherenceScore >= 80 ? (
                <>
                  <Award className="w-4 h-4 text-green-400" />
                  <p className="text-xs text-muted-foreground">Amazing consistency! Your dedication is paying off! 🎯</p>
                </>
              ) : weekStats.adherenceScore >= 60 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <p className="text-xs text-muted-foreground">Good progress! Small improvements lead to big results 💪</p>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <p className="text-xs text-muted-foreground">Every day is a new opportunity. Start with one healthy choice today 🌱</p>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            {weekStats.adherenceScore >= 80 
              ? "🌟 Outstanding week! You're building sustainable healthy habits."
              : weekStats.adherenceScore >= 60
              ? "📈 On the right track! Keep pushing forward with your health goals."
              : "💫 Start fresh today. Small, consistent actions lead to lasting change."}
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── Helper Components ────────────────────────────────────────────────────────
function ProgressBar({ value, color = "bg-primary", height = "h-1.5" }: {
  value: number; color?: string; height?: string
}) {
  return (
    <div className={`w-full bg-secondary/40 rounded-full ${height} overflow-hidden`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  )
}

function StatPill({ label, value, cls }: { label: string; value: string; cls: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>{value}</span>
    </div>
  )
}