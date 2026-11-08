import { z } from "zod";

export const testimonyAdminInputSchema = z
  .object({
    title: z.string().trim().min(3, "Testimony title is required.").max(220),
    slug: z.string().trim().max(240).optional(),
    personName: z.string().trim().min(2, "Person's name is required.").max(160),
    displayPersonName: z.boolean().default(true),
    hasMediaPermission: z.boolean().default(false),
    hasStoryPermission: z.boolean().default(false),
    roleOrRelation: z.string().trim().max(120).optional().or(z.literal("")),
    excerpt: z
      .string()
      .trim()
      .min(10, "Short excerpt must be at least 10 characters.")
      .max(400),
    fullTestimony: z
      .string()
      .trim()
      .min(20, "Full testimony must be at least 20 characters."),
    imageUrl: z.string().trim().min(1, "Testimony image is required."),
    isFeatured: z.boolean().default(false),
    status: z
      .enum(["PENDING", "APPROVED", "PUBLISHED", "ARCHIVED"])
      .default("PENDING"),
  })
  .refine(
    (data) => {
      if (data.status === "PUBLISHED") {
        return data.hasStoryPermission && data.hasMediaPermission;
      }
      return true;
    },
    {
      message:
        "Both story and photograph publication permissions must be confirmed before publishing a testimony.",
      path: ["hasStoryPermission"],
    }
  );

export const publicTestimonySubmissionSchema = z.object({
  title: z.string().trim().min(3, "Testimony title is required.").max(220),
  personName: z.string().trim().min(2, "Your name is required.").max(160),
  displayPersonName: z.boolean().default(true),
  hasMediaPermission: z.boolean().refine((v) => v === true, {
    message: "Please confirm permission to display an accompanying photograph.",
  }),
  hasStoryPermission: z.boolean().refine((v) => v === true, {
    message: "Please confirm permission to share your testimony.",
  }),
  roleOrRelation: z.string().trim().max(120).optional().or(z.literal("")),
  fullTestimony: z
    .string()
    .trim()
    .min(25, "Please share at least 25 characters about what God has done."),
});

export type TestimonyAdminInput = z.infer<typeof testimonyAdminInputSchema>;
export type PublicTestimonySubmissionInput = z.infer<
  typeof publicTestimonySubmissionSchema
>;

