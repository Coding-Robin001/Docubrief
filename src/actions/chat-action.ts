// Place at: src/actions/chat-actions.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { fetchAndExtractPdfText } from "@/lib/langchain";
import { answerQuestion } from "@/lib/ChatAi";
import {
  ChatLimitReachedError,
  reserveChatQuestion,
  refundChatQuestion,
} from "@/lib/chatLimit";

const HISTORY_LIMIT = 10;

const askSchema = z.object({
  summaryId: z.string().min(1),
  question: z
    .string()
    .trim()
    .min(1, "Enter a question first.")
    .max(500, "Keep your question under 500 characters."),
});

export type AskPdfQuestionResult =
  | { success: true; answer: string; remaining: number | null }
  | { success: false; message: string; code?: "LIMIT_REACHED" };

export async function askPdfQuestion(
  input: z.infer<typeof askSchema>,
): Promise<AskPdfQuestionResult> {
  const startedAt = Date.now();
  let userId = "";
  let reserved = false;

  try {
    // 1. who is asking
    const sessionResult = await requireUserId();
    if (!sessionResult.success) {
      return { success: false, message: sessionResult.message };
    }
    userId = sessionResult.userId;

    // 2. is the input valid
    const parsed = askSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Invalid question.",
      };
    }
    const { summaryId, question } = parsed.data;

    // 3. does this summary exist, and is it theirs
    const summary = await prisma.pdfSummary.findUnique({
      where: { id: summaryId },
      select: { userId: true, originalFileUrl: true, pdfText: true },
    });

    if (!summary) {
      return { success: false, message: "That summary doesn't exist." };
    }
    if (summary.userId !== userId) {
      return { success: false, message: "You don't have access to this summary." };
    }

    // 4. get the document text: extract once, then reuse it from the database
    let pdfText = summary.pdfText;

    if (!pdfText) {
      const extractStart = Date.now();
      const extracted = await fetchAndExtractPdfText(summary.originalFileUrl);
      console.log(
        `Chat: extracted ${extracted.length} chars in ${Date.now() - extractStart}ms`,
      );

      // don't cache empty or near-empty text (e.g. a scanned PDF), or every
      // later question would fail against it
      if (extracted.trim().length < 50) {
        return {
          success: false,
          message:
            "Couldn't read any text from this PDF. Scanned or image-only PDFs can't be used for chat.",
        };
      }

      pdfText = extracted;
      await prisma.pdfSummary.update({
        where: { id: summaryId },
        data: { pdfText },
      });
    }

    // 5. spend one of today's questions (throws ChatLimitReachedError at the limit)
    const remaining = await reserveChatQuestion(userId);
    reserved = true;

    // 6. recent conversation, oldest first
    const recent = await prisma.chatMessage.findMany({
      where: { summaryId },
      orderBy: { createdAt: "desc" },
      take: HISTORY_LIMIT,
      select: { role: true, content: true },
    });
    const history = recent.reverse();

    // 7. ask the model: document + history + question in, plain text out
    const answer = await answerQuestion({ pdfText, history, question });

    // 8. save both messages (explicit timestamps keep their order stable)
    const now = Date.now();
    await prisma.chatMessage.createMany({
      data: [
        { summaryId, userId, role: "USER", content: question, createdAt: new Date(now) },
        { summaryId, userId, role: "ASSISTANT", content: answer, createdAt: new Date(now + 1) },
      ],
    });

    console.log(`Chat: question handled in ${Date.now() - startedAt}ms total`);

    // 9. hand the answer back to the page
    return { success: true, answer, remaining };
  } catch (error) {
    if (error instanceof ChatLimitReachedError) {
      return {
        success: false,
        code: "LIMIT_REACHED",
        message: "You've used today's 5 questions. They reset at midnight UTC.",
      };
    }

    // the model or the save failed after we took a question: give it back
    if (reserved) {
      await refundChatQuestion(userId).catch(() => {});
    }

    console.error("askPdfQuestion failed:", error);

    return {
      success: false,
      message:
        "Couldn't get an answer right now. Your question wasn't counted. Try again.",
    };
  }
}