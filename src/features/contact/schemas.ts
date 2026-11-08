import { z } from "zod";

export const contactSubmissionSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(160),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(200),
  phone: z.string().trim().max(60).optional().or(z.literal("")),
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters.")
    .max(200),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(3000),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;

