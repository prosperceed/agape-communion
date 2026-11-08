import { z } from "zod";

export const messageInputSchema = z
  .object({
    title: z.string().trim().min(3, "Message title is required.").max(240),
    slug: z.string().trim().max(260).optional(),
    speaker: z.string().trim().min(2, "Speaker name is required.").max(160),
    seriesName: z.string().trim().max(160).optional().or(z.literal("")),
    description: z
      .string()
      .trim()
      .min(10, "Message description must be at least 10 characters."),
    scriptureReferences: z
      .string()
      .trim()
      .min(2, "Scripture reference is required.")
      .max(255),
    datePreached: z.string().min(1, "Date preached is required."),
    thumbnailUrl: z.string().trim().min(1, "Thumbnail image is required."),
    videoUrl: z
      .string()
      .trim()
      .url("Video link must be a valid URL.")
      .optional()
      .or(z.literal("")),
    audioUrl: z
      .string()
      .trim()
      .url("Audio link must be a valid URL.")
      .optional()
      .or(z.literal("")),
    categoryId: z.string().uuid().optional().or(z.literal("")),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  })
  .refine(
    (data) => Boolean(data.videoUrl || data.audioUrl),
    {
      message: "At least one external video or audio link is required.",
      path: ["videoUrl"],
    }
  );

export type MessageInput = z.infer<typeof messageInputSchema>;

