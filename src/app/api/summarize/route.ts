
import { z } from "zod";
import { requireUserId } from "@/lib/require-user";
import { fetchAndExtractPdfText } from "@/lib/langchain";
import { generateSummary } from "@/lib/generateSummary";
import { describeError, type GenerationEvent } from "@/lib/modelLog";
import { getUploadQuota, UploadLimitReachedError } from "@/lib/uploadLimit";
import { saveGeneratedSummary } from "@/lib/saveSummary";
import { MIN_USABLE_PDF_CHARS } from "@/lib/pdfText";
import { SUMMARY_CHAR_LIMITS } from "@/lib/modelCatalog";

export const runtime = "nodejs";
// extraction + generation with fallbacks can take minutes; raise to whatever your host allows
export const maxDuration = 300;

// This endpoint fetches a URL server-side, so only accept UploadThing file URLs.
// Adjust if your UploadThing files are served from a different host.
function isUploadThingUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname.endsWith(".ufs.sh") ||
        url.hostname === "utfs.io" ||
        url.hostname.endsWith(".utfs.io"))
    );
  } catch {
    return false;
  }
}

const bodySchema = z.object({
  fileUrl: z.string().url().refine(isUploadThingUrl, "Unsupported file location."),
  fileName: z.string().trim().min(1).max(255),
  provider: z.enum(["gemini", "openrouter"]),
});

export async function POST(req: Request) {
  const sessionResult = await requireUserId();

  if (!sessionResult.success) {
    return Response.json({ message: sessionResult.message }, { status: 401 });
  }

  const userId = sessionResult.userId;

  // stop before spending any AI calls if a free user is out of uploads
  const quota = await getUploadQuota(userId);

  if (quota.hasReachedLimit) {
    return Response.json(
      {
        message:
          "You've used all your free uploads. Upgrade to premium for unlimited summaries.",
        code: "LIMIT_REACHED",
      },
      { status: 403 },
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));

  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const { fileUrl, fileName, provider } = parsed.data;
  const providerLabel = provider === "gemini" ? "Gemini" : "OpenRouter";
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: GenerationEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      // lets the catch block say which step failed
      let stage: "reading" | "generating" | "saving" = "reading";

      try {
        // 1. extract the text once; it's saved below so chat never has to redo this
        send({ type: "extracting" });
        const extractStart = Date.now();
        const pdfText = await fetchAndExtractPdfText(fileUrl);
        console.log(
          `Summarize: extracted ${pdfText.length} chars in ${Date.now() - extractStart}ms`,
        );

        if (pdfText.trim().length < MIN_USABLE_PDF_CHARS) {
          send({
            type: "error",
            message:
              "Couldn't read any text from this PDF. Scanned or image-only PDFs aren't supported.",
          });
          return;
        }

        // warn when the document is longer than what the model will read
        const charLimit = SUMMARY_CHAR_LIMITS[provider];
        if (pdfText.length > charLimit) {
          send({
            type: "notice",
            message: `This document has ${pdfText.length.toLocaleString("en-US")} characters. For best results the limit is ${charLimit.toLocaleString("en-US")}, so only the first ${charLimit.toLocaleString("en-US")} will be summarised.`,
          });
        }

        // 2. generate the summary with the chosen provider's fallback chain
        stage = "generating";
        const generateStart = Date.now();
        const result = await generateSummary(pdfText, provider, send);
        console.log(
          `Summarize: ${result.modelUsed} generated in ${Date.now() - generateStart}ms (${result.attempts.length} attempt(s))`,
        );

        // 3. save the summary, the full text, and the upload slot together
        stage = "saving";
        send({ type: "saving" });
        const summaryId = await saveGeneratedSummary({
          userId,
          fileUrl,
          fileName,
          summary: result.summary,
          pdfText,
        });

        send({
          type: "complete",
          summaryId,
          modelUsed: result.modelUsed,
          provider: result.provider,
        });
      } catch (error) {
        console.error(`Summarize route error (${stage}):`, error);

        if (error instanceof UploadLimitReachedError) {
          send({
            type: "error",
            code: "LIMIT_REACHED",
            message:
              "You've used all your free uploads. Upgrade to premium for unlimited summaries.",
          });
        } else if (stage === "reading") {
          send({
            type: "error",
            message: `Couldn't read that PDF (${describeError(error)}).`,
          });
        } else if (stage === "generating") {
          send({
            type: "error",
            message: `All ${providerLabel} models failed (${describeError(error)}). Try switching provider.`,
          });
        } else {
          send({
            type: "error",
            message: "The summary was generated but couldn't be saved. Please try again.",
          });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}