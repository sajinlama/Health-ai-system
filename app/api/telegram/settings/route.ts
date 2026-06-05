import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        telegramChatId: true,
        fullName: true,
      },
    });

    // Delete old unused codes for this user
    await prisma.telegramLinkCode.deleteMany({
      where: {
        userId,
        OR: [
          { expiresAt: { lt: new Date() } },
          { used: true }
        ]
      }
    });

    // Generate new linking code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await prisma.telegramLinkCode.create({
      data: {
        userId,
        code,
        expiresAt,
      },
    });

    return Response.json({
      linked: !!user?.telegramChatId,
      chatId: user?.telegramChatId,
      linkingCode: code,
      codeExpiresIn: 10,
    });
  } catch (error) {
    console.error("Error fetching telegram settings:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { telegramChatId: null },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error unlinking telegram:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}