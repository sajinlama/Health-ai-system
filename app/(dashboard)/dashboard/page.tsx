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
  CheckCircle
} from "lucide-react"

export default function DashboardPage() {
  return (
    <section className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground">
            Good Morning, Ghost 👋
          </h1>
          <p className="text-muted-foreground">
            Your chronic care & wellness overview
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

          {/* Weight */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-primary" />
              <h3 className="font-semibold">Weight</h3>
            </div>
            <p className="text-3xl font-bold">72 kg ✅</p>
            <p className="text-sm text-muted-foreground">
              Stable this week
            </p>
          </Card>

          {/* Sleep */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Moon className="text-primary" />
              <h3 className="font-semibold">Sleep Quality</h3>
            </div>
            <p className="text-3xl font-bold">7h 10m ⏰</p>
            <p className="text-sm text-muted-foreground">
              Slightly below target (7.5h)
            </p>
          </Card>

          {/* Blood Pressure (New) */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="text-primary" />
              <h3 className="font-semibold">BP Status</h3>
            </div>
            <p className="text-3xl font-bold">120/80 📊</p>
            <p className="text-sm text-muted-foreground">
              Within target range
            </p>
          </Card>

          {/* Goal */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Target className="text-primary" />
              <h3 className="font-semibold">Primary Goal</h3>
            </div>
            <p className="text-xl font-bold">🎯 Wellness</p>
            <p className="text-sm text-muted-foreground">
              Maintaining healthy habits
            </p>
          </Card>
        </div>

        {/* MAIN GRID - HEALTH MANAGEMENT */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">

          {/* MEDICATION STATUS */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <Pill className="text-primary" />
              <h3 className="text-lg font-semibold">💊 Medication</h3>
            </div>

            <p className="text-3xl font-bold text-green-500 mb-2">80%</p>
            <p className="text-sm text-muted-foreground mb-4">
              Adherence this week
            </p>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">Active Medications:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Lisinopril 10mg - 2x daily</li>
                <li>• Amlodipine 5mg - 1x daily</li>
              </ul>
            </div>
          </Card>

          {/* CONDITION DETAILS */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="text-primary" />
              <h3 className="text-lg font-semibold">❤️ Condition</h3>
            </div>

            <div className="space-y-3">
              <div>
                <p className="font-semibold text-foreground">Hypertension</p>
                <p className="text-xs text-muted-foreground">
                  Diagnosed: Jan 2023
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500 w-4 h-4" />
                <p className="text-sm text-muted-foreground">
                  Under active monitoring
                </p>
              </div>
            </div>
          </Card>

          {/* HEALTH TRACKING */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-primary" />
              <h3 className="text-lg font-semibold">📈 Progress</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">This Week</span>
                <span className="font-semibold text-green-500">↑ Strong</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Consistency</span>
                <span className="font-semibold text-blue-500">88%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Wellness Score</span>
                <span className="font-semibold text-green-500">7.5/10</span>
              </div>
            </div>
          </Card>
        </div>

        {/* SECONDARY GRID - LIFESTYLE & AI INSIGHTS */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">

          {/* LIFESTYLE MANAGEMENT */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="text-primary" />
              <h3 className="text-lg font-semibold">🏃 Lifestyle</h3>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Daily Exercise</p>
                <p className="text-xs text-muted-foreground">30 min walking - Moderate intensity</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Nutrition</p>
                <p className="text-xs text-muted-foreground">Low sodium diet - 2000 cal target</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Sleep Goal</p>
                <p className="text-xs text-muted-foreground">7:30 PM bedtime - 7-8 hours target</p>
              </div>
            </div>
          </Card>

          {/* AI INSIGHT */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="text-primary" />
              <h3 className="text-lg font-semibold">🧠 AI Insight</h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              You're managing your hypertension well 👍 Your medication adherence is strong and blood pressure is stable. Focus on improving sleep consistency and maintaining low sodium intake to optimize wellness.
            </p>
            <div className="bg-primary/10 p-3 rounded-lg">
              <p className="text-xs font-medium text-foreground">💡 Priority: Sleep schedule</p>
              <p className="text-xs text-muted-foreground mt-1">Consistent sleep improves BP regulation</p>
            </div>
          </Card>
        </div>

        {/* BOTTOM INSIGHTS */}
        <div className="space-y-6">
          
          {/* WEEKLY SUMMARY */}
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <h3 className="font-semibold mb-3">📋 Weekly Summary</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✅ <span className="font-medium">Medication Adherence:</span> 80% - Keep up the consistency</p>
              <p>✅ <span className="font-medium">Blood Pressure:</span> Well-controlled at 120/80 mmHg</p>
              <p>⚠️ <span className="font-medium">Sleep Quality:</span> 7h 10m (target: 7h 30m) - Aim for earlier bedtime</p>
              <p>✅ <span className="font-medium">Overall Wellness:</span> Stable condition management</p>
            </div>
          </Card>

          {/* RECOMMENDED ACTIONS */}
          <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <h3 className="font-semibold mb-3">🎯 Recommended Actions</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="font-semibold text-blue-500">1.</span>
                <span className="text-muted-foreground">Improve sleep timing - aim for 7:30 PM bedtime consistently</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-blue-500">2.</span>
                <span className="text-muted-foreground">Continue low sodium diet to support hypertension management</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-blue-500">3.</span>
                <span className="text-muted-foreground">Maintain daily 30-minute walk routine for cardiovascular health</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-blue-500">4.</span>
                <span className="text-muted-foreground">Schedule BP check at doctor's next appointment (routine monitoring)</span>
              </li>
            </ul>
          </Card>

        </div>

      </div>
    </section>
  )
}