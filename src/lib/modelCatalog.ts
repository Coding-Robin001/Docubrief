export type Provider = "gemini" | "openrouter";

// Order matters: index 0 is tried first, the rest are fallbacks in order.
// The UI reads this same list to render the toggle and the fallback order.
export const MODEL_CATALOG: Record<
  Provider,
  { label: string; models: string[] }
> = {
  gemini: {
    label: "Gemini",
    models: ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-flash-latest"],
  },
  openrouter: {
    label: "OpenRouter",
    models: [
      "nvidia/nemotron-3-ultra-550b-a55b:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "google/gemini-2.0-flash-exp:free",
    ],
  },
};

export const PROVIDERS = Object.keys(MODEL_CATALOG) as Provider[];
