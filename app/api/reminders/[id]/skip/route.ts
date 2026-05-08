import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { skipReminder } from "@/service/remainder/reminder.service"
 

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }  // ✅
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { id } = await params  // ✅

  const result = await skipReminder(id, session.user.id)
 

  if (!result) {
    return Response.json({ error: "Reminder not found" }, { status: 404 })
  }

  if ("alreadySettled" in result) {
    return Response.json(
      { error: `Reminder already ${result.status.toLowerCase()}` },
      { status: 409 }
    )
  }

  return Response.json({ message: "Reminder skipped", data: result })
}
