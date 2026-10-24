import { GoogleGenAI, Type } from "@google/genai";
import { SUMMARY_SYSTEM_PROMPT } from "./prompts";
import { summarySchema } from "./summarySchema";
import { sanitizeSummaryData } from "./sanitizeSummary";
import { MODEL_CATALOG, SUMMARY_CHAR_LIMITS } from "./modelCatalog";
import {
  describeError,
  type EmitEvent,
  type GenerationResult,
  type ModelAttempt,
} from "./modelLog";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL_PRIORITY = MODEL_CATALOG.gemini.models;

// How many times to retry the SAME model after a 503 "high demand" before
// moving to the next one. Spikes usually outlast a 2-4s wait, so with three
// fallbacks it's faster to fail over immediately. Raise it if you'd rather
// wait for the preferred model.
const RETRIES_PER_MODEL = 0;

// mirrors summarySchema.ts: constrains Gemini's output at generation time,
// and the zod schema double-checks it afterward
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

async function callWithRetry(
  prompt: string,
  modelName: string,
  emit?: EmitEvent,
  retries = RETRIES_PER_MODEL,
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
        const waitMs = 2000 * (attempt + 1);
        emit?.({
          type: "model_retry",
          provider: "gemini",
          model: modelName,
          reason: describeError(error),
          waitMs,
        });
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Failed to execute request with model ${modelName} after retries.`);
}

export const generateSummaryFromGemini = async (
  pdfText: string,
  emit?: EmitEvent,
): Promise<GenerationResult> => {
  const truncatedText = pdfText.slice(0, SUMMARY_CHAR_LIMITS.gemini);
  const prompt = `${SUMMARY_SYSTEM_PROMPT}

CRITICAL OUTPUT FORMAT:
- Output MUST be valid JSON matching the schema.
- "sections" MUST be a JSON array containing EXACTLY 7 objects.
- Each section MUST contain between 2 and 6 non-empty bullet points. Do not include empty strings.

Summarize this document as structured JSON matching the required schema:

${truncatedText}`;

  const attempts: ModelAttempt[] = [];
  let lastError: unknown;

  const recordFailure = (model: string, reason: string) => {
    attempts.push({
      provider: "gemini",
      model,
      status: "failed",
      reason,
      timestamp: new Date().toISOString(),
    });
    emit?.({ type: "model_failed", provider: "gemini", model, reason });
  };

  for (let i = 0; i < MODEL_PRIORITY.length; i++) {
    const model = MODEL_PRIORITY[i];

    emit?.({
      type: "model_start",
      provider: "gemini",
      model,
      position: i + 1,
      total: MODEL_PRIORITY.length,
    });

    try {
      const rawText = await callWithRetry(prompt, model, emit);

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(rawText);
      } catch (parseError) {
        lastError = parseError;
        recordFailure(model, "Returned invalid JSON");
        continue;
      }

      const validated = summarySchema.safeParse(sanitizeSummaryData(parsedJson));
      if (!validated.success) {
        console.warn(`Model ${model} failed schema validation:`, validated.error.issues);
        lastError = validated.error;
        recordFailure(model, "Response didn't match the summary schema");
        continue;
      }

      attempts.push({
        provider: "gemini",
        model,
        status: "success",
        timestamp: new Date().toISOString(),
      });
      emit?.({ type: "model_success", provider: "gemini", model });

      return {
        summary: validated.data,
        modelUsed: model,
        provider: "gemini",
        attempts,
      };
    } catch (error: unknown) {
      lastError = error;
      console.warn(`Model ${model} failed:`, describeError(error));
      recordFailure(model, describeError(error));
    }
  }

  throw lastError || new Error("All Gemini models failed to generate a summary.");
};