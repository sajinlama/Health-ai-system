export type ReminderNotificationJobData = {
  reminderId: string
  userId: string
  type: "MEAL" | "EXERCISE" | "SLEEP" | "MEDICATION"
  linkedTo: string
  telegramChatId: string | null
}

export type AutoSkipJobData = {
  reminderId: string
}