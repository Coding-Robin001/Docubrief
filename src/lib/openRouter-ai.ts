import OpenAI from "openai";
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources/chat/completions";
import { SUMMARY_SYSTEM_PROMPT } from "./prompts";
import { summarySchema, type GeneratedSummary } from "./summarySchema";
import { sanitizeSummaryData } from "./sanitizeSummary";
import { MODEL_CATALOG, SUMMARY_CHAR_LIMITS } from "./modelCatalog";
import {
  describeError,
  type EmitEvent,
  type GenerationResult,
  type ModelAttempt,
} from "./modelLog";

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "PDF Summarizer App",
  },
});

const FREE_SUMMARY_MODELS = MODEL_CATALOG.openrouter.models;

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

/** One request to one specific model. Throws on any failure so the caller can fall back. */
async function callOpenRouterModel(
  model: string,
  truncatedText: string,
): Promise<GeneratedSummary> {
  const params: ChatCompletionCreateParamsNonStreaming = {
    model,
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
    console.error("OpenRouter raw error response:", JSON.stringify(response, null, 2));
    throw new Error(`No choices returned for model ${model}`);
  }

  const rawText = response.choices[0]?.message?.content;

  if (!rawText) {
    throw new Error("Empty summary content returned");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawText);
  } catch {
    throw new Error("Returned invalid JSON");
  }

  const validated = summarySchema.safeParse(sanitizeSummaryData(parsedJson));
  if (!validated.success) {
    console.warn(`Model ${model} failed schema validation:`, validated.error.issues);
    throw new Error("Response didn't match the summary schema");
  }

  return validated.data;
}

export const generateSummaryFromOpenRouter = async (
  pdfText: string,
  emit?: EmitEvent,
): Promise<GenerationResult> => {
  const truncatedText = pdfText.slice(0, SUMMARY_CHAR_LIMITS.openrouter);
  const attempts: ModelAttempt[] = [];
  let lastError: unknown;

  for (let i = 0; i < FREE_SUMMARY_MODELS.length; i++) {
    const model = FREE_SUMMARY_MODELS[i];

    emit?.({
      type: "model_start",
      provider: "openrouter",
      model,
      position: i + 1,
      total: FREE_SUMMARY_MODELS.length,
    });

    try {
      const summary = await callOpenRouterModel(model, truncatedText);

      attempts.push({
        provider: "openrouter",
        model,
        status: "success",
        timestamp: new Date().toISOString(),
      });
      emit?.({ type: "model_success", provider: "openrouter", model });

      return { summary, modelUsed: model, provider: "openrouter", attempts };
    } catch (error: unknown) {
      lastError = error;
      const reason = describeError(error);
      console.warn(`OpenRouter model ${model} failed:`, reason);

      attempts.push({
        provider: "openrouter",
        model,
        status: "failed",
        reason,
        timestamp: new Date().toISOString(),
      });
      emit?.({ type: "model_failed", provider: "openrouter", model, reason });
    }
  }

  throw lastError || new Error("All OpenRouter models failed to generate a summary.");
};