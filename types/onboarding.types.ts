export type Gender = "MALE" | "FEMALE" | "OTHER"

export type ActivityLevel =
  | "SEDENTARY"
  | "LIGHTLY_ACTIVE"
  | "MODERATELY_ACTIVE"
  | "VERY_ACTIVE"

export type DiseaseType =
  | "CANCER"
  | "DIABETES"
  | "HYPERTENSION"
  | "HEART_DISEASE"
  | "ASTHMA"
  | "KIDNEY_DISEASE"
  | "OTHER"

export type GoalType =
  | "WEIGHT_LOSS"
  | "WEIGHT_GAIN"
  | "MUSCLE_GAIN"
  | "GENERAL_WELLNESS"

export type FocusArea =
  | "ENERGY"
  | "FLEXIBILITY"
  | "STRENGTH"
  | "MENTAL"
  | "SLEEP"
  | "OVERALL"

export interface HealthFormData {
  // Step 1 - Personal Info
  dateOfBirth: string
  gender: Gender | ""

  // Step 2 - Body Stats
  height: number | ""
  weight: number | ""
  activityLevel: ActivityLevel | ""

  // Step 3 - Health Info
  hasChronicDisease: boolean
  diseaseType: DiseaseType | ""
  diseaseName: string
  diagnosedDate: string
  allergies: string[]
  notes: string

  // Step 4 - Goals
  goalType: GoalType | ""
  targetWeight: number | ""
  targetDate: string
  muscleMassPercentage: number | ""
  focusArea: FocusArea | ""
}

export const EMPTY_FORM: HealthFormData = {
  dateOfBirth: "",
  gender: "",
  height: "",
  weight: "",
  activityLevel: "",
  hasChronicDisease: false,
  diseaseType: "",
  diseaseName: "",
  diagnosedDate: "",
  allergies: [],
  notes: "",
  goalType: "",
  targetWeight: "",
  targetDate: "",
  muscleMassPercentage: "",
  focusArea: "",
}