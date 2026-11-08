import { desc } from "drizzle-orm";
import { getDb, contactSubmissions } from "@/lib/db";
import { requireAdminPermission } from "@/lib/auth";

export async function listContactSubmissions(limit = 50) {
  await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();

  return db
    .select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(limit);
}

