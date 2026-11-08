import { z } from "zod";

export const coreBeliefSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(600),
  scripture: z.string().trim().min(2).max(120),
});

export const leadershipMemberSchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(140),
  bio: z.string().trim().min(10).max(800),
  imageUrl: z.string().trim().min(1),
});

export const churchSettingsSchema = z.object({
  churchName: z.string().trim().min(2, "Church name is required.").max(200),
  tagline: z.string().trim().min(2, "Tagline is required.").max(255),
  logoUrl: z.string().trim().min(1, "Logo URL is required."),
  address: z.string().trim().min(5, "Address is required."),
  phone: z.string().trim().min(5, "Phone number is required.").max(80),
  email: z.string().trim().email("Valid email is required.").max(160),
  vision: z.string().trim().min(10, "Vision statement is required."),
  mission: z.string().trim().min(10, "Mission statement is required."),
  aboutIntro: z.string().trim().min(10, "About introduction is required."),
  aboutBackground: z.string().trim().min(10, "Church background is required."),
  coreBeliefs: z.array(coreBeliefSchema).min(1),
  leadership: z.array(leadershipMemberSchema).min(1),
  serviceSummary: z.string().trim().min(5, "Service summary is required."),
  mapLink: z.string().trim().url("Valid map link URL is required."),
  youtubeUrl: z.string().trim().url().optional().or(z.literal("")),
  facebookUrl: z.string().trim().url().optional().or(z.literal("")),
  instagramUrl: z.string().trim().url().optional().or(z.literal("")),
  livestreamDefaultSchedule: z
    .string()
    .trim()
    .min(3, "Livestream schedule text is required.")
    .max(255),
});

export type ChurchSettingsInput = z.infer<typeof churchSettingsSchema>;
