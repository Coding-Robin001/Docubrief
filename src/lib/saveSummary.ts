
import { prisma } from "@/lib/prisma";
import { reserveUploadSlot, releaseUploadSlot } from "@/lib/uploadLimit";
import { prepareForStorage } from "@/lib/pdfText";
import type { GeneratedSummary } from "@/lib/summarySchema";

/**
 * Saves a freshly generated summary together with the PDF's extracted text.
 * Two database round trips and no interactive transaction:
 *   1. claim an upload slot (one atomic UPDATE; throws
 *      UploadLimitReachedError if the user is out of free uploads)
 *   2. insert the summary row (this is the one that carries the large text)
 * If the insert fails after the slot was claimed, the slot is given back.
 * Returns the new summary's id.
 */
export async function saveGeneratedSummary({
  userId,
  fileUrl,
  fileName,
  summary,
  pdfText,
}: {
  userId: string;
  fileUrl: string;
  fileName: string;
  summary: GeneratedSummary;
  pdfText: string;
}): Promise<string> {
  const summaryText = JSON.stringify(summary);
  const storedText = prepareForStorage(pdfText);

  const slotStart = Date.now();
  await reserveUploadSlot(prisma, userId);
  const slotMs = Date.now() - slotStart;

  try {
    const insertStart = Date.now();

    const saved = await prisma.pdfSummary.create({
      data: {
        userId,
        originalFileUrl: fileUrl,
        fileName,
        title: summary.title,
        summaryText,
        pdfText: storedText,
        status: "COMPLETED",
      },
      select: { id: true },
    });

    console.log(
      `Save: slot ${slotMs}ms, insert ${Date.now() - insertStart}ms (${storedText.length} chars of PDF text)`,
    );

    return saved.id;
  } catch (error) {
    // the slot was claimed but nothing was saved: give it back
    await releaseUploadSlot(userId).catch(() => {});
    throw error;
  }
}