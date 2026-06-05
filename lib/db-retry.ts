import prisma from "./db";

// Retry wrapper for database operations with Neon adapter
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // Check if it's a connection error
    const isConnectionError = 
      error?.message?.includes('Can\'t reach database') ||
      error?.message?.includes('ETIMEDOUT') ||
      error?.message?.includes('ECONNRESET') ||
      error?.message?.includes('Connection timeout') ||
      error?.message?.includes('adapter');

    if (isConnectionError && retries > 0) {
      console.log(`[DB Retry] Connection error, retrying in ${delay}ms... (${retries} attempts left)`);
      console.log(`[DB Retry] Error: ${error.message}`);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Try to reconnect by disconnecting and connecting again
      try {
        await prisma.$disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
      
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Keep connection alive
let keepAliveInterval: NodeJS.Timeout | null = null;

export function startKeepAlive() {
  if (keepAliveInterval) return;
  
  keepAliveInterval = setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('[DB KeepAlive] Connection alive');
    } catch (error) {
      console.error('[DB KeepAlive] Connection lost:', error);
    }
  }, 30000); // Every 30 seconds
}

export function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
}