import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set");
}

// Check if we're in a worker process or Next.js
const isWorker = process.argv.some(arg => arg.includes('worker')) || 
                 process.env.WORKER === 'true';

let botInstance: TelegramBot | null = null;

export function getBot() {
  // Don't create bot instances in Next.js dev mode (only in worker)
  if (!isWorker && process.env.NODE_ENV === 'development') {
    console.warn("[Telegram] Skipping bot initialization in Next.js dev mode");
    return null;
  }
  
  if (!botInstance) {
    botInstance = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, {
      polling: false, // Don't poll in Next.js
    });
  }
  return botInstance;
}

export default getBot();