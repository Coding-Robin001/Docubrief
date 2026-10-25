
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
 * (null for premium, which is unlimited). Throws ChatLimitReachedError when
 * today's questions are used up.
 *
 * One statement, one database round trip, no transaction: it creates today's
 * row on the first question of the day, and otherwise adds one only while the
 * count is under the limit. Because it's a single atomic statement, two tabs
 * sending at the same moment can't both squeeze past the limit. No row coming
 * back means the limit was hit.
 */
export async function reserveChatQuestion(userId: string): Promise<number | null> {
  const day = todayKey();

  const rows = await prisma.$queryRaw<{ count: number; isPremium: boolean | null }[]>`
    INSERT INTO chat_usage ("userId", "day", "count")
    VALUES (${userId}, ${day}, 1)
    ON CONFLICT ("userId", "day") DO UPDATE
      SET "count" = chat_usage."count" + 1
      WHERE chat_usage."count" < CASE
        WHEN (SELECT "isPremium" FROM "user" WHERE "id" = ${userId}) THEN 2147483647
        ELSE ${DAILY_CHAT_LIMIT}
      END
    RETURNING "count", (SELECT "isPremium" FROM "user" WHERE "id" = ${userId}) AS "isPremium"
  `;

  if (rows.length === 0) {
    throw new ChatLimitReachedError();
  }

  const { count, isPremium } = rows[0];

  return isPremium ? null : Math.max(0, DAILY_CHAT_LIMIT - Number(count));
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