// app/api/reminders/[id]/complete/route.ts

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { markReminderCompleted } from "@/service/remainder/reminder.service"

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }  // ✅ params is a Promise
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { id } = await params  // ✅ await before accessing

  const result = await markReminderCompleted(id, session.user.id)

  if (!result) {
    return Response.json({ error: "Reminder not found" }, { status: 404 })
  }

  if ("alreadySettled" in result) {
    return Response.json(
      { error: `Reminder already ${result.status.toLowerCase()}` },
      { status: 409 }
    )
  }

  return Response.json({ message: "Reminder marked as completed", data: result })
}