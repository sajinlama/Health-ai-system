"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pill, Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function MedicationPage() {
  const [isEditing, setIsEditing] = useState(false)

  const [form, setForm] = useState({
    medicationName: "",
    dosage: "",
    timesPerDay: "",
    disease: "",
  })

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
    <section className="min-h-screen p-6 bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/20 blur-3xl rounded-full" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-accent/20 blur-3xl rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10"></div>
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground">
            Medication Management 💊
          </h1>
          <p className="text-muted-foreground">
            Add, update and track your medications for chronic disease management
          </p>
        </div>

        {/* CURRENT MEDICATIONS SUMMARY */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          
          {/* Total Medications */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Pill className="text-primary" />
              <h3 className="font-semibold">Total Medications</h3>
            </div>
            <p className="text-3xl font-bold">3 💊</p>
            <p className="text-sm text-muted-foreground">
              Active medications
            </p>
          </Card>

          {/* Adherence */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-primary" />
              <h3 className="font-semibold">Adherence Rate</h3>
            </div>
            <p className="text-3xl font-bold text-green-500">100% ✅</p>
            <p className="text-sm text-muted-foreground">
              Today's medications taken
            </p>
          </Card>

          {/* Next Dose */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="text-primary" />
              <h3 className="font-semibold">Next Dose</h3>
            </div>
            <p className="text-3xl font-bold">2:00 PM ⏰</p>
            <p className="text-sm text-muted-foreground">
              Amlodipine 5mg
            </p>
          </Card>
        </div>

        {/* MAIN GRID */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">

          {/* LEFT: MEDICATION LIST - HYPERTENSION */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="text-red-500" />
              <h2 className="text-lg font-semibold">🫀 Hypertension Meds</h2>
            </div>

            {/* LIST */}
            <div className="space-y-3">

              <div className="p-4 rounded-lg bg-background/60 border border-border/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-foreground">Lisinopril</p>
                    <p className="text-sm text-muted-foreground">10mg • 2x/day</p>
                    <p className="text-xs text-muted-foreground mt-1">Morning & Evening</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-background/60 border border-border/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-foreground">Amlodipine</p>
                    <p className="text-sm text-muted-foreground">5mg • 1x/day</p>
                    <p className="text-xs text-muted-foreground mt-1">Afternoon</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-background/60 border border-border/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-foreground">Aspirin</p>
                    <p className="text-sm text-muted-foreground">81mg • 1x/day</p>
                    <p className="text-xs text-muted-foreground mt-1">Evening</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                </div>
              </div>

            </div>

            <Button variant="outline" className="w-full mt-4 gap-2">
              <Edit className="w-4 h-4" /> Edit Medications
            </Button>
          </Card>

          {/* MIDDLE: MEDICATION SCHEDULE */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-primary" />
              <h2 className="text-lg font-semibold">📅 Today's Schedule</h2>
            </div>

            <div className="space-y-3">
              
              {/* Morning */}
              <div className="p-3 rounded-lg bg-background/60 border border-green-500/30">
                <p className="text-sm font-medium text-foreground mb-2">🌅 Morning (8:00 AM)</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Lisinopril 10mg
                  </li>
                </ul>
              </div>

              {/* Afternoon */}
              <div className="p-3 rounded-lg bg-background/60 border border-yellow-500/30">
                <p className="text-sm font-medium text-foreground mb-2">☀️ Afternoon (2:00 PM)</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-yellow-500" />
                    Amlodipine 5mg
                  </li>
                </ul>
              </div>

              {/* Evening */}
              <div className="p-3 rounded-lg bg-background/60 border border-blue-500/30">
                <p className="text-sm font-medium text-foreground mb-2">🌙 Evening (8:00 PM)</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-blue-500" />
                    Lisinopril 10mg
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-blue-500" />
                    Aspirin 81mg
                  </li>
                </ul>
              </div>

            </div>
          </Card>

          {/* RIGHT: ADD/EDIT FORM */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">

            <div className="flex items-center gap-2 mb-6">
              {isEditing ? <Edit className="text-primary" /> : <Plus className="text-primary" />}
              <h2 className="text-lg font-semibold">
                {isEditing ? "Update Medication ✏️" : "Add New Medication ➕"}
              </h2>
            </div>

            <div className="space-y-4">

              {/* Medication Name */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Medication Name</label>
                <input
                  name="medicationName"
                  placeholder="e.g., Lisinopril"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Dosage */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Dosage</label>
                <input
                  name="dosage"
                  placeholder="e.g., 10mg"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Times Per Day */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Times Per Day</label>
                <input
                  name="timesPerDay"
                  type="number"
                  placeholder="e.g., 2"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Disease */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Related Condition</label>
                <select
                  name="disease"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Condition</option>
                  <option value="HYPERTENSION">Hypertension 🫀</option>
                  <option value="DIABETES">Diabetes 🩺</option>
                  <option value="HEART_DISEASE">Heart Disease ❤️</option>
                  <option value="ASTHMA">Asthma 🫁</option>
                  <option value="KIDNEY_DISEASE">Kidney Disease 🫘</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Instructions */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Instructions (Optional)</label>
                <textarea
                  name="instructions"
                  placeholder="e.g., Take with food, avoid dairy..."
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-gradient-to-r from-primary to-accent">
                  {isEditing ? "Update Medication ✏️" : "Add Medication ➕"}
                </Button>
                {isEditing && (
                  <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* MEDICATION HISTORY / ADHERENCE */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* WEEKLY ADHERENCE */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="text-primary" />
              <h2 className="text-lg font-semibold">📊 Weekly Adherence</h2>
            </div>

            <div className="space-y-2">
              {[
                { day: "Monday", adherence: "100%", status: "✅" },
                { day: "Tuesday", adherence: "100%", status: "✅" },
                { day: "Wednesday", adherence: "100%", status: "✅" },
                { day: "Thursday", adherence: "80%", status: "⚠️" },
                { day: "Friday", adherence: "100%", status: "✅" },
                { day: "Saturday", adherence: "100%", status: "✅" },
                { day: "Sunday", adherence: "100%", status: "✅" }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-background/40">
                  <span className="text-sm text-muted-foreground">{item.day}</span>
                  <span className="text-sm font-semibold">{item.adherence} {item.status}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">Average: <span className="font-semibold text-green-500">98.6%</span></p>
            </div>
          </Card>

          {/* MEDICATION REMINDERS */}
          <Card className="p-6 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-primary" />
              <h2 className="text-lg font-semibold">⏰ Medication Reminders</h2>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-background/60 border border-green-500/30">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Morning Reminder</p>
                    <p className="text-xs text-muted-foreground">8:00 AM - Lisinopril 10mg</p>
                    <p className="text-xs text-green-600 mt-1">✓ Enabled</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-background/60 border border-yellow-500/30">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Afternoon Reminder</p>
                    <p className="text-xs text-muted-foreground">2:00 PM - Amlodipine 5mg</p>
                    <p className="text-xs text-yellow-600 mt-1">⏰ In 2 hours</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-background/60 border border-blue-500/30">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Evening Reminder</p>
                    <p className="text-xs text-muted-foreground">8:00 PM - Lisinopril + Aspirin</p>
                    <p className="text-xs text-blue-600 mt-1">⏰ In 8 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </section>
  )
}