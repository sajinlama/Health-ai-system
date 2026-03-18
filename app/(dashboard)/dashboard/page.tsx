"use client"

import { useState } from "react"
import { Heart, Activity, Brain, Clock, Feather } from "lucide-react"

export default function OnboardingForm() {
  const [step, setStep] = useState(1)

  return (
    <section className="min-h-screen py-24 px-6 relative">

      {/* background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">

        {/* header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent mb-4">
            <Brain className="text-background w-7 h-7" />
          </div>

          <h1 className="text-4xl font-bold mb-4">
            Complete Your Health Profile
          </h1>

          <p className="text-muted-foreground max-w-xl mx-auto">
            Help our AI understand you better so we can provide
            personalized health insights and recommendations.
          </p>
        </div>

        {/* progress bar */}
        <div className="flex gap-3 mb-12 justify-center">
          {[1,2,3,4].map((i)=>(
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                step >= i
                  ? "w-16 bg-gradient-to-r from-primary to-accent"
                  : "w-10 bg-secondary"
              }`}
            />
          ))}
        </div>

        {/* form card */}
        <div className="bg-secondary/40 backdrop-blur border border-border/50 rounded-2xl p-10">

          {/* STEP 1 */}
          {step === 1 && (
            <div>

              <div className="flex items-center gap-3 mb-6">
                <Heart className="text-primary" />
                <h2 className="text-2xl font-semibold">Personal Info</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">

                <div>
                  <label className="text-sm text-muted-foreground">
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    className="mt-2 w-full bg-secondary border border-border rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    Gender
                  </label>

                  <select className="mt-2 w-full bg-secondary border border-border rounded-lg px-4 py-3">
                    <option>Select</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>

              <div className="flex items-center gap-3 mb-6">
                <Activity className="text-primary" />
                <h2 className="text-2xl font-semibold">Physical Stats</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">

                <div>
                  <label className="text-sm text-muted-foreground">
                    Height (cm)
                  </label>

                  <input
                    type="number"
                    className="mt-2 w-full bg-secondary border border-border rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    Weight (kg)
                  </label>

                  <input
                    type="number"
                    className="mt-2 w-full bg-secondary border border-border rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    Activity Level
                  </label>

                  <select className="mt-2 w-full bg-secondary border border-border rounded-lg px-4 py-3">
                    <option>Select</option>
                    <option>Sedentary</option>
                    <option>Moderate</option>
                    <option>Very Active</option>
                  </select>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>

              <div className="flex items-center gap-3 mb-6">
                <Feather className="text-primary" />
                <h2 className="text-2xl font-semibold">Health Details</h2>
              </div>

              <div className="space-y-6">

                <div>
                  <label className="text-sm text-muted-foreground">
                    Allergies
                  </label>

                  <input
                    className="mt-2 w-full bg-secondary border border-border rounded-lg px-4 py-3"
                    placeholder="Peanuts, Dairy..."
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    Health Notes
                  </label>

                  <textarea
                    rows={4}
                    className="mt-2 w-full bg-secondary border border-border rounded-lg px-4 py-3"
                  />
                </div>

              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>

              <div className="flex items-center gap-3 mb-6">
                <Clock className="text-primary" />
                <h2 className="text-2xl font-semibold">Your Goals</h2>
              </div>

              <div className="space-y-6">

                <div>
                  <label className="text-sm text-muted-foreground">
                    Primary Goal
                  </label>

                  <select className="mt-2 w-full bg-secondary border border-border rounded-lg px-4 py-3">
                    <option>Select</option>
                    <option>Weight Loss</option>
                    <option>Muscle Gain</option>
                    <option>General Wellness</option>
                  </select>
                </div>

                <div className="p-6 rounded-xl bg-primary/10 border border-primary/20 text-center">
                  <Brain className="mx-auto mb-3 text-primary" />

                  <p className="text-muted-foreground">
                    Our AI will analyze your health profile and generate
                    personalized recommendations for nutrition,
                    exercise, and wellness.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* navigation */}
          <div className="flex justify-between mt-10">

            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-lg border border-border hover:bg-secondary"
              >
                Previous
              </button>
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="ml-auto px-8 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-background font-semibold"
              >
                Continue
              </button>
            ) : (
              <button className="ml-auto px-8 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-background font-semibold">
                Complete Profile
              </button>
            )}

          </div>

        </div>
      </div>
    </section>
  )
}