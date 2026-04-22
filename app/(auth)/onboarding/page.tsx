"use client"

import { useEffect, useState } from "react"
import { Heart, Activity, Brain, Clock, Feather } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import BackgroundEffect from "@/components/backgroundEffect"
import { type HealthFormData, type OnboardingPayload, EMPTY_FORM } from "@/types/onboarding.types"
import HeaderOnboarding from "@/components/Header-onboarding"

// ── API function ─────────────────────────────────────────────────────────────
async function submitOnboarding(payload: OnboardingPayload): Promise<void> {
  const res = await fetch("/api/unboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  await fetch("/api/generate", {
  method: "GET",
})

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.")
  }
}

export default function OnboardingForm() {
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState("")
  const [form, setForm] = useState<HealthFormData>(EMPTY_FORM)

  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.user?.name) {
      setFullName(session.user.name)
    }
  }, [session])

  const { mutate, isPending, error } = useMutation({
    mutationFn: submitOnboarding,
    onSuccess: () => {
      router.push("/dashboard")
    },
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    if (name === "allergies") {
      setForm({ ...form, allergies: value.split(",").map((item) => item.trim()) })
    } else if (
      name === "height" ||
      name === "weight" ||
      name === "targetWeight" ||
      name === "muscleMassPercentage"
    ) {
      setForm({ ...form, [name]: value === "" ? "" : Number(value) })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = () => {
    mutate({
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      height: Number(form.height),
      weight: Number(form.weight),
      activityLevel: form.activityLevel,
      hasChronicDisease: form.hasChronicDisease,
      diseaseType: form.diseaseType || null,
      diseaseName: form.diseaseName || null,
      diagnosedDate: form.diagnosedDate || null,
      allergies: form.allergies,
      notes: form.notes || null,
      goalType: form.goalType,
      targetWeight: form.targetWeight !== "" ? Number(form.targetWeight) : null,
      targetDate: form.targetDate || null,
      muscleMassPercentage:
        form.muscleMassPercentage !== "" ? Number(form.muscleMassPercentage) : null,
      focusArea: form.focusArea || null,
    })
  }

  const errorMessage = error instanceof Error ? error.message : null

  return (
    <section className="min-h-screen py-24 px-6 relative bg-gradient-to-br from-background via-background to-secondary/20">
      <BackgroundEffect />

      <div className="max-w-4xl mx-auto relative z-10">
        <HeaderOnboarding />

        {/* Progress indicators */}
        <div className="flex gap-3 justify-center mb-12">
          {[1, 2, 3, 4].map((i) => (
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

        {/* Main card */}
        <div className="bg-background/70 backdrop-blur-xl border border-border rounded-3xl p-10 shadow-xl">

          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Heart className="text-primary" />
                <div>
                  <h2 className="text-2xl font-semibold">Personal Info</h2>
                  <p className="text-sm text-muted-foreground">Basic identity details</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border opacity-70 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">From Google Sign-In</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Body Stats */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Activity className="text-primary" />
                <div>
                  <h2 className="text-2xl font-semibold">Body Stats</h2>
                  <p className="text-sm text-muted-foreground">Physical measurements</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={form.height}
                    onChange={handleChange}
                    placeholder="e.g. 170"
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    placeholder="e.g. 65"
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Activity Level</label>
                  <select
                    name="activityLevel"
                    value={form.activityLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                  >
                    <option value="">Select Activity</option>
                    <option value="SEDENTARY">Sedentary</option>
                    <option value="LIGHTLY_ACTIVE">Lightly Active</option>
                    <option value="MODERATELY_ACTIVE">Moderately Active</option>
                    <option value="VERY_ACTIVE">Very Active</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Health Info */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Feather className="text-primary" />
                <div>
                  <h2 className="text-2xl font-semibold">Health Information</h2>
                  <p className="text-sm text-muted-foreground">Conditions and allergies</p>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="hasChronicDisease"
                    checked={form.hasChronicDisease}
                    onChange={(e) =>
                      setForm({ ...form, hasChronicDisease: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium">I have a chronic disease</span>
                </label>
              </div>

              {form.hasChronicDisease && (
                <div className="space-y-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Disease Type</label>
                      <select
                        name="diseaseType"
                        value={form.diseaseType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                      >
                        <option value="">Select Disease Type</option>
                        <option value="CANCER">Cancer</option>
                        <option value="DIABETES">Diabetes</option>
                        <option value="HYPERTENSION">Hypertension</option>
                        <option value="HEART_DISEASE">Heart Disease</option>
                        <option value="ASTHMA">Asthma</option>
                        <option value="KIDNEY_DISEASE">Kidney Disease</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Disease Name</label>
                      <input
                        type="text"
                        name="diseaseName"
                        value={form.diseaseName}
                        onChange={handleChange}
                        placeholder="e.g., Type 2 Diabetes"
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Diagnosed Date</label>
                    <input
                      type="date"
                      name="diagnosedDate"
                      value={form.diagnosedDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Allergies (comma separated)</label>
                <input
                  type="text"
                  name="allergies"
                  value={form.allergies.join(", ")}
                  onChange={handleChange}
                  placeholder="e.g., Peanuts, Dust, Dairy"
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Health Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any additional health information..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Health Goals */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Clock className="text-primary" />
                <div>
                  <h2 className="text-2xl font-semibold">Health Goals</h2>
                  <p className="text-sm text-muted-foreground">Define your objectives</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Primary Goal</label>
                <select
                  name="goalType"
                  value={form.goalType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                >
                  <option value="">Select Goal</option>
                  <option value="WEIGHT_LOSS">Weight Loss</option>
                  <option value="WEIGHT_GAIN">Weight Gain</option>
                  <option value="MUSCLE_GAIN">Muscle Gain</option>
                  <option value="GENERAL_WELLNESS">General Wellness</option>
                </select>
              </div>

              {/* WEIGHT_LOSS */}
              {form.goalType === "WEIGHT_LOSS" && (
                <div className="space-y-4 p-6 bg-primary/10 rounded-2xl border border-primary/20">
                  <h3 className="font-semibold text-primary">Weight Loss Target</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Target Weight (kg)</label>
                      <input
                        type="number"
                        name="targetWeight"
                        value={form.targetWeight}
                        onChange={handleChange}
                        placeholder="e.g. 60"
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                      />
                      {form.weight !== "" && form.targetWeight !== "" && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {Number(form.weight) - Number(form.targetWeight)} kg to lose
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Target Date</label>
                      <input
                        type="date"
                        name="targetDate"
                        value={form.targetDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-primary/20 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Brain className="w-4 h-4" />
                    <p>AI will create a personalized weight loss plan</p>
                  </div>
                </div>
              )}

              {/* WEIGHT_GAIN */}
              {form.goalType === "WEIGHT_GAIN" && (
                <div className="space-y-4 p-6 bg-green-500/10 rounded-2xl border border-green-500/20">
                  <h3 className="font-semibold text-green-600">Weight Gain Target</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Target Weight (kg)</label>
                      <input
                        type="number"
                        name="targetWeight"
                        value={form.targetWeight}
                        onChange={handleChange}
                        placeholder="e.g. 75"
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                      />
                      {form.weight !== "" && form.targetWeight !== "" && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {Number(form.targetWeight) - Number(form.weight)} kg to gain
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Target Date</label>
                      <input
                        type="date"
                        name="targetDate"
                        value={form.targetDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-green-500/20 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Brain className="w-4 h-4" />
                    <p>AI will create a personalized weight gain plan with nutrition guidance</p>
                  </div>
                </div>
              )}

              {/* MUSCLE_GAIN */}
              {form.goalType === "MUSCLE_GAIN" && (
                <div className="space-y-4 p-6 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                  <h3 className="font-semibold text-orange-600">Muscle Gain Target</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Target Weight (kg)</label>
                      <input
                        type="number"
                        name="targetWeight"
                        value={form.targetWeight}
                        onChange={handleChange}
                        placeholder="e.g. 75"
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                      />
                      {form.weight !== "" && form.targetWeight !== "" && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {Number(form.targetWeight) - Number(form.weight) > 0
                            ? `${Number(form.targetWeight) - Number(form.weight)} kg to gain`
                            : `${Number(form.weight) - Number(form.targetWeight)} kg to lose (fat)`}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Target Date</label>
                      <input
                        type="date"
                        name="targetDate"
                        value={form.targetDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-orange-500/20 space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Target Muscle Mass Percentage (%)
                      </label>
                      <input
                        type="number"
                        name="muscleMassPercentage"
                        value={form.muscleMassPercentage}
                        onChange={handleChange}
                        placeholder="e.g. 35"
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Brain className="w-4 h-4" />
                      <p>AI will create a personalized workout and nutrition plan</p>
                    </div>
                  </div>
                </div>
              )}

              {/* GENERAL_WELLNESS */}
              {form.goalType === "GENERAL_WELLNESS" && (
                <div className="p-6 rounded-2xl bg-accent/10 border border-accent/20">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-accent">General Wellness Focus</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">Primary Focus Area</label>
                        <select
                          name="focusArea"
                          value={form.focusArea}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-accent transition"
                        >
                          <option value="">Select Focus</option>
                          <option value="ENERGY">Increased Energy</option>
                          <option value="FLEXIBILITY">Flexibility & Mobility</option>
                          <option value="STRENGTH">Strength & Endurance</option>
                          <option value="MENTAL">Mental Health</option>
                          <option value="SLEEP">Better Sleep</option>
                          <option value="OVERALL">Overall Balance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Target Date for Results</label>
                        <input
                          type="date"
                          name="targetDate"
                          value={form.targetDate}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-accent transition"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-accent/20 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Brain className="w-4 h-4" />
                      <p>AI will generate your holistic wellness plan</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <div className="mt-6 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {errorMessage}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10 pt-6 border-t border-border">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={isPending}
                className="px-6 py-3 rounded-xl border border-border hover:bg-secondary transition duration-200 font-medium disabled:opacity-50"
              >
                Back
              </button>
            )}

            <button
              onClick={() => {
                if (step < 4) {
                  setStep(step + 1)
                } else {
                  handleSubmit()
                }
              }}
              disabled={isPending}
              className="ml-auto px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg hover:scale-105 transition duration-200 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isPending ? "Saving..." : step === 4 ? "Complete Setup" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}