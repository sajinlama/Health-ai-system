import { z } from "zod";

const medicationTimeSchema = z.object({
  medicationId: z
    .string()
    .min(1, "Medication ID is required"), 

  time: z
    .string()
    .min(1, "Time is required")
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:MM format (24h)"),
});

export default medicationTimeSchema;