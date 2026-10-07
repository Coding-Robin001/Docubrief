import { z } from "zod";

// 7 sections + 1 overview slide = 8 total, consistently, every time
export const summarySchema = z.object({
  title: z.string().min(1).max(120),
  overview: z.array(z.string().min(1)).min(1).max(2),
  sections: z
    .array(
      z.object({
        heading: z.string().min(1),
        bullets: z.array(z.string().min(1)).min(2).max(6),
      }),
    )
    .length(7),
});

export type GeneratedSummary = z.infer<typeof summarySchema>;