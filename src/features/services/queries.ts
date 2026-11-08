import { asc, desc, eq, inArray } from "drizzle-orm";
import { getDb, services, serviceSchedules } from "@/lib/db";
import { CACHE_TAGS, CACHE_TTL, withExplicitCache } from "@/lib/cache";
import { requireAdminPermission } from "@/lib/auth";

export interface ServiceWithSchedules {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string | null;
  imageUrl: string | null;
  isRecurring: boolean;
  eventDate: Date | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  displayOrder: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  schedules: Array<{
    id: string;
    dayOfWeek:
      | "SUNDAY"
      | "MONDAY"
      | "TUESDAY"
      | "WEDNESDAY"
      | "THURSDAY"
      | "FRIDAY"
      | "SATURDAY";
    startTime: string;
    endTime: string;
    frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "ONE_TIME";
    notes: string | null;
  }>;
}

async function attachSchedulesToServices(
  rows: Array<typeof services.$inferSelect>
): Promise<ServiceWithSchedules[]> {
  if (rows.length === 0) return [];
  const db = await getDb();
  const ids = rows.map((r) => r.id);

  const scheduleRows = await db
    .select()
    .from(serviceSchedules)
    .where(inArray(serviceSchedules.serviceId, ids));

  const mapByService = new Map<string, typeof scheduleRows>();
  for (const s of scheduleRows) {
    const list = mapByService.get(s.serviceId) ?? [];
    list.push(s);
    mapByService.set(s.serviceId, list);
  }

  return rows.map((row) => ({
    ...row,
    schedules: (mapByService.get(row.id) ?? []).map((s) => ({
      id: s.id,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      frequency: s.frequency,
      notes: s.notes,
    })),
  }));
}

async function fetchPublishedServicesUncached(): Promise<ServiceWithSchedules[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(services)
    .where(eq(services.status, "PUBLISHED"))
    .orderBy(asc(services.displayOrder), desc(services.createdAt));

  return attachSchedulesToServices(rows);
}

export const getPublishedServices = withExplicitCache(
  fetchPublishedServicesUncached,
  ["public-published-services"],
  {
    tags: [CACHE_TAGS.SERVICES],
    revalidate: CACHE_TTL.PUBLISHED_CONTENT,
  }
);

export async function listAdminServices(): Promise<ServiceWithSchedules[]> {
  await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();
  const rows = await db
    .select()
    .from(services)
    .orderBy(asc(services.displayOrder), desc(services.createdAt));

  return attachSchedulesToServices(rows);
}

export async function getAdminServiceById(
  id: string
): Promise<ServiceWithSchedules | null> {
  await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();
  const [row] = await db
    .select()
    .from(services)
    .where(eq(services.id, id))
    .limit(1);

  if (!row) return null;
  const [withSchedules] = await attachSchedulesToServices([row]);
  return withSchedules ?? null;
}
