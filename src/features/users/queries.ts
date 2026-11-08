import { desc, eq, sql } from "drizzle-orm";
import {
  getDb,
  users,
  adminActivityLogs,
  posts,
  events,
  devotionals,
  messages,
  testimonies,
  livestreams,
  services,
} from "@/lib/db";
import { requireAdminPermission } from "@/lib/auth";

export async function listAdministrators() {
  await requireAdminPermission("MANAGE_ADMINS");
  const db = await getDb();

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      invitationToken: users.invitationToken,
      invitationExpiresAt: users.invitationExpiresAt,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
}

export async function getInvitationByToken(token: string) {
  if (!token || token.trim().length < 16) {
    return null;
  }
  const db = await getDb();
  const [invitedUser] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      invitationExpiresAt: users.invitationExpiresAt,
    })
    .from(users)
    .where(eq(users.invitationToken, token.trim()))
    .limit(1);

  if (!invitedUser || invitedUser.status !== "INVITED") {
    return null;
  }

  const isExpired = Boolean(
    invitedUser.invitationExpiresAt &&
      new Date(invitedUser.invitationExpiresAt).getTime() < Date.now()
  );

  return {
    ...invitedUser,
    isExpired,
  };
}

export async function listAdminActivityLogs(limit = 50) {
  await requireAdminPermission("VIEW_ACTIVITY_LOGS");
  const db = await getDb();

  return db
    .select({
      id: adminActivityLogs.id,
      actorId: adminActivityLogs.actorId,
      actorName: adminActivityLogs.actorName,
      actorRole: adminActivityLogs.actorRole,
      action: adminActivityLogs.action,
      entityType: adminActivityLogs.entityType,
      entityId: adminActivityLogs.entityId,
      summary: adminActivityLogs.summary,
      createdAt: adminActivityLogs.createdAt,
    })
    .from(adminActivityLogs)
    .orderBy(desc(adminActivityLogs.createdAt), desc(adminActivityLogs.id))
    .limit(limit);
}

export async function getDashboardOverviewStats() {
  await requireAdminPermission("MANAGE_CONTENT");
  const db = await getDb();
  const nowIso = new Date().toISOString();

  const [
    postsCountRes,
    eventsCountRes,
    upcomingEventsCountRes,
    devotionalsCountRes,
    messagesCountRes,
    pendingTestimoniesRes,
    servicesCountRes,
    activeStreamRes,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(posts)
      .where(eq(posts.status, "PUBLISHED")),
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(events)
      .where(eq(events.status, "PUBLISHED")),
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(events)
      .where(
        sql`${events.status} = 'PUBLISHED' AND ${events.startDate} >= ${nowIso}`
      ),
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(devotionals)
      .where(eq(devotionals.status, "PUBLISHED")),
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(messages)
      .where(eq(messages.status, "PUBLISHED")),
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(testimonies)
      .where(eq(testimonies.status, "PENDING")),
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(services)
      .where(eq(services.status, "PUBLISHED")),
    db
      .select({
        id: livestreams.id,
        title: livestreams.title,
        status: livestreams.status,
        platform: livestreams.platform,
        scheduledFor: livestreams.scheduledFor,
      })
      .from(livestreams)
      .orderBy(
        sql`CASE WHEN ${livestreams.status} = 'LIVE' THEN 0 WHEN ${livestreams.status} = 'SCHEDULED' THEN 1 ELSE 2 END`,
        desc(livestreams.scheduledFor)
      )
      .limit(1),
  ]);

  return {
    publishedPosts: postsCountRes[0]?.count ?? 0,
    totalPublishedEvents: eventsCountRes[0]?.count ?? 0,
    upcomingEvents: upcomingEventsCountRes[0]?.count ?? 0,
    publishedDevotionals: devotionalsCountRes[0]?.count ?? 0,
    totalMessages: messagesCountRes[0]?.count ?? 0,
    pendingTestimonies: pendingTestimoniesRes[0]?.count ?? 0,
    publishedServices: servicesCountRes[0]?.count ?? 0,
    currentLivestream: activeStreamRes[0] ?? null,
  };
}
