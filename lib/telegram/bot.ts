import "dotenv/config"
import TelegramBot from "node-telegram-bot-api"


if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set in environment variables")
}

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: false, // Workers only send messages, no need to poll
})

export default bot