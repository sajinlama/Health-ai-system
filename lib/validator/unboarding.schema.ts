import {z} from "zod"

  const onboardingSchema = z.object({
  
    dateOfBirth: z.string().refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 13 && age <= 120;
    }, 'You must be between 13 and 120 years old'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  
    height: z.number().min(50, 'Height must be at least 50cm').max(300, 'Height must be less than 300cm'),
    weight: z.number().min(20, 'Weight must be at least 20kg').max(500, 'Weight must be less than 500kg'),
    activityLevel: z.enum(['SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE']),
  
    hasChronicDisease: z.boolean(),
    diseaseType: z.enum(['CANCER', 'DIABETES', 'HYPERTENSION', 'HEART_DISEASE', 'ASTHMA', 'KIDNEY_DISEASE', 'OTHER']).optional().nullable(),
    diseaseName: z.string().max(200).optional().nullable(),
    diagnosedDate: z.string().optional().nullable(),
    allergies: z.array(z.string()).optional().default([]),
    notes: z.string().max(1000).optional().nullable(),
  
    goalType: z.enum(['WEIGHT_LOSS', 'WEIGHT_GAIN', 'MUSCLE_GAIN', 'GENERAL_WELLNESS']),
    targetWeight: z.number().min(20).max(500).optional().nullable(),
    targetDate: z.string().optional().nullable(),
  });

export default onboardingSchema;

