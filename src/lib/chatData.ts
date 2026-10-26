
// Plain server helper for the summary page. No "use server": only Server
// Components call it, and the browser never should.
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { getChatQuota, type ChatQuota } from "@/lib/chatLimit";

export type ChatMessageItem = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
};

const HISTORY_SHOWN = 100;

/**
 * Loads what the chat panel needs on first render. Chat is secondary to the
 * summary itself, so any failure here returns an empty panel instead of
 * breaking the page. The server action still enforces auth and limits.
 */
export async function getChatPanelData(
  summaryId: string,
): Promise<{ messages: ChatMessageItem[]; quota: ChatQuota | null }> {
  try {
    const sessionResult = await requireUserId();

    if (!sessionResult.success) {
      return { messages: [], quota: null };
    }

    const { userId } = sessionResult;

    const [recent, quota] = await Promise.all([
      prisma.chatMessage.findMany({
        // scoped to this user as well as this summary
        where: { summaryId, userId },
        orderBy: { createdAt: "desc" },
        take: HISTORY_SHOWN,
        select: { id: true, role: true, content: true },
      }),
      getChatQuota(userId),
    ]);

    return { messages: recent.reverse(), quota };
  } catch (error) {
    console.error("getChatPanelData failed:", error);
    return { messages: [], quota: null };
  }
}