"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, CheckCircle2, Clock, XCircle } from "lucide-react"

type Reminder = {
  id: string
  type: "MEAL" | "EXERCISE" | "SLEEP" | "MEDICATION" | string
  reminderTime: string
  status: "PENDING" | "COMPLETED" | "SKIPPED"
}

const TYPE_META: Record<string, any> = {
  MEAL:       { icon: "🍽",  label: "Meal" },
  EXERCISE:   { icon: "🏃",  label: "Exercise" },
  SLEEP:      { icon: "🌙",  label: "Sleep" },
  MEDICATION: { icon: "💊",  label: "Medication" },
}

export default function LogsPage() {
  const queryClient = useQueryClient()

  const { data = [], isLoading } = useQuery<Reminder[]>({
    queryKey: ["reminders"],
    queryFn: async () => {
      const res = await fetch("/api/reminders/today")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/reminders/${id}/complete`, { method: "PATCH" })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
  })

  const skipMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/reminders/${id}/skip`, { method: "PATCH" })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
  })

  const completed = data.filter((r) => r.status === "COMPLETED").length
  const pending   = data.filter((r) => r.status === "PENDING").length

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <section className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground">
            Daily Logs 📊
          </h1>
          <p className="text-muted-foreground">
            Track and manage your daily health activities
          </p>
          <p className="text-sm text-muted-foreground mt-1">{today}</p>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-5 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3">
              <Activity className="text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{data.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-green-500/10 to-green-400/10 border-green-400/20">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completed}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-yellow-500/10 to-yellow-400/10 border-yellow-400/20">
            <div className="flex items-center gap-3">
              <Clock className="text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pending}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* REMINDERS LIST */}
        <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
          <h2 className="text-lg font-semibold mb-4">
            📋 Today's Activities
          </h2>

          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : data.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No reminders for today
            </p>
          ) : (
            <div className="space-y-3">
              {data.map((item) => {
                const meta = TYPE_META[item.type] ?? { icon: "🔔", label: item.type }
                const isPending = item.status === "PENDING"

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-background/60 border border-border/50 hover:shadow-sm transition"
                  >
                    {/* LEFT */}
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{meta.icon}</div>

                      <div>
                        <p className="font-semibold text-foreground">
                          {meta.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.reminderTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                        <p className="text-xs mt-1">
                          {item.status === "COMPLETED" && "✅ Completed"}
                          {item.status === "PENDING" && "⏳ Pending"}
                          {item.status === "SKIPPED" && "❌ Skipped"}
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    {isPending && (
                      <div className="flex gap-2">
                       <Button
  size="sm"
  onClick={() => completeMutation.mutate(item.id)}
  className="bg-green-600 hover:bg-green-500 text-white cursor-pointer"
>
  Done
</Button>

                        <Button
  size="sm"
  variant="outline"
  onClick={() => skipMutation.mutate(item.id)}
  className="text-red-500 border-red-300 hover:bg-red-100 cursor-pointer"
>
  Skip
</Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>

      </div>
    </section>
  )
}