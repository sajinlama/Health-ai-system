"use client"

import { Card } from "@/components/ui/card"
import {
  Brain,
  Activity,
  Moon,
  Pill,
  Target,
  Heart,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  BarChart2
} from "lucide-react"

export default function HealthAnalysisPage() {
  return (
    <section className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground">
            Health Analysis 📊
          </h1>
          <p className="text-muted-foreground">
            Your detailed wellness & vitals overview
          </p>
        </div>

        {/* CHRONIC CONDITION ALERT */}
        <div className="mb-10">
          <Card className="p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">🫀 Active Condition: Hypertension</h3>
                <p className="text-sm text-muted-foreground">
                  Ongoing monitoring required. Keep consistent with medication and maintain healthy lifestyle habits.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* TOP SUMMARY - VITAL METRICS */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">

          {/* Blood Pressure */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="text-primary" />
              <h3 className="font-semibold">Blood Pressure</h3>
            </div>
            <p className="text-3xl font-bold">120/80 📊</p>
            <p className="text-sm text-muted-foreground">
              Within target range
            </p>
          </Card>

          {/* Heart Rate */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="text-primary" />
              <h3 className="font-semibold">Heart Rate</h3>
            </div>
            <p className="text-3xl font-bold">78 bpm ❤️</p>
            <p className="text-sm text-muted-foreground">
              Normal range
            </p>
          </Card>

          {/* Sleep Quality */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Moon className="text-primary" />
              <h3 className="font-semibold">Sleep Quality</h3>
            </div>
            <p className="text-3xl font-bold">6h 45m 🌙</p>
            <p className="text-sm text-muted-foreground">
              Below 7.5h target
            </p>
          </Card>

          {/* Daily Steps */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-primary" />
              <h3 className="font-semibold">Daily Steps</h3>
            </div>
            <p className="text-3xl font-bold">7,452 🚶</p>
            <p className="text-sm text-muted-foreground">
              Good activity level
            </p>
          </Card>
        </div>

        {/* MAIN GRID - HEALTH MANAGEMENT */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">

          {/* MEDICATION STATUS */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <Pill className="text-primary" />
              <h3 className="text-lg font-semibold">💊 Medications</h3>
            </div>

            <p className="text-3xl font-bold text-green-500 mb-2">3/3 taken</p>
            <p className="text-sm text-muted-foreground mb-4">
              Adherence: 100% today
            </p>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">Active Medications:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Lisinopril 10mg - 2x daily</li>
                <li>• Amlodipine 5mg - 1x daily</li>
                <li>• Aspirin 81mg - 1x daily</li>
              </ul>
            </div>
          </Card>

          {/* WELLNESS GOALS */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-primary" />
              <h3 className="text-lg font-semibold">🎯 Wellness Goals</h3>
            </div>

            <p className="text-3xl font-bold text-blue-500 mb-2">75%</p>
            <p className="text-sm text-muted-foreground mb-4">
              Weekly progress
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><CheckCircle className="text-green-500 w-4 h-4" /> Exercise: 5/7 days</p>
              <p className="flex items-center gap-2"><CheckCircle className="text-green-500 w-4 h-4" /> Low sodium: 6/7 days</p>
              <p className="flex items-center gap-2"><AlertCircle className="text-yellow-500 w-4 h-4" /> Sleep: 5/7 days</p>
            </div>
          </Card>

          {/* HEALTH SCORE */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-primary" />
              <h3 className="text-lg font-semibold">📈 Health Score</h3>
            </div>

            <p className="text-3xl font-bold text-green-500 mb-2">7.8/10</p>
            <p className="text-sm text-muted-foreground mb-4">
              Well-managed condition
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">BP Control:</span>
                <span className="font-semibold text-green-500">Excellent</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Medication:</span>
                <span className="font-semibold text-green-500">Excellent</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lifestyle:</span>
                <span className="font-semibold text-blue-500">Good</span>
              </div>
            </div>
          </Card>
        </div>

        {/* SECONDARY GRID - CHARTS & TRACKING */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">

          {/* WEEKLY ACTIVITY CHART */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <BarChart2 className="text-primary" />
              <h3 className="text-lg font-semibold">📊 Weekly Activity</h3>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Steps per day (in thousands)</p>
              <div className="h-32 w-full bg-secondary/20 rounded flex items-end gap-2 p-3">
                {[
                  { day: "Mon", steps: 5 },
                  { day: "Tue", steps: 10 },
                  { day: "Wed", steps: 8 },
                  { day: "Thu", steps: 12 },
                  { day: "Fri", steps: 7 },
                  { day: "Sat", steps: 14 },
                  { day: "Sun", steps: 10 }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 gap-1">
                    <div
                      style={{ height: `${item.steps * 5}px` }}
                      className="bg-blue-500 w-full rounded-t"
                    ></div>
                    <p className="text-xs text-muted-foreground">{item.day}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Average: 9,481 steps/day ✅</p>
            </div>
          </Card>

          {/* WEEKLY SLEEP CHART */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <Moon className="text-primary" />
              <h3 className="text-lg font-semibold">😴 Weekly Sleep</h3>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Hours of sleep per night</p>
              <div className="h-32 w-full bg-secondary/20 rounded flex items-end gap-2 p-3">
                {[
                  { day: "Mon", hours: 7 },
                  { day: "Tue", hours: 6.5 },
                  { day: "Wed", hours: 6.75 },
                  { day: "Thu", hours: 7.5 },
                  { day: "Fri", hours: 6.8 },
                  { day: "Sat", hours: 7.2 },
                  { day: "Sun", hours: 6.9 }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 gap-1">
                    <div
                      style={{ height: `${item.hours * 12}px` }}
                      className="bg-indigo-500 w-full rounded-t"
                    ></div>
                    <p className="text-xs text-muted-foreground">{item.day}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Average: 6h 55m (Target: 7h 30m) ⚠️</p>
            </div>
          </Card>
        </div>

        {/* BOTTOM INSIGHTS */}
        <div className="space-y-6">
          
          {/* WEEKLY SUMMARY */}
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <h3 className="font-semibold mb-3">📋 Weekly Summary</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✅ <span className="font-medium">Medication Adherence:</span> 100% today (80% weekly avg)</p>
              <p>✅ <span className="font-medium">Blood Pressure:</span> Well-controlled at 120/80 mmHg</p>
              <p>⚠️ <span className="font-medium">Sleep Quality:</span> 6h 45m (target: 7h 30m) - Needs improvement</p>
              <p>✅ <span className="font-medium">Activity Level:</span> 9,481 steps/day - Excellent</p>
            </div>
          </Card>

          {/* AI INSIGHTS */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="text-primary" />
              <h3 className="text-lg font-semibold">🧠 AI Insights</h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Your hypertension management is excellent with perfect medication adherence and well-controlled blood pressure. Your activity level is strong. The main area for improvement is sleep consistency - you're getting nearly an hour less than your target. Improving this will enhance blood pressure regulation and overall wellness.
            </p>
            <div className="bg-primary/10 p-3 rounded-lg">
              <p className="text-xs font-medium text-foreground">💡 Priority: Sleep schedule</p>
              <p className="text-xs text-muted-foreground mt-1">Earlier bedtime (7:30 PM) can improve BP control by 5-10%</p>
            </div>
          </Card>

          {/* RECOMMENDED ACTIONS */}
          <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <h3 className="font-semibold mb-3">🎯 Recommended Actions</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="font-semibold text-blue-500">1.</span>
                <span className="text-muted-foreground">Establish consistent 7:30 PM bedtime routine for 7.5-8 hours sleep</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-blue-500">2.</span>
                <span className="text-muted-foreground">Continue excellent medication adherence - maintain current routine</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-blue-500">3.</span>
                <span className="text-muted-foreground">Keep daily 30+ minute walks - excellent activity level</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-blue-500">4.</span>
                <span className="text-muted-foreground">Schedule monthly BP monitoring and doctor check-in next month</span>
              </li>
            </ul>
          </Card>

        </div>

      </div>
    </section>
  )
}