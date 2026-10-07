import { GoogleGenAI, Type } from "@google/genai";
import { SUMMARY_SYSTEM_PROMPT } from "./prompts";
import { summarySchema, type GeneratedSummary } from "./summarySchema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL_PRIORITY = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
];

// mirrors summarySchema.ts — this is what actually constrains Gemini's
// output shape at generation time (the zod schema in summary-schema.ts
// is the runtime double-check afterward)
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
    },
    sections: {
      type: Type.ARRAY,
      description:
        "Exactly 7 sections, in this order: Document Details, Key Highlights, Why It Matters, Main Points, Pro Tips, Key Terms to Know, Bottom Line.",
      items: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING },
          bullets: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["heading", "bullets"],
      },
    },
  },
  required: ["title", "overview", "sections"],
};

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
  const prompt = `${SUMMARY_SYSTEM_PROMPT}\n\nSummarize this document as structured JSON matching the required schema:\n\n${truncatedText}`;

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

      const validated = summarySchema.safeParse(parsedJson);
      if (!validated.success) {
        console.warn(
          `Model ${model} returned JSON that didn't match the schema:`,
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