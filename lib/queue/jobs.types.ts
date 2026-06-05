


// ─── Notification Queue Job Types ─────────────────────────────────────────────

export type NotificationJobData = {
  userId: string
  type: "MEAL" | "EXERCISE" | "SLEEP" | "MEDICATION"
  linkedTo: string
  telegramChatId: string | null | undefined
  medicationLogId?: string  // only for MEDICATION type
}

// ─── Daily Scheduler Job Types ────────────────────────────────────────────────

export type DailySchedulerJobData = {
  triggerTime: string
  date: string
}

// ─── Weekly Report Job Types ──────────────────────────────────────────────────

export type WeeklyReportJobData = {
  userId: string
  weekStart: string
  weekEnd: string
}

// ─── (Optional) If you have any other existing job types, keep them here ──────
// Example:
// export type SomeOtherJobData = { ... }