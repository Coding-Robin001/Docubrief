// Place at: src/lib/upload-limit.ts
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

/**
 * Claims one upload slot inside a transaction. For free users the
 * "count < limit" check and the increment happen in a single UPDATE, so two
 * simultaneous uploads can't both slip past the limit. Throws
 * UploadLimitReachedError (rolling the transaction back) if no slot is left.
 */
export async function reserveUploadSlot(
  tx: Prisma.TransactionClient,
  userId: string,
) {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { isPremium: true },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.isPremium) {
    await tx.user.update({
      where: { id: userId },
      data: { uploadCount: { increment: 1 } },
    });
    return;
  }

  const { count } = await tx.user.updateMany({
    where: { id: userId, uploadCount: { lt: FREE_UPLOAD_LIMIT } },
    data: { uploadCount: { increment: 1 } },
  });

  if (count === 0) {
    throw new UploadLimitReachedError();
  }
}