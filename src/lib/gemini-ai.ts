import { GoogleGenAI } from "@google/genai";
import { SUMMARY_SYSTEM_PROMPT } from "./prompts";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateSummaryFromGemini = async (pdfText: string) => {
  try {
    const prompt = `${SUMMARY_SYSTEM_PROMPT}\n\nTransform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting:\n\n${pdfText}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    
    if (err?.status === 429) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    }
    
    console.error("Gemini API Error:", error);
    throw error;
  }
};
//Gemini API Key-pdf-summarizer

// Note: If you ever run into 429 RATE_LIMIT_EXCEEDED errors on the free tier, temporarily switching your model string to gemini-2.5-flash-lite will double your daily request limit.