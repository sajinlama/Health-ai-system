import { Worker } from "bullmq";
import connection from "@/lib/queue/connection";
import type { NotificationJobData } from "@/lib/queue/jobs.types";
import prisma from "@/lib/db";
import { withRetry } from "@/lib/db-retry";
import { sendNotification, sendMedicationNotification } from "@/lib/telegram/notifications";

const notificationWorker = new Worker<NotificationJobData>(
  "notification",
  async (job) => {
    const { type, linkedTo, telegramChatId, medicationLogId } = job.data;

    console.log(`[NotificationWorker] Sending ${type} notification — ${linkedTo}`);

    if (type === "MEDICATION" && medicationLogId) {
      const log = await withRetry(async () => {
        return await prisma.medicationLog.findUnique({
          where: { id: medicationLogId },
          include: {
            medication: { select: { medicationName: true, dosage: true } },
          },
        });
      });

      if (!log) {
        console.warn(`[NotificationWorker] MedicationLog ${medicationLogId} not found`);
        return;
      }

      await sendMedicationNotification(
        telegramChatId,
        log.medication.medicationName,
        log.medication.dosage,
        log.scheduledAt
      );
    } else {
      await sendNotification({ telegramChatId, type, linkedTo });
    }

    console.log(`[NotificationWorker] Done — ${type}: ${linkedTo}`);
  },
  { 
    connection,
    concurrency: 5,
  }
);

notificationWorker.on("completed", (job) => {
  console.log(`[NotificationWorker] Job ${job.id} completed`);
});

notificationWorker.on("failed", (job, err) => {
  console.error(`[NotificationWorker] Job ${job?.id} failed:`, err.message);
});

export default notificationWorker;