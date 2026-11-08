import { desc, eq } from "drizzle-orm";
import { getDb, media } from "@/lib/db";
import { requireAdminPermission } from "@/lib/auth";

export async function listMediaLibrary(folder?: string) {
  await requireAdminPermission("MANAGE_MEDIA");
  const db = await getDb();

  if (folder && folder !== "all") {
    return db
      .select()
      .from(media)
      .where(eq(media.folder, folder))
      .orderBy(desc(media.createdAt));
  }

  return db.select().from(media).orderBy(desc(media.createdAt));
}

