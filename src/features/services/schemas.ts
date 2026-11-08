import { z } from "zod";

export const serviceScheduleItemSchema = z.object({
  dayOfWeek: z.enum([
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ]),
  startTime: z.string().trim().min(2, "Start time is required.").max(30),
  endTime: z.string().trim().min(2, "End time is required.").max(30),
  frequency: z
    .enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "ONE_TIME"])
    .default("WEEKLY"),
  notes: z.string().trim().max(255).optional().or(z.literal("")),
});

export const serviceInputSchema = z
  .object({
    title: z.string().trim().min(2, "Programme title is required.").max(200),
    slug: z.string().trim().max(220).optional(),
    description: z
      .string()
      .trim()
      .min(10, "Brief explanation must be at least 10 characters."),
    location: z.string().trim().max(255).optional().or(z.literal("")),
    imageUrl: z.string().trim().optional().or(z.literal("")),
    isRecurring: z.boolean().default(true),
    eventDate: z.string().optional().or(z.literal("")),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
    displayOrder: z.coerce.number().int().min(0).default(0),
    schedules: z.array(serviceScheduleItemSchema).default([]),
  })
  .refine(
    (data) => {
      if (data.isRecurring) {
        return data.schedules.length > 0;
      }
      return Boolean(data.eventDate && data.eventDate.trim().length > 0);
    },
    {
      message:
        "Recurring programmes require at least one schedule; dated programmes require an event date.",
      path: ["schedules"],
    }
  );

export type ServiceInput = z.infer<typeof serviceInputSchema>;
export type ServiceScheduleItemInput = z.infer<typeof serviceScheduleItemSchema>;
