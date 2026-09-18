import { GoogleGenAI } from "@google/genai";
import { SUMMARY_SYSTEM_PROMPT } from "./prompts";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL_PRIORITY = [
  // "gemini-flash-latest",
  "gemini-3.8-flash",
  // "gemini-2.5-flash",
  "gemini-3.6-flash",
];

async function callWithRetry(prompt: string, modelName: string, retries = 2): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
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

export const generateSummaryFromGemini = async (pdfText: string): Promise<string> => {
  const truncatedText = pdfText.slice(0, 800000);
  const prompt = `${SUMMARY_SYSTEM_PROMPT}\n\nTransform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting:\n\n${truncatedText}`;

  let lastError: unknown;

  for (const model of MODEL_PRIORITY) {
    try {
      const result = await callWithRetry(prompt, model);
      return result;
    } catch (error: unknown) {
      lastError = error;
      const err = error as { status?: number };
      console.warn(`Model ${model} failed with status ${err?.status}. Trying fallback...`);
    }
  }

  throw lastError || new Error("All Gemini models failed to generate a summary.");
};
