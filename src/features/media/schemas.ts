import { z } from "zod";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
} from "@/lib/storage";

export const requestSignedUploadSchema = z.object({
  filename: z.string().trim().min(1, "Filename is required.").max(255),
  mimeType: z.enum(ALLOWED_IMAGE_MIME_TYPES, {
    message: "Unsupported image format. Allowed: JPEG, PNG, WebP, SVG.",
  }),
  sizeBytes: z
    .number()
    .int()
    .positive("File cannot be empty.")
    .max(MAX_UPLOAD_SIZE_BYTES, "File exceeds 5MB maximum limit."),
  folder: z
    .enum([
      "general",
      "branding",
      "hero",
      "church",
      "leadership",
      "services",
      "events",
      "testimonies",
      "messages",
      "blog",
    ])
    .default("general"),
  altText: z.string().trim().min(2, "Descriptive alt text is required.").max(255),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export type RequestSignedUploadInput = z.infer<typeof requestSignedUploadSchema>;

