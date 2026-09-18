"use server";

import { generateSummaryFromGemini } from "@/lib/gemini-ai";
import { fetchAndExtractPdfText } from "@/lib/langchain";

type UploadResponse = {
  ufsUrl: string;
  name: string;
};

export async function generatePdfSummary(
  uploadResponse: UploadResponse[],
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

    const summary = await generateSummaryFromGemini(pdfText);

    console.log("Summary generated successfully");

    return {
      data: summary,
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