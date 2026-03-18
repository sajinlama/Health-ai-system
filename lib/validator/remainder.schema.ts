import { z } from "zod";

const ReminderStatusEnum = z.enum(["PENDING", "COMPLETED", "MISSED"]);

const reminderSchema = z.object({
  userId: z.string(),
  medicationId: z.string(),
  reminderTime: z.coerce.date(),  
  status: ReminderStatusEnum.default("PENDING"),
});

export default reminderSchema;