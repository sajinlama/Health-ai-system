import { Worker } from "bullmq";
import connection from "@/lib/queue/connection";
import type { NotificationJobData } from "@/lib/queue/jobs.types";
import prisma from "@/lib/db";
import { withRetry } from "@/lib/db-retry";
import { generateWeeklyReport } from "@/service/weeklly/weekly-report.service";
import { createDailyMedicationLogs, autoMissOverdueLogs } from "@/service/medication/medication-log.service";
import { notificationQueue } from "@/lib/queue/queues";

const dailySchedulerWorker = new Worker(
  "daily-scheduler",
  async () => {
    const now = new Date();
    console.log(`[DailyScheduler] Running at ${now.toISOString()}`);

    try {
      // Wrap all database operations with retry
      await withRetry(async () => {
        // Reset logs
        await createDailyLogs(now);
        return true;
      });

      await withRetry(async () => {
        await autoMissOverdueLogs();
        return true;
      });

      // Fetch logs for notifications with retry
      const [mealLogs, exerciseLogs, sleepSchedules] = await withRetry(async () => {
        return await Promise.all([
          prisma.mealLog.findMany({
            where: { status: "PENDING" },
            include: {
              user: { select: { telegramChatId: true } },
              meal: { select: { mealName: true, mealTime: true } },
            },
          }),
          prisma.exerciseLog.findMany({
            where: { status: "PENDING" },
            include: {
              user: { select: { telegramChatId: true } },
              exercisePlan: { select: { exerciseName: true, scheduledTime: true } },
            },
          }),
          prisma.sleepSchedule.findMany({
            include: { user: { select: { id: true, telegramChatId: true } } },
          }),
        ]);
      });

      let scheduled = 0;

      // Schedule meal notifications
      for (const log of mealLogs) {
        const target = new Date(now);
        target.setHours(log.meal.mealTime.getHours(), log.meal.mealTime.getMinutes(), 0, 0);
        if (target <= now) continue;

        await notificationQueue.add("notify-meal", {
          userId: log.userId,
          type: "MEAL",
          linkedTo: log.meal.mealName,
          telegramChatId: log.user.telegramChatId,
        } as NotificationJobData, {
          delay: target.getTime() - now.getTime(),
          jobId: `meal-${log.id}-${now.toDateString()}`,
        });
        scheduled++;
      }

      // Schedule exercise notifications
      for (const log of exerciseLogs) {
        const target = new Date(now);
        target.setHours(
          log.exercisePlan.scheduledTime.getHours(),
          log.exercisePlan.scheduledTime.getMinutes(),
          0,
          0
        );
        if (target <= now) continue;

        await notificationQueue.add("notify-exercise", {
          userId: log.userId,
          type: "EXERCISE",
          linkedTo: log.exercisePlan.exerciseName,
          telegramChatId: log.user.telegramChatId,
        } as NotificationJobData, {
          delay: target.getTime() - now.getTime(),
          jobId: `exercise-${log.id}-${now.toDateString()}`,
        });
        scheduled++;
      }

      // Schedule sleep notifications
      for (const schedule of sleepSchedules) {
        const target = new Date(now);
        target.setHours(schedule.bedTime.getHours(), schedule.bedTime.getMinutes(), 0, 0);
        if (target <= now) continue;

        await notificationQueue.add("notify-sleep", {
          userId: schedule.userId,
          type: "SLEEP",
          linkedTo: "Bedtime",
          telegramChatId: schedule.user.telegramChatId,
        } as NotificationJobData, {
          delay: target.getTime() - now.getTime(),
          jobId: `sleep-${schedule.id}-${now.toDateString()}`,
        });
        scheduled++;
      }

      // Schedule medication notifications with retry
      const medicationLogs = await withRetry(async () => {
        return await prisma.medicationLog.findMany({
          where: { status: "PENDING" },
          include: {
            user: { select: { telegramChatId: true } },
            medication: { select: { medicationName: true, dosage: true } },
          },
        });
      });

      for (const log of medicationLogs) {
        const target = new Date(log.scheduledAt);
        if (target <= now) continue;

        await notificationQueue.add("notify-medication", {
          userId: log.userId,
          type: "MEDICATION",
          linkedTo: log.medication.medicationName,
          telegramChatId: log.user.telegramChatId,
          medicationLogId: log.id,
        } as NotificationJobData, {
          delay: target.getTime() - now.getTime(),
          jobId: `medication-${log.id}-${now.toDateString()}`,
        });
        scheduled++;
      }

      console.log(`[DailyScheduler] Scheduled ${scheduled} notifications`);

      // Weekly reports on Sunday
      if (now.getDay() === 0) {
        console.log("[DailyScheduler] Generating weekly reports...");
        const allUsers = await withRetry(async () => {
          return await prisma.user.findMany({ select: { id: true } });
        });

        for (const user of allUsers) {
          try {
            await generateWeeklyReport(user.id);
          } catch (error) {
            console.error(`Failed to generate report for user ${user.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("[DailyScheduler] Job failed:", error);
      throw error;
    }
  },
  { 
    connection,
    concurrency: 1,
    settings: {
      retryProcessDelay: 10000, // Wait 10 seconds before retry
    },
  }
);

// Helper function to create daily logs
const createDailyLogs = async (now: Date) => {
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const startOfYesterday = new Date(startOfDay);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const endOfYesterday = new Date(endOfDay);
  endOfYesterday.setDate(endOfYesterday.getDate() - 1);

  // Reset yesterday's and today's logs
  await Promise.all([
    prisma.mealLog.updateMany({
      where: {
        scheduledTime: { gte: startOfYesterday, lte: endOfDay },
        status: { not: "PENDING" },
      },
      data: { status: "PENDING" },
    }),
    prisma.exerciseLog.updateMany({
      where: {
        scheduledTime: { gte: startOfYesterday, lte: endOfDay },
        status: { not: "PENDING" },
      },
      data: { status: "PENDING" },
    }),
  ]);

  // Create meal logs
  const activePlans = await prisma.nutritionPlan.findMany({
    where: { isActive: true },
    include: { meals: true },
  });

  for (const plan of activePlans) {
    for (const meal of plan.meals) {
      const scheduledTime = new Date(now);
      scheduledTime.setHours(
        meal.mealTime.getHours(),
        meal.mealTime.getMinutes(),
        0,
        0
      );

      const existing = await prisma.mealLog.findFirst({
        where: {
          userId: plan.userId,
          mealId: meal.id,
          scheduledTime: { gte: startOfDay, lte: endOfDay },
        },
      });

      if (!existing) {
        await prisma.mealLog.create({
          data: {
            userId: plan.userId,
            mealId: meal.id,
            status: "PENDING",
            scheduledTime,
          },
        });
      }
    }
  }

  // Create exercise logs
  const exercisePlans = await prisma.exercisePlan.findMany({});
  for (const plan of exercisePlans) {
    const scheduledTime = new Date(now);
    scheduledTime.setHours(
      plan.scheduledTime.getHours(),
      plan.scheduledTime.getMinutes(),
      0,
      0
    );

    const existing = await prisma.exerciseLog.findFirst({
      where: {
        userId: plan.userId,
        exercisePlanId: plan.id,
        scheduledTime: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (!existing) {
      await prisma.exerciseLog.create({
        data: {
          userId: plan.userId,
          exercisePlanId: plan.id,
          status: "PENDING",
          scheduledTime,
        },
      });
    }
  }

  // Create sleep logs
  const sleepSchedules = await prisma.sleepSchedule.findMany({});
  for (const schedule of sleepSchedules) {
    const sleptAt = new Date(now);
    sleptAt.setHours(
      schedule.bedTime.getHours(),
      schedule.bedTime.getMinutes(),
      0,
      0
    );

    const wakeAt = new Date(now);
    wakeAt.setHours(
      schedule.wakeTime.getHours(),
      schedule.wakeTime.getMinutes(),
      0,
      0
    );

    const existing = await prisma.sleepLog.findFirst({
      where: {
        userId: schedule.userId,
        sleptAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (!existing) {
      await prisma.sleepLog.create({
        data: {
          userId: schedule.userId,
          sleptAt,
          wakeAt,
          completed: false,
        },
      });
    }
  }

  // Create medication logs
  await createDailyMedicationLogs(now);

  console.log("[DailyScheduler] Daily logs created");
};

dailySchedulerWorker.on("completed", (job) => {
  console.log(`[DailyScheduler] Job ${job.id} completed`);
});

dailySchedulerWorker.on("failed", (job, err) => {
  console.error(`[DailyScheduler] Job ${job?.id} failed:`, err.message);
});

export default dailySchedulerWorker;