import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// GET /api/weekly-snapshot — fetch all snapshots for chart/history
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const snapshots = await prisma.userWeeklySnapshot.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return Response.json(snapshots)
}

// POST /api/weekly-snapshot — save a new snapshot (called by weekly scheduler)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const body = await req.json()
  const { weight, activityLevel } = body

  const snapshot = await prisma.userWeeklySnapshot.create({
    data: {
      userId: session.user.id,
      weight: weight ?? null,
      activityLevel: activityLevel ?? null,
    },
  })

  return Response.json(snapshot)
}