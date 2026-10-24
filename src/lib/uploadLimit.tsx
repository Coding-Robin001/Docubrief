
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";

export const FREE_UPLOAD_LIMIT = 5;

export type UploadQuota = {
  used: number;
  limit: number | null; // null = unlimited (premium)
  remaining: number | null;
  isPremium: boolean;
  hasReachedLimit: boolean;
};

export class UploadLimitReachedError extends Error {
  constructor() {
    super("Free upload limit reached.");
    this.name = "UploadLimitReachedError";
  }
}

export async function getUploadQuota(userId: string): Promise<UploadQuota> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { uploadCount: true, isPremium: true },
  });

  const used = user?.uploadCount ?? 0;

  if (user?.isPremium) {
    return { used, limit: null, remaining: null, isPremium: true, hasReachedLimit: false };
  }

  const remaining = Math.max(0, FREE_UPLOAD_LIMIT - used);

  return {
    used,
    limit: FREE_UPLOAD_LIMIT,
    remaining,
    isPremium: false,
    hasReachedLimit: remaining === 0,
  };
}

/** For server components: the signed-in user's quota, or null if signed out. */
export async function getCurrentUserQuota(): Promise<UploadQuota | null> {
  const sessionResult = await requireUserId();
  if (!sessionResult.success) return null;

  return getUploadQuota(sessionResult.userId);
}

type UserDb = Pick<Prisma.TransactionClient, "user">;

/**
 * Claims one upload slot with a single UPDATE: free users only get it while
 * their count is under the limit, premium users always do. One statement means
 * one database round trip, and two simultaneous uploads still can't both slip
 * past the limit. Throws UploadLimitReachedError if no slot is left.
 *
 * Works with the normal client or inside a transaction (pass `tx`).
 */
export async function reserveUploadSlot(db: UserDb, userId: string) {
  const { count } = await db.user.updateMany({
    where: {
      id: userId,
      OR: [{ isPremium: true }, { uploadCount: { lt: FREE_UPLOAD_LIMIT } }],
    },
    data: { uploadCount: { increment: 1 } },
  });

  if (count === 0) {
    throw new UploadLimitReachedError();
  }
}

/** Gives a slot back when the save failed after we claimed it. Never goes below zero. */
export async function releaseUploadSlot(userId: string) {
  await prisma.user.updateMany({
    where: { id: userId, uploadCount: { gt: 0 } },
    data: { uploadCount: { decrement: 1 } },
  });
}