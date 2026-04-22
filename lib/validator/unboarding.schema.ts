import { z } from "zod"

const onboardingSchema = z.object({

  // Step 1 - Personal Info
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 13 && age <= 120;
  }, 'You must be between 13 and 120 years old'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),

  // Step 2 - Body Stats
  height: z.number().min(50, 'Height must be at least 50cm').max(300, 'Height must be less than 300cm'),
  weight: z.number().min(20, 'Weight must be at least 20kg').max(500, 'Weight must be less than 500kg'),
  activityLevel: z.enum(['SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE']),

  // Step 3 - Health Info
  // Step 3 - Health Info
hasChronicDisease: z.boolean(),

diseaseType: z.enum([
  'CANCER',
  'DIABETES',
  'HYPERTENSION',
  'HEART_DISEASE',
  'ASTHMA',
  'KIDNEY_DISEASE',
  'OTHER'
]).optional().nullable(),

diseaseName: z.string().max(200).optional().nullable(),

diagnosedDate: z.coerce.date().optional().nullable(), // 🔥 FIXED

allergies: z.array(z.string()).optional().default([]),

notes: z.string().max(1000).optional().nullable(),
  // Step 4 - Goals
  goalType: z.enum(['WEIGHT_LOSS', 'WEIGHT_GAIN', 'MUSCLE_GAIN', 'GENERAL_WELLNESS']),
  targetWeight: z.number().min(20).max(500).optional().nullable(),     // WEIGHT_LOSS, WEIGHT_GAIN, MUSCLE_GAIN
  targetDate: z.string().optional().nullable(),                         // All goal types
  muscleMassPercentage: z.number().min(1).max(100).optional().nullable(), // MUSCLE_GAIN only
  focusArea: z.enum(['ENERGY', 'FLEXIBILITY', 'STRENGTH', 'MENTAL', 'SLEEP', 'OVERALL']).optional().nullable(), // GENERAL_WELLNESS only

}).superRefine((data, ctx) => {

  // WEIGHT_LOSS: targetWeight required and must be less than current weight
  if (data.goalType === 'WEIGHT_LOSS') {
    if (data.targetWeight == null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['targetWeight'], message: 'Target weight is required for weight loss goal' });
    } else if (data.targetWeight >= data.weight) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['targetWeight'], message: 'Target weight must be less than current weight for weight loss' });
    }
  }

  // WEIGHT_GAIN: targetWeight required and must be greater than current weight
  if (data.goalType === 'WEIGHT_GAIN') {
    if (data.targetWeight == null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['targetWeight'], message: 'Target weight is required for weight gain goal' });
    } else if (data.targetWeight <= data.weight) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['targetWeight'], message: 'Target weight must be greater than current weight for weight gain' });
    }
  }

  // MUSCLE_GAIN: targetWeight required
  if (data.goalType === 'MUSCLE_GAIN') {
    if (data.targetWeight == null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['targetWeight'], message: 'Target weight is required for muscle gain goal' });
    }
  }

  // GENERAL_WELLNESS: focusArea required
  if (data.goalType === 'GENERAL_WELLNESS') {
    if (!data.focusArea) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['focusArea'], message: 'Focus area is required for general wellness goal' });
    }
  }

  // Disease fields required when hasChronicDisease is true
  if (data.hasChronicDisease) {
    if (!data.diseaseType) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['diseaseType'], message: 'Disease type is required' });
    }
    if (!data.diseaseName || data.diseaseName.trim() === '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['diseaseName'], message: 'Disease name is required' });
    }
  }
});

export default onboardingSchema;