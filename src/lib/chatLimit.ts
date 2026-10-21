
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";

export const DAILY_CHAT_LIMIT = 5;

export type ChatQuota = {
  used: number;
  limit: number | null; // null = unlimited (premium)
  remaining: number | null;
  isPremium: boolean;
  hasReachedLimit: boolean;
};

export class ChatLimitReachedError extends Error {
  constructor() {
    super("Daily chat limit reached.");
    this.name = "ChatLimitReachedError";
  }
}

// The day rolls over at midnight UTC (1am in Lagos). Switching to per-user
// timezones later only means changing this one function.
function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getChatQuota(userId: string): Promise<ChatQuota> {
  const [user, usage] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true },
    }),
    prisma.chatUsage.findUnique({
      where: { userId_day: { userId, day: todayKey() } },
      select: { count: true },
    }),
  ]);

  const used = usage?.count ?? 0;

  if (user?.isPremium) {
    return { used, limit: null, remaining: null, isPremium: true, hasReachedLimit: false };
  }

  const remaining = Math.max(0, DAILY_CHAT_LIMIT - used);

  return {
    used,
    limit: DAILY_CHAT_LIMIT,
    remaining,
    isPremium: false,
    hasReachedLimit: remaining === 0,
  };
}

/** For server components: the signed-in user's chat quota, or null if signed out. */
export async function getCurrentUserChatQuota(): Promise<ChatQuota | null> {
  const sessionResult = await requireUserId();
  if (!sessionResult.success) return null;

  return getChatQuota(sessionResult.userId);
}

/**
 * Takes one question from today's allowance and returns how many are left
 * (null for premium, which is unlimited). For free users the "count < limit"
 * check and the increment are a single UPDATE, so two tabs sending at the
 * same moment can't both squeeze past the limit.
 * Throws ChatLimitReachedError when today's questions are used up.
 */
export async function reserveChatQuestion(userId: string): Promise<number | null> {
  const day = todayKey();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return prisma.$transaction(async (tx) => {
    // make sure today's row exists (safe if two requests race to create it)
    await tx.chatUsage.createMany({
      data: [{ userId, day, count: 0 }],
      skipDuplicates: true,
    });

    if (user.isPremium) {
      await tx.chatUsage.update({
        where: { userId_day: { userId, day } },
        data: { count: { increment: 1 } },
      });
      return null;
    }

    const { count } = await tx.chatUsage.updateMany({
      where: { userId, day, count: { lt: DAILY_CHAT_LIMIT } },
      data: { count: { increment: 1 } },
    });

    if (count === 0) {
      throw new ChatLimitReachedError();
    }

    const row = await tx.chatUsage.findUniqueOrThrow({
      where: { userId_day: { userId, day } },
      select: { count: true },
    });

    return Math.max(0, DAILY_CHAT_LIMIT - row.count);
  });
}

/**
 * Gives a question back when the model or the save failed after we took it.
 * Never goes below zero.
 */
export async function refundChatQuestion(userId: string): Promise<void> {
  await prisma.chatUsage.updateMany({
    where: { userId, day: todayKey(), count: { gt: 0 } },
    data: { count: { decrement: 1 } },
  });
}