"use server";

import { fetchAndExtractPdfText } from "@/lib/langchain";

type UploadResponse = {
  ufsUrl: string;
  name: string;
};

export async function generatePdfSummary(uploadResponse: UploadResponse[]) {
  if (!uploadResponse?.length) return;

  const file = uploadResponse[0];

  const pdfUrl = file.ufsUrl;
  const fileName = file.name;

  if (!pdfUrl) return;

  try {
    const pdfText = await fetchAndExtractPdfText(pdfUrl);

    console.log("File:", fileName);
    console.log(pdfText);
  } catch (error) {
    console.error(error);
  }
}
