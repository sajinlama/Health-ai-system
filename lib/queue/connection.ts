import Redis from "ioredis"

const connection = new Redis(process.env.REDIS_HOST!, {
  maxRetriesPerRequest: null, // Required by BullMQ
})

connection.on("error", (err) => console.error("[Redis] Connection error:", err))
connection.on("connect", () => console.log("[Redis] Connected"))

export default connection