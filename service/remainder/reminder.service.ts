import prisma from "@/lib/db"

// ─── Get Today's Reminders ────────────────────────────────────────────────────

export const getTodaysReminders = async (userId: string) => {
  return prisma.reminder.findMany({
    where: { userId },
    orderBy: { reminderTime: "asc" },
    select: {
      id: true,
      type: true,
      reminderTime: true,
      status: true,
      sentAt: true,
      completedAt: true,
      autoSkippedAt: true,
      taskData: true,
      mealId: true,
      exercisePlanId: true,
      sleepScheduleId: true,
    },
  })
}

// ─── Shared: Update the linked log entry ─────────────────────────────────────

/**
 * After acting on a reminder, sync the status into MealLog or ExerciseLog.
 * SleepLog is intentionally skipped — it has no LogStatus field; it only
 * records actual sleptAt/wakeAt data when the user logs real sleep.
 */
const syncLogStatus = async (
  userId: string,
  reminder: {
    type: string
    mealId: string | null
    exercisePlanId: string | null
  },
  logStatus: "DONE" | "SKIPPED"
) => {
  if (reminder.type === "MEAL" && reminder.mealId) {
    await prisma.mealLog.updateMany({
      where: {
        userId,
        mealId: reminder.mealId,
        status: "PENDING", // only update if not already acted on
      },
      data: { status: logStatus },
    })
  }

  if (reminder.type === "EXERCISE" && reminder.exercisePlanId) {
    await prisma.exerciseLog.updateMany({
      where: {
        userId,
        exercisePlanId: reminder.exercisePlanId,
        status: "PENDING",
      },
      data: { status: logStatus },
    })
  }

  // SLEEP → no log update (SleepLog has no status field)
  // MEDICATION → no log model in schema, reminder itself is the record
}

// ─── Mark Completed ───────────────────────────────────────────────────────────

export const markReminderCompleted = async (reminderId: string, userId: string) => {
  const reminder = await prisma.reminder.findFirst({
    where: { id: reminderId, userId },
    select: {
      status: true,
      type: true,
      mealId: true,
      exercisePlanId: true,
    },
  })

  if (!reminder) return null

  if (reminder.status === "COMPLETED" || reminder.status === "SKIPPED") {
    return { alreadySettled: true, status: reminder.status }
  }

  // Update reminder + sync log in parallel
  const [updated] = await Promise.all([
    prisma.reminder.update({
      where: { id: reminderId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
      select: { id: true, status: true, completedAt: true },
    }),
    syncLogStatus(userId, reminder, "DONE"),
  ])

  return updated
}

// ─── Manual Skip ─────────────────────────────────────────────────────────────

export const skipReminder = async (reminderId: string, userId: string) => {
  const reminder = await prisma.reminder.findFirst({
    where: { id: reminderId, userId },
    select: {
      status: true,
      type: true,
      mealId: true,
      exercisePlanId: true,
    },
  })

  if (!reminder) return null

  if (reminder.status === "COMPLETED" || reminder.status === "SKIPPED") {
    return { alreadySettled: true, status: reminder.status }
  }

  const [updated] = await Promise.all([
    prisma.reminder.update({
      where: { id: reminderId },
      data: {
        status: "SKIPPED",
        autoSkippedAt: new Date(),
      },
      select: { id: true, status: true, autoSkippedAt: true },
    }),
    syncLogStatus(userId, reminder, "SKIPPED"),
  ])

  return updated
}