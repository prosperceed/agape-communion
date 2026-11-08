import { z } from "zod";

export const devotionalInputSchema = z.object({
  title: z.string().trim().min(3, "Devotional title is required.").max(240),
  slug: z.string().trim().max(260).optional(),
  scriptureReference: z
    .string()
    .trim()
    .min(2, "Scripture reference is required.")
    .max(180),
  biblePassage: z
    .string()
    .trim()
    .min(10, "Bible passage text is required."),
  content: z
    .string()
    .trim()
    .min(20, "Main devotional content is required."),
  reflectionPrompt: z
    .string()
    .trim()
    .min(10, "Reflection or prayer is required."),
  coverImage: z.string().trim().min(1, "Cover image is required."),
  authorName: z.string().trim().min(2, "Author name is required.").max(150),
  publishedAt: z.string().min(1, "Publication date is required."),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

export type DevotionalInput = z.infer<typeof devotionalInputSchema>;

