"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/require-user";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export type SummaryListItem = {
  id: string;
  title: string | null;
  fileName: string;
  excerpt: string | null;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: Date;
};

type FetchSummariesResult =
  | { success: true; data: SummaryListItem[]; message: string }
  | { success: false; data: null; message: string };

const EXCERPT_LENGTH = 180;

export async function fetchSummaries(): Promise<FetchSummariesResult> {
  const sessionResult = await requireUserId();

  if (!sessionResult.success) {
    return { success: false, data: null, message: sessionResult.message };
  }

  try {
    const summaries = await prisma.pdfSummary.findMany({
      where: { userId: sessionResult.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        fileName: true,
        summaryText: true,
        status: true,
        createdAt: true,
      },
    });

    const data: SummaryListItem[] = summaries.map((s) => ({
      id: s.id,
      title: s.title,
      fileName: s.fileName,
      status: s.status,
      createdAt: s.createdAt,
      excerpt: s.summaryText
        ? s.summaryText.slice(0, EXCERPT_LENGTH) +
          (s.summaryText.length > EXCERPT_LENGTH ? "…" : "")
        : null,
    }));

    return {
      success: true,
      data,
      message: "Summaries fetched successfully.",
    };
  } catch (error) {
    console.error("fetchSummaries failed:", error);

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return {
        success: false,
        data: null,
        message: "Couldn't connect to the database. Please try again shortly.",
      };
    }

    return {
      success: false,
      data: null,
      message: "Something went wrong while loading your summaries.",
    };
  }
}

const deleteSummarySchema = z.object({
  id: z.string().min(1, "A summary id is required."),
});

type DeleteSummaryResult =
  | { success: true; message: string }
  | { success: false; message: string };

export async function deleteSummary(id: string): Promise<DeleteSummaryResult> {
  try {
    const sessionResult = await requireUserId();

    if (!sessionResult.success) {
      return { success: false, message: sessionResult.message };
    }

    const parsed = deleteSummarySchema.safeParse({ id });

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Invalid summary id.",
      };
    }

    // ownership check — don't let anyone delete a summary that
    // isn't theirs just by guessing/passing another user's id
    const existing = await prisma.pdfSummary.findUnique({
      where: { id: parsed.data.id },
      select: { userId: true },
    });

    if (!existing) {
      return { success: false, message: "That summary no longer exists." };
    }

    if (existing.userId !== sessionResult.userId) {
      return {
        success: false,
        message: "You don't have permission to delete this summary.",
      };
    }

    await prisma.pdfSummary.delete({
      where: { id: parsed.data.id },
    });

    // re-sync the dashboard's server-fetched data — adjust the path
    // if your summaries route lives somewhere other than /summaries
    revalidatePath("/summaries");

    return { success: true, message: "Summary deleted." };
  } catch (error) {
    console.error("deleteSummary failed:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { success: false, message: "That summary no longer exists." };
      }
      return {
        success: false,
        message: "A database error occurred while deleting this summary.",
      };
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return {
        success: false,
        message: "Couldn't connect to the database. Please try again shortly.",
      };
    }

    return {
      success: false,
      message:
        "Something went wrong while deleting this summary. Please try again.",
    };
  }
}
