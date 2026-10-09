// Place at: src/app/api/summarize/route.ts
import { z } from "zod";
import { requireUserId } from "@/lib/require-user";
import { fetchAndExtractPdfText } from "@/lib/langchain";
import { generateSummary } from "@/lib/generateSummary";
import { getUploadQuota } from "@/lib/uploadLimit";
import { describeError, type GenerationEvent } from "@/lib/modelLog";

export const runtime = "nodejs";
// generation can take minutes with fallbacks; raise to whatever your host allows
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
  provider: z.enum(["gemini", "openrouter"]),
});

export async function POST(req: Request) {
  const sessionResult = await requireUserId();

  if (!sessionResult.success) {
    return Response.json({ message: sessionResult.message }, { status: 401 });
  }

  // stop before spending any AI calls if a free user is out of uploads
  const quota = await getUploadQuota(sessionResult.userId);

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

  const { fileUrl, provider } = parsed.data;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: GenerationEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      try {
        send({ type: "extracting" });
        const pdfText = await fetchAndExtractPdfText(fileUrl);

        const result = await generateSummary(pdfText, provider, send);
        send({ type: "complete", result });
      } catch (error) {
        console.error("Summarize route error:", error);
        send({
          type: "error",
          message: `All ${provider === "gemini" ? "Gemini" : "OpenRouter"} models failed (${describeError(error)}). Try switching provider.`,
        });
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