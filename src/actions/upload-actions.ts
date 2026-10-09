"use server";

import { fetchAndExtractPdfText } from "@/lib/langchain";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { summarySchema } from "@/lib/summarySchema"; // Import your summarySchema
import { generateSummary } from "@/lib/generateSummary";
import type { Provider } from "@/lib/modelCatalog";
import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/require-user";
import { UploadLimitReachedError, reserveUploadSlot } from "@/lib/uploadLimit";

type UploadResponse = {
  ufsUrl: string;
  name: string;
};

type StorePdfSummaryInput = z.infer<typeof storePdfSummarySchema>;

type StorePdfSummaryResult =
  | { success: true; data: { id: string }; message: string }
  | { success: false; data: null; message: string; code?: "LIMIT_REACHED" };


// Accept either a string OR the structured summary object
const storePdfSummarySchema = z.object({
  originalFileUrl: z.string().url("A valid file URL is required."),
  fileName: z.string().min(1, "A file name is required."),
  summaryText: z.union([
    z.string().min(1, "Summary text can't be empty."),
    summarySchema,
  ]),
  title: z.string().optional(),
});

export async function generatePdfSummary(
  uploadResponse: UploadResponse[],
  provider: Provider = "gemini",
) {
  if (!uploadResponse.length) {
    return {
      data: null,
      message: "No file uploaded",
    };
  }

  const file = uploadResponse[0];

  if (!file.ufsUrl) {
    return {
      data: null,
      message: "PDF URL is missing",
    };
  }

  try {
    console.log("Processing:", file.name);

    const pdfText = await fetchAndExtractPdfText(file.ufsUrl);

    console.log("Characters:", pdfText.length);

    const result = await generateSummary(pdfText, provider);

    console.log(`Summary generated successfully with ${result.modelUsed}`);

    return {
      data: result.summary,
      modelUsed: result.modelUsed,
      provider: result.provider,
      attempts: result.attempts,
      message: "PDF summarized successfully",
    };
  } catch (error) {
    console.error("PDF summary error:", error);

    return {
      data: null,
      message: "Failed to generate summary. Please try again.",
    };
  }
}

// Replace your existing storePdfSummary in src/actions/upload-actions.ts with this.
// Add these imports to that file if they're missing:
//
//   import { revalidatePath } from "next/cache";
//   import { requireUserId } from "@/lib/require-user";
//   import { UploadLimitReachedError, reserveUploadSlot } from "@/lib/upload-limit";

// const storePdfSummarySchema = z.object({
//   originalFileUrl: z.string().url("A valid file URL is required."),
//   fileName: z.string().min(1, "A file name is required."),
//   summaryText: z.string().min(1, "Summary text can't be empty."),
//   title: z.string().optional(),
// });

// type StorePdfSummaryInput = z.infer<typeof storePdfSummarySchema>;

// type StorePdfSummaryResult =
//   | { success: true; data: { id: string }; message: string }
//   | { success: false; data: null; message: string; code?: "LIMIT_REACHED" };

// Replace the schema, the result TYPE and the function in src/actions/upload-actions.ts
// with the three blocks below (the type needs replacing too, it now has `code`).
// Add these imports to that file if they're missing:
//
//   import { revalidatePath } from "next/cache";
//   import { requireUserId } from "@/lib/require-user";
//   import { summarySchema } from "@/lib/summarySchema";
//   import { UploadLimitReachedError, reserveUploadSlot } from "@/lib/upload-limit";


export async function storePdfSummary(
  input: StorePdfSummaryInput,
): Promise<StorePdfSummaryResult> {
  try {
    const sessionResult = await requireUserId();

    if (!sessionResult.success) {
      return { success: false, data: null, message: sessionResult.message };
    }

    const parsed = storePdfSummarySchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        data: null,
        message: parsed.error.issues[0]?.message ?? "Invalid summary data provided.",
      };
    }

    const { originalFileUrl, fileName, summaryText, title } = parsed.data;

    // the DB column is a string, so serialize the structured summary if that's what we got
    const summaryTextString =
      typeof summaryText === "string" ? summaryText : JSON.stringify(summaryText);

    const resolvedTitle =
      title ??
      (typeof summaryText === "string" ? undefined : summaryText.title) ??
      fileName.replace(/\.pdf$/i, "");

    // claim an upload slot and save the summary atomically: if the user is
    // out of free uploads the transaction rolls back and nothing is saved
    const savedSummary = await prisma.$transaction(async (tx) => {
      await reserveUploadSlot(tx, sessionResult.userId);

      return tx.pdfSummary.create({
        data: {
          userId: sessionResult.userId,
          originalFileUrl,
          fileName,
          title: resolvedTitle,
          summaryText: summaryTextString,
          status: "COMPLETED",
        },
        select: { id: true },
      });
    });

    // refresh the counters shown on both pages
    revalidatePath("/upload");
    revalidatePath("/summaries");

    return {
      success: true,
      data: { id: savedSummary.id },
      message: "Summary saved successfully.",
    };
  } catch (error) {
    if (error instanceof UploadLimitReachedError) {
      return {
        success: false,
        data: null,
        code: "LIMIT_REACHED",
        message:
          "You've used all your free uploads. Upgrade to premium for unlimited summaries.",
      };
    }

    console.error("storePdfSummary failed:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        success: false,
        data: null,
        message: "A database error occurred while saving your summary.",
      };
    }

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
      message: "Something went wrong while saving your summary. Please try again.",
    };
  }
}