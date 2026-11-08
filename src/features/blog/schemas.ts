import { z } from "zod";

export const blogPostInputSchema = z.object({
  title: z.string().trim().min(3, "Article title is required.").max(240),
  slug: z.string().trim().max(260).optional(),
  excerpt: z
    .string()
    .trim()
    .min(10, "Excerpt must be at least 10 characters.")
    .max(500),
  content: z
    .string()
    .trim()
    .min(20, "Article content must be at least 20 characters."),
  coverImage: z.string().trim().min(1, "Cover image is required."),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  authorName: z.string().trim().min(2, "Author name is required.").max(150),
  tagNames: z.array(z.string().trim().min(1).max(60)).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  seoTitle: z.string().trim().max(255).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(500).optional().or(z.literal("")),
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2, "Category name is required.").max(120),
  scope: z.enum(["BLOG", "MESSAGE"]).default("BLOG"),
  description: z.string().trim().max(400).optional().or(z.literal("")),
});

export type BlogPostInput = z.infer<typeof blogPostInputSchema>;
export type CategoryInput = z.infer<typeof categoryInputSchema>;

