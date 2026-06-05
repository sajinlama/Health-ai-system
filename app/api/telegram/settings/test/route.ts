import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { generateTelegramLinkCode } from "@/lib/telegram/linking";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { telegramChatId: true },
    });

    // Generate a new linking code
    const linkingCode = await generateTelegramLinkCode(userId);
    
    // Get the code expiry from database
    const linkCode = await prisma.telegramLinkCode.findFirst({
      where: {
        userId,
        used: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { expiresAt: 'desc' }
    });
    
    const expiresIn = linkCode 
      ? Math.ceil((linkCode.expiresAt.getTime() - new Date().getTime()) / 60000)
      : 10;

    return Response.json({
      linked: !!user?.telegramChatId,
      chatId: user?.telegramChatId,
      linkingCode,
      codeExpiresIn: expiresIn,
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