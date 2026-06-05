import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set");
}

// Create a fresh instance for the worker
const workerBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

export default workerBot;