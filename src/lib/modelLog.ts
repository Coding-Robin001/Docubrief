import type { GeneratedSummary } from "./summarySchema";
import type { Provider } from "./modelCatalog";

export type ModelAttempt = {
  provider: Provider;
  model: string;
  status: "success" | "failed";
  reason?: string;
  timestamp: string; // ISO
};

export type GenerationResult = {
  summary: GeneratedSummary;
  modelUsed: string;
  provider: Provider;
  attempts: ModelAttempt[];
};

// Events streamed from the server to the upload page, one JSON object per line
export type GenerationEvent =
  | { type: "extracting" }
  | { type: "model_start"; provider: Provider; model: string; position: number; total: number }
  | { type: "model_retry"; provider: Provider; model: string; reason: string; waitMs: number }
  | { type: "model_failed"; provider: Provider; model: string; reason: string }
  | { type: "model_success"; provider: Provider; model: string }
  | { type: "saving" }
  | { type: "complete"; summaryId: string; modelUsed: string; provider: Provider }
  | { type: "error"; message: string; code?: "LIMIT_REACHED" };

export type EmitEvent = (event: GenerationEvent) => void;

/** Turns whatever an SDK threw into a short, log-friendly string. */
export function describeError(error: unknown): string {
  const err = error as { status?: number; message?: string };
  const message = typeof err?.message === "string" ? err.message : "Unknown error";
  const short = message.length > 140 ? `${message.slice(0, 140)}…` : message;
  return err?.status ? `${err.status}: ${short}` : short;
}