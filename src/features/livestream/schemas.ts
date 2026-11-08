import { z } from "zod";
import { validateAndBuildLivestreamEmbed } from "@/lib/utils";

export const livestreamInputSchema = z
  .object({
    title: z.string().trim().min(3, "Livestream title is required.").max(240),
    slug: z.string().trim().max(260).optional(),
    description: z
      .string()
      .trim()
      .min(10, "Livestream description must be at least 10 characters."),
    platform: z.enum(["YOUTUBE", "FACEBOOK"]).default("YOUTUBE"),
    streamUrl: z.string().trim().url("Please enter a valid stream URL."),
    thumbnailUrl: z.string().trim().min(1, "Thumbnail image is required."),
    status: z.enum(["SCHEDULED", "LIVE", "ENDED"]).default("SCHEDULED"),
    scheduledFor: z.string().min(1, "Scheduled date and time are required."),
  })
  .superRefine((data, ctx) => {
    const validation = validateAndBuildLivestreamEmbed(
      data.platform,
      data.streamUrl
    );
    if (!validation.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["streamUrl"],
        message:
          validation.error ||
          "Unsupported livestream URL. Only YouTube Live and Facebook Live HTTPS links are accepted.",
      });
    }
  });

export type LivestreamInput = z.infer<typeof livestreamInputSchema>;

