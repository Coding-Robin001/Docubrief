import OpenAI from "openai";
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";
import { SUMMARY_SYSTEM_PROMPT } from "./prompts";
import { summarySchema, type GeneratedSummary } from "./summarySchema";

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "PDF Summarizer App",
  },
});

const FREE_SUMMARY_MODELS = [
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "google/gemini-flash-1.5:free",
  "openrouter/free",
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

const OPENROUTER_SUMMARY_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description:
        "A short, catchy title for the document. One leading emoji is fine. No markdown formatting.",
    },
    overview: {
      type: "array",
      description: "1 to 2 single-sentence bullets giving a quick overview.",
      items: { type: "string" },
      minItems: 1,
      maxItems: 2,
    },
    sections: {
      type: "array",
      description:
        "Array of exactly 7 objects in this order: Document Details, Key Highlights, Why It Matters, Main Points, Pro Tips, Key Terms to Know, Bottom Line.",
      items: {
        type: "object",
        properties: {
          heading: { type: "string" },
          bullets: {
            type: "array",
            items: { type: "string" },
            minItems: 2,
            maxItems: 6,
          },
        },
        required: ["heading", "bullets"],
        additionalProperties: false,
      },
      minItems: 7,
      maxItems: 7,
    },
  },
  required: ["title", "overview", "sections"],
  additionalProperties: false,
};

type OpenRouterCompletionParams = ChatCompletionCreateParamsNonStreaming & {
  models?: string[];
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
 * Normalizes section objects into a 7-element array, cleans out empty strings,
 * and enforces bullet limits (2-6 non-empty bullets).
 */
function sanitizeSummaryData(data: unknown): unknown {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  const summary = data as UnknownSummary;
  let rawSections: unknown[] = [];

  // Handle case where AI outputs sections as an object instead of an array
  if (Array.isArray(summary.sections)) {
    rawSections = summary.sections;
  } else if (typeof summary.sections === "object" && summary.sections !== null) {
    rawSections = Object.values(summary.sections as Record<string, unknown>);
  }

  // Sanitize each individual section's bullets
  const sanitizedSections: UnknownSection[] = rawSections.map((item) => {
    if (typeof item === "object" && item !== null) {
      const section = item as UnknownSection;
      let bullets: string[] = [];

      // Filter out non-strings, empty strings, or whitespace-only strings
      if (Array.isArray(section.bullets)) {
        bullets = section.bullets
          .filter((b): b is string => typeof b === "string" && b.trim().length > 0)
          .map((b) => b.trim());
      }

      // Truncate if more than 6 bullets
      if (bullets.length > 6) {
        bullets = bullets.slice(0, 6);
      }

      // Pad if fewer than 2 non-empty bullets
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

  // Ensure exactly 7 sections in the array
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

  // Clean overview array: remove non-strings, empty strings, and whitespace
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

export const generateSummaryFromOpenRouter = async (
  pdfText: string,
  model = FREE_SUMMARY_MODELS[0]
): Promise<GeneratedSummary> => {
  const truncatedText = pdfText.slice(0, 200000);

  try {
    const params: OpenRouterCompletionParams = {
      model: model,
      models: FREE_SUMMARY_MODELS,
      messages: [
        {
          role: "system",
          content: `${SUMMARY_SYSTEM_PROMPT}\n\nCRITICAL OUTPUT FORMAT:
- Output MUST be valid JSON matching the schema.
- "sections" MUST be a JSON array containing EXACTLY 7 objects.
- Each section MUST contain between 2 and 6 non-empty bullet points. Do not include empty strings.`,
        },
        {
          role: "user",
          content: `Summarize this document as structured JSON matching the required schema:\n\n${truncatedText}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "GeneratedSummary",
          strict: true,
          schema: OPENROUTER_SUMMARY_SCHEMA,
        },
      },
    };

    const response = await openrouter.chat.completions.create(params);

    if (!response || !response.choices || response.choices.length === 0) {
      console.error("OpenRouter Raw API Error Response:", JSON.stringify(response, null, 2));
      throw new Error(`OpenRouter failed to return choices for model: ${model}`);
    }

    const rawText = response.choices[0]?.message?.content;

    if (!rawText) {
      throw new Error("Empty summary content returned from OpenRouter.");
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawText);
    } catch (parseError: unknown) {
      console.error("OpenRouter returned invalid JSON raw text:", rawText, parseError);
      throw new Error("Failed to parse JSON response from OpenRouter.");
    }

    // Clean out empty strings and sanitize data structure
    const sanitizedJson = sanitizeSummaryData(parsedJson);

    // Validate with Zod
    const validated = summarySchema.safeParse(sanitizedJson);
    if (!validated.success) {
      console.error("OpenRouter JSON validation failed:", validated.error.issues);
      throw new Error("OpenRouter JSON response did not match summary schema.");
    }

    return validated.data;
  } catch (error: unknown) {
    console.error("OpenRouter Execution Error:", error);
    throw error;
  }
};

  // "poolside/laguna-s-2.1:free",
