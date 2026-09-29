import OpenAI from "openai";
import { SUMMARY_SYSTEM_PROMPT } from "./prompts";

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "PDF Summarizer App",
  },
});

export const generateSummaryFromOpenRouter = async (
  pdfText: string,
  model = "stealth/space-bunny-alpha"
): Promise<string> => {
  const truncatedText = pdfText.slice(0, 200000);

  try {
    const response = await openrouter.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: SUMMARY_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Transform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting:\n\n${truncatedText}`,
        },
      ],
    });

    // Inspect response structure safely
    if (!response || !response.choices || response.choices.length === 0) {
      console.error("OpenRouter Raw API Error Response:", JSON.stringify(response, null, 2));
      throw new Error(`OpenRouter failed to return choices for model: ${model}`);
    }

    const summary = response.choices[0]?.message?.content;

    if (!summary) {
      throw new Error("Empty summary content returned from OpenRouter.");
    }

    return summary;
  } catch (error: unknown) {
    console.error("OpenRouter Execution Error:", error);
    throw error;
  }
};