import { z } from "zod";

export const eventInputSchema = z
  .object({
    title: z.string().trim().min(3, "Event title is required.").max(220),
    slug: z.string().trim().max(240).optional(),
    excerpt: z
      .string()
      .trim()
      .min(10, "Short summary must be at least 10 characters.")
      .max(500),
    description: z
      .string()
      .trim()
      .min(15, "Event description must be at least 15 characters."),
    coverImage: z.string().trim().min(1, "Cover image is required."),
    startDate: z.string().min(1, "Start date and time are required."),
    endDate: z.string().optional().or(z.literal("")),
    venue: z.string().trim().min(3, "Venue is required.").max(255),
    registrationUrl: z
      .string()
      .trim()
      .url("Registration link must be a valid URL.")
      .optional()
      .or(z.literal("")),
    isFeatured: z.boolean().default(false),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  })
  .refine(
    (data) => {
      if (!data.endDate) return true;
      return new Date(data.endDate).getTime() >= new Date(data.startDate).getTime();
    },
    {
      message: "End date must be on or after the start date.",
      path: ["endDate"],
    }
  );

export type EventInput = z.infer<typeof eventInputSchema>;

