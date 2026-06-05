import prisma from "@/lib/db";

// Generate and store linking code in database
export async function generateTelegramLinkCode(userId: string): Promise<string> {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minute expiry
  
  // Store in database
  await prisma.telegramLinkCode.create({
    data: {
      userId,
      code,
      expiresAt,
      used: false,
    },
  });
  
  return code;
}

// Verify linking code (used by worker)
export async function verifyTelegramLinkCode(code: string): Promise<{ userId: string; isValid: boolean }> {
  const linkCode = await prisma.telegramLinkCode.findFirst({
    where: {
      code: code,
      used: false,
      expiresAt: { gt: new Date() }
    },
    include: {
      user: true
    }
  });
  
  if (!linkCode) {
    return { userId: "", isValid: false };
  }
  
  return { userId: linkCode.userId, isValid: true };
}

// Mark code as used
export async function markCodeAsUsed(codeId: string): Promise<void> {
  await prisma.telegramLinkCode.update({
    where: { id: codeId },
    data: { used: true }
  });
}