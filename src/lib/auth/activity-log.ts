import { getDb, adminActivityLogs } from "@/lib/db";
import type { AuthenticatedAdmin } from "@/types";

export async function logAdminActivity(params: {
  actor: AuthenticatedAdmin;
  action: string;
  entityType: string;
  entityId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  const db = await getDb();
  await db.insert(adminActivityLogs).values({
    actorId: params.actor.id,
    actorName: params.actor.name,
    actorRole: params.actor.role,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId ?? null,
    summary: params.summary,
    metadataJson: params.metadata ? JSON.stringify(params.metadata) : null,
  });
}
