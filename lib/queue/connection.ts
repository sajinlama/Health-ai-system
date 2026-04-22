import Redis from "ioredis"

const connection = new Redis({
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
  maxRetriesPerRequest: null, // Required by BullMQ
})

connection.on("error", (err) => console.error("[Redis] Connection error:", err))
connection.on("connect", () => console.log("[Redis] Connected"))

export default connection