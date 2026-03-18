import { z } from "zod";

const medicationSchema = z
  .object({
    diseaseId: z.string().min(1, "Disease ID is required"), // ✅ added
    medicationName: z
      .string()
      .min(3, "Medication name must be at least 3 characters"),
    dosage: z.string().min(1, "Dosage is required"),
    timesPerDay: z.coerce
      .number()
      .int("Must be a whole number")
      .min(1, "Must take at least once per day")
      .max(10, "Too many doses per day"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    instructions: z.string().max(200, "Instructions must be under 200 characters").optional(),
  })
  .refine((data) => !data.endDate || data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export default medicationSchema;