import { z } from "zod";

export const categories = ["Ecommerce", "Social / UGC", "News / Media", "Other"] as const;

export const ClassificationSchema = z.object({
  category: z.enum(categories),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

export type Classification = z.infer<typeof ClassificationSchema>;

export type ClassifyResult = Classification & { cached: boolean };

export type ClassifyError = { error: string };
