import { eq } from "drizzle-orm";
import { getDb, contactSubmissions } from "@/lib/db";
import { requireAdminPermission } from "@/lib/auth";
import {
  contactSubmissionSchema,
  type ContactSubmissionInput,
} from "./schemas";

export async function submitContactInquiry(rawInput: ContactSubmissionInput) {
  const parsed = contactSubmissionSchema.parse(rawInput);
  const db = await getDb();

  const [created] = await db
    .insert(contactSubmissions)
    .values({
      fullName: parsed.fullName,
      email: parsed.email.toLowerCase(),
      phone: parsed.phone || null,
      subject: parsed.subject,
      message: parsed.message,
      isRead: false,
    })
    .returning();

  return created;
}

export async function markContactSubmissionRead(id: string) {
  await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();

  const [updated] = await db
    .update(contactSubmissions)
    .set({ isRead: true })
    .where(eq(contactSubmissions.id, id))
    .returning();

  return updated;
}

