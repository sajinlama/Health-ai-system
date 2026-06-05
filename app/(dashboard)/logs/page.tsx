"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Utensils, Dumbbell, BedDouble, Pill, ChevronLeft, ChevronRight,
  CheckCircle, Clock, XCircle, AlertCircle, TrendingUp, Activity, Moon,
  Flame, Target, Award, Bell
} from "lucide-react"
import { Card } from "@/components/ui/card"

type TabType = "meal" | "exercise" | "sleep" | "medication"

interface MealLog {
  id: string
  status: "PENDING" | "DONE" | "SKIPPED"
  scheduledTime: string
  meal: {
    mealName: string
    description: string
    calories: number
    protein: number
    carbs: number
    fats: number
    mealTime: string
  }
}

interface ExerciseLog {
  id: string
  status: "PENDING" | "DONE" | "SKIPPED"
  scheduledTime: string
  exercisePlan: {
    exerciseName: string
    exerciseType: string
    duration: number
    instructions: string
  }
}

interface SleepLog {
  id: string
  sleptAt: string
  wakeAt: string
  completed: boolean
  durationHours: number
}

interface MedicationLog {
  id: string
  status: "PENDING" | "TAKEN" | "SKIPPED" | "MISSED"
  scheduledAt: string
  takenAt: string | null
  medication: {
    medicationName: string
    dosage: string
  }
}

