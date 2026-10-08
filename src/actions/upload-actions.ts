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

type StorePdfSummaryInput = z.infer<typeof storePdfSummarySchema>;

type StorePdfSummaryResult =
  | { success: true; data: { id: string }; message: string }
  | { success: false; data: null; message: string };

type UploadResponse = {
  ufsUrl: string;
  name: string;
};

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

export async function storePdfSummary(
  input: StorePdfSummaryInput,
): Promise<StorePdfSummaryResult> {
  try {
    // 1. auth check — no userId, no save
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return {
        success: false,
        data: null,
        message: "You must be signed in to save a summary.",
      };
    }

    // 2. validate input shape (accepts object or string)
    const parsed = storePdfSummarySchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        data: null,
        message:
          parsed.error.issues[0]?.message ?? "Invalid summary data provided.",
      };
    }

    const { originalFileUrl, fileName, summaryText, title } = parsed.data;

    // Convert object to JSON string if needed before Prisma insertion
    const serializedSummaryText =
      typeof summaryText === "string"
        ? summaryText
        : JSON.stringify(summaryText);

    // 3. the actual mutation
    const savedSummary = await prisma.pdfSummary.create({
      data: {
        userId: session.user.id,
        originalFileUrl,
        fileName,
        title: title ?? fileName.replace(/\.pdf$/i, ""),
        summaryText: serializedSummaryText,
        status: "COMPLETED",
      },
      select: { id: true },
    });

    console.log("Saved summary ID:", savedSummary.id);

    return {
      success: true,
      data: { id: savedSummary.id },
      message: "Summary saved successfully.",
    };
  } catch (error) {
    console.error("storePdfSummary failed:", error);

    // known Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          data: null,
          message: "This summary already exists.",
        };
      }
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
      message:
        "Something went wrong while saving your summary. Please try again.",
    };
  }
}
