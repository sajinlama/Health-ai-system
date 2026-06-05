import prisma from "@/lib/db"

// ─── Create today's medication logs ──────────────────────────────────────────

export const createDailyMedicationLogs = async (now: Date) => {
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  const medications = await prisma.medication.findMany({
    where: { isActive: true },
  })

  for (const med of medications) {
    for (const timeStr of med.scheduledTimes) {
      const [hours, minutes] = timeStr.split(":").map(Number)
      const scheduledAt = new Date(now)
      scheduledAt.setHours(hours, minutes, 0, 0)

      const existing = await prisma.medicationLog.findFirst({
        where: {
          userId: med.userId,
          medicationId: med.id,
          scheduledAt: { gte: startOfDay, lte: endOfDay },
        },
      })

      if (!existing) {
        await prisma.medicationLog.create({
          data: {
            userId: med.userId,
            medicationId: med.id,
            scheduledAt,
            status: "PENDING",
          },
        })
      }
    }
  }

  console.log("[MedicationLog] Fresh medication logs created for today")
}

// ─── Mark medication taken ────────────────────────────────────────────────────

export const markMedicationTaken = async (logId: string, userId: string) => {
  const log = await prisma.medicationLog.findFirst({
    where: { id: logId, userId },
  })

  if (!log) return null
  if (log.status === "TAKEN" || log.status === "SKIPPED") {
    return { alreadySettled: true, status: log.status }
  }

  return prisma.medicationLog.update({
    where: { id: logId },
    data: { status: "TAKEN", takenAt: new Date() },
  })
}

// ─── Skip medication ──────────────────────────────────────────────────────────

export const skipMedicationLog = async (logId: string, userId: string) => {
  const log = await prisma.medicationLog.findFirst({
    where: { id: logId, userId },
  })

  if (!log) return null
  if (log.status === "TAKEN" || log.status === "SKIPPED") {
    return { alreadySettled: true, status: log.status }
  }

  return prisma.medicationLog.update({
    where: { id: logId },
    data: { status: "SKIPPED" },
  })
}

// ─── Auto-miss overdue logs ───────────────────────────────────────────────────

export const autoMissOverdueLogs = async () => {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000) // 30 min past scheduled

  await prisma.medicationLog.updateMany({
    where: {
      status: "PENDING",
      scheduledAt: { lt: cutoff },
    },
    data: { status: "MISSED" },
  })
}

// ─── Get today's medication logs for a user ───────────────────────────────────

export const getTodaysMedicationLogs = async (userId: string) => {
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  return prisma.medicationLog.findMany({
    where: {
      userId,
      scheduledAt: { gte: startOfDay, lte: endOfDay },
    },
    include: {
      medication: {
        select: { medicationName: true, dosage: true },
      },
    },
    orderBy: { scheduledAt: "asc" },
  })
}