const statusConfig = {
  meal: {
    DONE: { bg: "bg-green-500/10 border-green-500/30 text-green-400", icon: CheckCircle, label: "Done" },
    PENDING: { bg: "bg-amber-500/10 border-amber-500/30 text-amber-400", icon: Clock, label: "Pending" },
    SKIPPED: { bg: "bg-secondary/60 border-border/40 text-muted-foreground", icon: XCircle, label: "Skipped" },
  },
  exercise: {
    DONE: { bg: "bg-green-500/10 border-green-500/30 text-green-400", icon: CheckCircle, label: "Done" },
    PENDING: { bg: "bg-amber-500/10 border-amber-500/30 text-amber-400", icon: Clock, label: "Pending" },
    SKIPPED: { bg: "bg-secondary/60 border-border/40 text-muted-foreground", icon: XCircle, label: "Skipped" },
  },
  medication: {
    TAKEN: { bg: "bg-green-500/10 border-green-500/30 text-green-400", icon: CheckCircle, label: "Taken" },
    PENDING: { bg: "bg-amber-500/10 border-amber-500/30 text-amber-400", icon: Clock, label: "Pending" },
    SKIPPED: { bg: "bg-secondary/60 border-border/40 text-muted-foreground", icon: XCircle, label: "Skipped" },
    MISSED: { bg: "bg-red-500/10 border-red-500/30 text-red-400", icon: AlertCircle, label: "Missed" },
  },
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatWeekLabel(date: Date): string {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`
}

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("meal")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"day" | "week">("day")
  const queryClient = useQueryClient()

  const formatDate = (date: Date) => date.toISOString().split("T")[0]

  const changeDate = (days: number) => {
    setSelectedDate(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() + days)
      return d
    })
  }

  const weekStartDate = getWeekStart(selectedDate)
  const weekStartStr = formatDate(weekStartDate)

  const { data: mealData, isLoading: mealLoading } = useQuery({
    queryKey: ["logs", "meal", viewMode, viewMode === "week" ? weekStartStr : formatDate(selectedDate)],
    queryFn: async () => {
      const url = viewMode === "week"
        ? `/api/logs/meal?week=true&weekStart=${weekStartStr}`
        : `/api/logs/meal?date=${formatDate(selectedDate)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch meal logs")
      return res.json()
    },
    enabled: activeTab === "meal",
  })

  const { data: exerciseData, isLoading: exerciseLoading } = useQuery({
    queryKey: ["logs", "exercise", viewMode, viewMode === "week" ? weekStartStr : formatDate(selectedDate)],
    queryFn: async () => {
      const url = viewMode === "week"
        ? `/api/logs/exercise?week=true&weekStart=${weekStartStr}`
        : `/api/logs/exercise?date=${formatDate(selectedDate)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch exercise logs")
      return res.json()
    },
    enabled: activeTab === "exercise",
  })

  const { data: sleepData, isLoading: sleepLoading } = useQuery({
    queryKey: ["logs", "sleep", viewMode, viewMode === "week" ? weekStartStr : formatDate(selectedDate)],
    queryFn: async () => {
      const url = viewMode === "week"
        ? `/api/logs/sleep?week=true&weekStart=${weekStartStr}`
        : `/api/logs/sleep?date=${formatDate(selectedDate)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch sleep logs")
      return res.json()
    },
    enabled: activeTab === "sleep",
  })

  const { data: medicationData, isLoading: medicationLoading } = useQuery({
    queryKey: ["logs", "medication", viewMode, viewMode === "week" ? weekStartStr : formatDate(selectedDate)],
    queryFn: async () => {
      const url = viewMode === "week"
        ? `/api/logs/medication?week=true&weekStart=${weekStartStr}`
        : `/api/logs/medication?date=${formatDate(selectedDate)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch medication logs")
      return res.json()
    },
    enabled: activeTab === "medication",
  })

  const updateMealStatus = useMutation({
    mutationFn: async ({ logId, status }: { logId: string; status: string }) => {
      if (!logId) throw new Error("logId is undefined")
      console.log("[updateMealStatus] logId:", logId, "status:", status)
      const res = await fetch("/api/logs/meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId, status }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error("[updateMealStatus] error:", res.status, err)
        throw new Error(err.error || "Failed to update")
      }
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["logs", "meal"] }),
  })

  const updateExerciseStatus = useMutation({
    mutationFn: async ({ logId, status }: { logId: string; status: string }) => {
      if (!logId) throw new Error("logId is undefined")
      console.log("[updateExerciseStatus] logId:", logId, "status:", status)
      const res = await fetch("/api/logs/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId, status }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error("[updateExerciseStatus] error:", res.status, err)
        throw new Error(err.error || "Failed to update")
      }
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["logs", "exercise"] }),
  })

  const updateMedicationStatus = useMutation({
    mutationFn: async ({ logId, status }: { logId: string; status: string }) => {
      if (!logId) throw new Error("logId is undefined")
      console.log("[updateMedicationStatus] logId:", logId, "status:", status)
      const res = await fetch("/api/logs/medication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId, status }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error("[updateMedicationStatus] error:", res.status, err)
        throw new Error(err.error || "Failed to update")
      }
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["logs", "medication"] }),
  })

  const getCurrentData = () => {
    switch (activeTab) {
      case "meal":       return { data: mealData,       loading: mealLoading,       update: updateMealStatus }
      case "exercise":   return { data: exerciseData,   loading: exerciseLoading,   update: updateExerciseStatus }
      case "sleep":      return { data: sleepData,       loading: sleepLoading,      update: null }
      case "medication": return { data: medicationData, loading: medicationLoading, update: updateMedicationStatus }
    }
  }

  const { data: currentData, loading, update } = getCurrentData()

  const tabs = [
    { id: "meal" as TabType,       label: "Meals",      icon: Utensils,  color: "from-amber-500 to-orange-500" },
    { id: "exercise" as TabType,   label: "Exercise",   icon: Dumbbell,  color: "from-green-500 to-emerald-500" },
    { id: "sleep" as TabType,      label: "Sleep",      icon: BedDouble, color: "from-blue-500 to-indigo-500" },
    { id: "medication" as TabType, label: "Medication", icon: Pill,      color: "from-pink-500 to-rose-500" },
  ]

  const dateLabel = viewMode === "week"
    ? formatWeekLabel(selectedDate)
    : selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  return (
    <section className="min-h-screen py-8 px-6 bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Activity Logs</h1>
            <p className="text-muted-foreground mt-1">Track and manage your daily activities</p>
          </div>
          <div className="flex gap-2 p-1 bg-secondary/40 rounded-xl border border-border/50">
            <button
              onClick={() => setViewMode("day")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "day"
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Day View
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "week"
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Week View
            </button>
          </div>
        </div>

        {/* Date navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => changeDate(viewMode === "week" ? -7 : -1)}
            className="p-2 rounded-lg bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">{dateLabel}</p>
          </div>
          <button
            onClick={() => changeDate(viewMode === "week" ? 7 : 1)}
            className="p-2 rounded-lg bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border/50 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Summary Cards — week view only */}
        {currentData?.summary && viewMode === "week" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {activeTab === "meal" && (
              <>
                <SummaryCard icon={Utensils}    label="Meals Planned"  value={currentData.summary.total}          color="from-amber-500 to-orange-500" />
                <SummaryCard icon={CheckCircle} label="Completed"      value={currentData.summary.completed}      color="from-green-500 to-emerald-500" />
                <SummaryCard icon={Clock}       label="Pending"        value={currentData.summary.pending}        color="from-amber-500 to-orange-500" />
                <SummaryCard icon={Flame}       label="Total Calories" value={`${currentData.summary.totalCalories}`} color="from-red-500 to-rose-500" />
              </>
            )}
            {activeTab === "exercise" && (
              <>
                <SummaryCard icon={Dumbbell}    label="Workouts Planned" value={currentData.summary.total}          color="from-green-500 to-emerald-500" />
                <SummaryCard icon={CheckCircle} label="Completed"        value={currentData.summary.completed}      color="from-green-500 to-emerald-500" />
                <SummaryCard icon={Clock}       label="Pending"          value={currentData.summary.pending}        color="from-amber-500 to-orange-500" />
                <SummaryCard icon={Activity}    label="Total Duration"   value={`${currentData.summary.totalDuration} min`} color="from-blue-500 to-cyan-500" />
              </>
            )}
            {activeTab === "sleep" && (
              <>
                <SummaryCard icon={Moon}       label="Sleep Logs"  value={currentData.summary.total}              color="from-blue-500 to-indigo-500" />
                <SummaryCard icon={TrendingUp} label="Total Sleep" value={`${currentData.summary.totalHours}h`}   color="from-purple-500 to-pink-500" />
                <SummaryCard icon={Award}      label="Average"     value={`${currentData.summary.avgHours}h`}     color="from-cyan-500 to-teal-500" />
                <SummaryCard icon={Target}     label="Goal"        value="7-8h"                                   color="from-emerald-500 to-green-500" />
              </>
            )}
            {activeTab === "medication" && (
              <>
                <SummaryCard icon={Pill}        label="Total Doses" value={currentData.summary.total}   color="from-pink-500 to-rose-500" />
                <SummaryCard icon={CheckCircle} label="Taken"       value={currentData.summary.taken}   color="from-green-500 to-emerald-500" />
                <SummaryCard icon={Clock}       label="Pending"     value={currentData.summary.pending} color="from-amber-500 to-orange-500" />
                <SummaryCard icon={AlertCircle} label="Missed"      value={currentData.summary.missed}  color="from-red-500 to-rose-500" />
              </>
            )}
          </div>
        )}

        {/* Logs List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-secondary/40 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {!currentData?.logs?.length ? (
              <Card className="p-12 text-center bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No logs found for this period</p>
              </Card>
            ) : (
              currentData.logs.map((log: any) => {
                if (activeTab === "meal") {
                  const cfg = statusConfig.meal[log.status as keyof typeof statusConfig.meal]
                  const StatusIcon = cfg.icon
                  return (
                    <Card key={log.id} className="p-4 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50 hover:border-primary/30 transition-all">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-2 rounded-lg border ${cfg.bg}`}>
                            <Utensils className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{log.meal.mealName}</h3>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              {viewMode === "week" && (
                                <span className="ml-2">
                                  · {new Date(log.scheduledTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">{log.meal.calories} cal</p>
                            <p className="text-xs text-muted-foreground">
                              P: {log.meal.protein}g · C: {log.meal.carbs}g · F: {log.meal.fats}g
                            </p>
                          </div>
                          {log.status === "PENDING" && (
                            <button
                              onClick={() => {
                                console.log("[Mark Done] log.id:", log.id)
                                update?.mutate({ logId: log.id, status: "DONE" })
                              }}
                              disabled={update?.isPending}
                              className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
                            >
                              Mark Done
                            </button>
                          )}
                          <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg}`}>
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    </Card>
                  )
                }

                if (activeTab === "exercise") {
                  const cfg = statusConfig.exercise[log.status as keyof typeof statusConfig.exercise]
                  const StatusIcon = cfg.icon
                  return (
                    <Card key={log.id} className="p-4 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50 hover:border-primary/30 transition-all">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-2 rounded-lg border ${cfg.bg}`}>
                            <Dumbbell className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{log.exercisePlan.exerciseName}</h3>
                            <p className="text-xs text-muted-foreground">
                              {log.exercisePlan.exerciseType} · {log.exercisePlan.duration} min
                              {viewMode === "week" && (
                                <span className="ml-2">
                                  · {new Date(log.scheduledTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-muted-foreground">
                            {new Date(log.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          {log.status === "PENDING" && (
                            <button
                              onClick={() => {
                                console.log("[Mark Done] log.id:", log.id)
                                update?.mutate({ logId: log.id, status: "DONE" })
                              }}
                              disabled={update?.isPending}
                              className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
                            >
                              Mark Done
                            </button>
                          )}
                          <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg}`}>
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    </Card>
                  )
                }

                if (activeTab === "sleep") {
                  return (
                    <Card key={log.id} className="p-4 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50 hover:border-primary/30 transition-all">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                            <BedDouble className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">Sleep Session</h3>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.sleptAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} → {new Date(log.wakeAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              {viewMode === "week" && (
                                <span className="ml-2">
                                  · {new Date(log.sleptAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-semibold text-foreground">{log.durationHours.toFixed(1)}h</p>
                            <p className="text-xs text-muted-foreground">Duration</p>
                          </div>
                          <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                            log.completed
                              ? "bg-green-500/10 border-green-500/30 text-green-400"
                              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          }`}>
                            <CheckCircle className="w-3 h-3" />
                            {log.completed ? "Completed" : "Partial"}
                          </span>
                        </div>
                      </div>
                    </Card>
                  )
                }

                if (activeTab === "medication") {
                  const cfg = statusConfig.medication[log.status as keyof typeof statusConfig.medication]
                  const StatusIcon = cfg.icon
                  return (
                    <Card key={log.id} className="p-4 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50 hover:border-primary/30 transition-all">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-2 rounded-lg border ${cfg.bg}`}>
                            <Pill className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{log.medication.medicationName}</h3>
                            <p className="text-xs text-muted-foreground">
                              {log.medication.dosage}
                              {viewMode === "week" && (
                                <span className="ml-2">
                                  · {new Date(log.scheduledAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {new Date(log.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                            {log.takenAt && (
                              <p className="text-xs text-green-400">
                                Taken at {new Date(log.takenAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            )}
                          </div>
                          {log.status === "PENDING" && (
                            <button
                              onClick={() => {
                                console.log("[Mark Taken] log.id:", log.id)
                                update?.mutate({ logId: log.id, status: "TAKEN" })
                              }}
                              disabled={update?.isPending}
                              className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
                            >
                              Mark Taken
                            </button>
                          )}
                          <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg}`}>
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    </Card>
                  )
                }
              })
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function SummaryCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <Card className="p-4 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  )
}