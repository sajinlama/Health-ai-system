import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getTodaysReminders } from "@/service/remainder/reminder.service"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const data = await getTodaysReminders(session.user.id)

  return Response.json(data)
}