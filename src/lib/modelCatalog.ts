export type Provider = "gemini" | "openrouter";

// Order matters: index 0 is tried first, the rest are fallbacks in order.
// The UI reads this same list to render the toggle and the fallback order.
export const MODEL_CATALOG: Record<Provider, { label: string; models: string[] }> = {
  gemini: {
    label: "Gemini",
    models: [
      "gemini-3.8-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash",
    ],
  },
  openrouter: {
    label: "OpenRouter",
    models: [
      "nvidia/nemotron-3-ultra-550b-a55b:free",
      "google/gemini-flash-1.5:free",
      "openrouter/free",
    ],
  },
};

export const PROVIDERS = Object.keys(MODEL_CATALOG) as Provider[];

// How many characters of a PDF go into one summary request. Anything beyond
// this is left out, and the upload page warns the user when that happens.
// (400k characters is roughly 170 pages of dense text.)
export const SUMMARY_CHAR_LIMITS: Record<Provider, number> = {
  gemini: 600_000,
  openrouter: 2400_000, // unchanged from before; raise once you've checked those models' context windows
};