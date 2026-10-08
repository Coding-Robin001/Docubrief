import { GoogleGenAI, Type } from "@google/genai";
import { SUMMARY_SYSTEM_PROMPT } from "./prompts";
import { summarySchema, type GeneratedSummary } from "./summarySchema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL_PRIORITY = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
];

const REQUIRED_HEADINGS = [
  "Document Details",
  "Key Highlights",
  "Why It Matters",
  "Main Points",
  "Pro Tips",
  "Key Terms to Know",
  "Bottom Line",
];

// mirrors summarySchema.ts — this is what actually constrains Gemini's
// output shape at generation time (the zod schema is the runtime
// double-check afterward, same two-layer approach as OPENROUTER_SUMMARY_SCHEMA)
const GEMINI_SUMMARY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description:
        "A short, catchy title for the document. One leading emoji is fine. No markdown formatting.",
    },
    overview: {
      type: Type.ARRAY,
      description: "1 to 2 single-sentence bullets giving a quick overview.",
      items: { type: Type.STRING },
      minItems: 1,
      maxItems: 2,
    },
    sections: {
      type: Type.ARRAY,
      description:
        "Array of exactly 7 objects in this order: Document Details, Key Highlights, Why It Matters, Main Points, Pro Tips, Key Terms to Know, Bottom Line.",
      items: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING },
          bullets: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            minItems: 2,
            maxItems: 6,
          },
        },
        required: ["heading", "bullets"],
      },
      minItems: 7,
      maxItems: 7,
    },
  },
  required: ["title", "overview", "sections"],
};

interface UnknownSection {
  heading?: unknown;
  bullets?: unknown[];
}

interface UnknownSummary {
  title?: unknown;
  overview?: unknown[];
  sections?: unknown;
}

/**
 * Same normalization pass as openrouter-ai.ts: cleans out empty
 * strings, pads/truncates bullets to 2-6, and forces exactly 7
 * sections — a safety net in case a model's output technically
 * parses as JSON but drifts from the schema in some small way.
 */
function sanitizeSummaryData(data: unknown): unknown {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  const summary = data as UnknownSummary;
  let rawSections: unknown[] = [];

  if (Array.isArray(summary.sections)) {
    rawSections = summary.sections;
  } else if (typeof summary.sections === "object" && summary.sections !== null) {
    rawSections = Object.values(summary.sections as Record<string, unknown>);
  }

  const sanitizedSections: UnknownSection[] = rawSections.map((item) => {
    if (typeof item === "object" && item !== null) {
      const section = item as UnknownSection;
      let bullets: string[] = [];

      if (Array.isArray(section.bullets)) {
        bullets = section.bullets
          .filter((b): b is string => typeof b === "string" && b.trim().length > 0)
          .map((b) => b.trim());
      }

      if (bullets.length > 6) {
        bullets = bullets.slice(0, 6);
      }

      while (bullets.length < 2) {
        bullets.push("📌 No additional details provided.");
      }

      return {
        heading:
          typeof section.heading === "string" && section.heading.trim().length > 0
            ? section.heading.trim()
            : "Key Details",
        bullets,
      };
    }

    return {
      heading: "Key Details",
      bullets: ["📌 Information unavailable.", "📌 Refer to document text."],
    };
  });

  while (sanitizedSections.length < 7) {
    const missingIndex = sanitizedSections.length;
    const fallbackHeading = REQUIRED_HEADINGS[missingIndex] || `Section ${missingIndex + 1}`;
    sanitizedSections.push({
      heading: fallbackHeading,
      bullets: ["📌 Information unavailable.", "📌 Refer to main document."],
    });
  }

  if (sanitizedSections.length > 7) {
    sanitizedSections.splice(7);
  }

  let overview: string[] = [];
  if (Array.isArray(summary.overview)) {
    overview = summary.overview
      .filter((b): b is string => typeof b === "string" && b.trim().length > 0)
      .map((b) => b.trim());
  }

  if (overview.length === 0) {
    overview = ["📄 Overview summary unavailable."];
  } else if (overview.length > 2) {
    overview = overview.slice(0, 2);
  }

  return {
    ...summary,
    title:
      typeof summary.title === "string" && summary.title.trim().length > 0
        ? summary.title.trim()
        : "Document Summary",
    overview,
    sections: sanitizedSections,
  };
}

async function callWithRetry(
  prompt: string,
  modelName: string,
  retries = 2,
): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: GEMINI_SUMMARY_SCHEMA,
        },
      });

      if (!response.text) {
        throw new Error(`Empty response received from model ${modelName}`);
      }

      return response.text;
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      const is503 = err?.status === 503 || err?.message?.includes("high demand");

      if (is503 && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Failed to execute request with model ${modelName} after retries.`);
}

export const generateSummaryFromGemini = async (
  pdfText: string,
): Promise<GeneratedSummary> => {
  const truncatedText = pdfText.slice(0, 800000);
  const prompt = `${SUMMARY_SYSTEM_PROMPT}

CRITICAL OUTPUT FORMAT:
- Output MUST be valid JSON matching the schema.
- "sections" MUST be a JSON array containing EXACTLY 7 objects.
- Each section MUST contain between 2 and 6 non-empty bullet points. Do not include empty strings.

Summarize this document as structured JSON matching the required schema:

${truncatedText}`;

  let lastError: unknown;

  for (const model of MODEL_PRIORITY) {
    try {
      const rawText = await callWithRetry(prompt, model);

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(rawText);
      } catch (parseError) {
        console.warn(`Model ${model} returned invalid JSON. Trying fallback...`);
        lastError = parseError;
        continue;
      }

      const sanitizedJson = sanitizeSummaryData(parsedJson);

      const validated = summarySchema.safeParse(sanitizedJson);
      if (!validated.success) {
        console.warn(
          `Model ${model} returned JSON that didn't match the schema even after sanitizing:`,
          validated.error.issues,
        );
        lastError = validated.error;
        continue;
      }

      return validated.data;
    } catch (error: unknown) {
      lastError = error;
      const err = error as { status?: number };
      console.warn(`Model ${model} failed with status ${err?.status}. Trying fallback...`);
    }
  }

  throw lastError || new Error("All Gemini models failed to generate a summary.");
};