import { generateSummaryFromGemini } from "./gemini-ai";
import { generateSummaryFromOpenRouter } from "./openRouter-ai";
import type { Provider } from "./modelCatalog";
import type { EmitEvent, GenerationResult } from "./modelLog";

export async function generateSummary(
  pdfText: string,
  provider: Provider,
  emit?: EmitEvent,
): Promise<GenerationResult> {
  return provider === "gemini"
    ? generateSummaryFromGemini(pdfText, emit)
    : generateSummaryFromOpenRouter(pdfText, emit);
}