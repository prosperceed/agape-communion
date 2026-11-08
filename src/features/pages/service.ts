import { eq } from "drizzle-orm";
import { getDb, settings } from "@/lib/db";
import { logAdminActivity, requireAdminPermission } from "@/lib/auth";
import { CACHE_TAGS, invalidateContentCache } from "@/lib/cache";
import { churchSettingsSchema, type ChurchSettingsInput } from "./schemas";

export async function updateChurchSettings(rawInput: ChurchSettingsInput) {
  const actor = await requireAdminPermission("MANAGE_SETTINGS");
  const parsed = churchSettingsSchema.parse(rawInput);

  const db = await getDb();
  const [existing] = await db
    .select({ id: settings.id })
    .from(settings)
    .limit(1);

  const payload = {
    churchName: parsed.churchName,
    tagline: parsed.tagline,
    logoUrl: parsed.logoUrl,
    address: parsed.address,
    phone: parsed.phone,
    email: parsed.email,
    vision: parsed.vision,
    mission: parsed.mission,
    aboutIntro: parsed.aboutIntro,
    aboutBackground: parsed.aboutBackground,
    coreBeliefsJson: JSON.stringify(parsed.coreBeliefs),
    leadershipJson: JSON.stringify(parsed.leadership),
    serviceSummary: parsed.serviceSummary,
    mapLink: parsed.mapLink,
    youtubeUrl: parsed.youtubeUrl || null,
    facebookUrl: parsed.facebookUrl || null,
    instagramUrl: parsed.instagramUrl || null,
    livestreamDefaultSchedule: parsed.livestreamDefaultSchedule,
    updatedById: actor.id,
    updatedAt: new Date(),
  };

  let recordId: string;
  if (existing) {
    await db
      .update(settings)
      .set(payload)
      .where(eq(settings.id, existing.id));
    recordId = existing.id;
  } else {
    const [inserted] = await db
      .insert(settings)
      .values(payload)
      .returning({ id: settings.id });
    recordId = inserted.id;
  }

  await logAdminActivity({
    actor,
    action: "UPDATE_CHURCH_SETTINGS",
    entityType: "SETTINGS",
    entityId: recordId,
    summary: `Updated church information and website settings (${parsed.churchName}).`,
  });

  invalidateContentCache(
    [CACHE_TAGS.SETTINGS],
    ["/", "/about", "/contact", "/services", "/admin/settings"]
  );

  return { id: recordId };
}
