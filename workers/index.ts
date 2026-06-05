import "dotenv/config";

process.env.TZ = "Asia/Kolkata";

import { initDailyScheduler } from "@/lib/queue/scheduler";
import dailySchedulerWorker from "./dialyScheduler.workers";
import notificationWorker from "./notification.worker";
import { startTelegramPolling } from "./telegram-worker";
import prisma from "@/lib/db";
import { startKeepAlive } from "@/lib/db-retry";

const bootstrap = async () => {
  console.log("[Workers] Starting all workers...");
  
  // Start database keep-alive
  startKeepAlive();
  
  // Test database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("[Workers] Database connected successfully");
  } catch (error) {
    console.error("[Workers] Database connection failed:", error);
    console.log("[Workers] Will retry connections automatically");
  }

  // Start Telegram polling
  startTelegramPolling();

  await initDailyScheduler();

  console.log("[Workers] All workers running!");
};

bootstrap().catch((err) => {
  console.error("[Workers] Fatal error:", err);
  process.exit(1);
});

const shutdown = async () => {
  console.log("[Workers] Shutting down...");
  await Promise.all([
    dailySchedulerWorker.close(),
    notificationWorker.close(),
    prisma.$disconnect(),
  ]);
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);