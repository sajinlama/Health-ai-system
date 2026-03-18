"use client"

import { useState } from "react"
import { Heart, Activity, Brain, Clock, Feather } from "lucide-react"

export default function OnboardingForm() {
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    height: "",
    weight: "",
    activityLevel: "",
    allergies: "",
    notes: "",
    goalType: ""
  })

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
    <section className="min-h-screen py-24 px-6 relative bg-gradient-to-br from-background via-background to-secondary/20">

    
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/20 blur-3xl rounded-full" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-accent/20 blur-3xl rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">

        
        <div className="text-center mb-16">
          <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg mb-4">
            <Brain className="text-white w-7 h-7" />
          </div>

          <h1 className="text-4xl font-bold mb-3">
            Build Your Health Profile
          </h1>

          <p className="text-muted-foreground">
            Personalized AI insights start here
          </p>
        </div>

     
        <div className="flex gap-3 justify-center mb-12">
          {[1,2,3,4].map((i)=>(
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                step >= i
                  ? "w-20 bg-gradient-to-r from-primary to-accent"
                  : "w-10 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* card */}
        <div className="bg-background/70 backdrop-blur-xl border border-border rounded-3xl p-10 shadow-xl">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">

              <div className="flex items-center gap-3">
                <Heart className="text-primary" />
                <div>
                  <h2 className="text-2xl font-semibold">Personal Info</h2>
                  <p className="text-sm text-muted-foreground">Basic identity details</p>
                </div>
              </div>

              <input
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:ring-2 focus:ring-primary outline-none"
              />

              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className="px-4 py-3 rounded-xl bg-secondary border border-border"
                />

                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="px-4 py-3 rounded-xl bg-secondary border border-border"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">

              <div className="flex items-center gap-3">
                <Activity className="text-primary" />
                <h2 className="text-2xl font-semibold">Body Stats</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <input
                  type="number"
                  name="height"
                  placeholder="Height (cm)"
                  onChange={handleChange}
                  className="px-4 py-3 rounded-xl bg-secondary border border-border"
                />

                <input
                  type="number"
                  name="weight"
                  placeholder="Weight (kg)"
                  onChange={handleChange}
                  className="px-4 py-3 rounded-xl bg-secondary border border-border"
                />

                <select
                  name="activityLevel"
                  onChange={handleChange}
                  className="px-4 py-3 rounded-xl bg-secondary border border-border"
                >
                  <option value="">Activity</option>
                  <option value="SEDENTARY">Sedentary</option>
                  <option value="LIGHTLY_ACTIVE">Light</option>
                  <option value="MODERATELY_ACTIVE">Moderate</option>
                  <option value="VERY_ACTIVE">Very Active</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6">

              <div className="flex items-center gap-3">
                <Feather className="text-primary" />
                <h2 className="text-2xl font-semibold">Health</h2>
              </div>

              <input
                name="allergies"
                placeholder="Allergies (comma separated)"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border"
              />

              <textarea
                name="notes"
                placeholder="Health notes..."
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border"
              />
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-6">

              <div className="flex items-center gap-3">
                <Clock className="text-primary" />
                <h2 className="text-2xl font-semibold">Goals</h2>
              </div>

              <select
                name="goalType"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border"
              >
                <option value="">Select Goal</option>
                <option value="WEIGHT_LOSS">Weight Loss</option>
                <option value="WEIGHT_GAIN">Weight Gain</option>
                <option value="MUSCLE_GAIN">Muscle Gain</option>
                <option value="GENERAL_WELLNESS">Wellness</option>
              </select>

              <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 text-center">
                <Brain className="mx-auto mb-3 text-primary" />
                <p className="text-muted-foreground">
                  AI will generate your personalized health plan 🚀
                </p>
              </div>
            </div>
          )}

          {/* navigation */}
          <div className="flex justify-between mt-10">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-xl border border-border hover:bg-secondary transition"
              >
                Back
              </button>
            )}

            <button
              onClick={() => step < 4 ? setStep(step + 1) : console.log(form)}
              className="ml-auto px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg hover:scale-105 transition"
            >
              {step === 4 ? "Finish" : "Continue"}
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}