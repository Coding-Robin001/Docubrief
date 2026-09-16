"use server";

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

  const pdfUrl = file.ufsUrl;
  const fileName = file.name;

  if (!pdfUrl) {
    return {
      data: null,
      message: "PDF URL is missing",
    };
  }

  try {
    const pdfText = await fetchAndExtractPdfText(pdfUrl);

    console.log("File:", fileName);
    console.log(pdfText);

    return {
      data: pdfText,
      message: "PDF processed successfully",
    };
  } catch (error) {
    console.error(error);

    return {
      data: null,
      message: "Failed to process PDF",
    };
  }
}