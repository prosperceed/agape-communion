import { getDb, settings } from "@/lib/db";
import { CACHE_TAGS, CACHE_TTL, withExplicitCache } from "@/lib/cache";
import { siteConfig } from "@/config/site";
import type { CoreBeliefItem, LeadershipMember } from "@/types";

export interface ChurchSettingsData {
  id: string;
  churchName: string;
  tagline: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  vision: string;
  mission: string;
  aboutIntro: string;
  aboutBackground: string;
  coreBeliefs: CoreBeliefItem[];
  leadership: LeadershipMember[];
  serviceSummary: string;
  mapLink: string;
  youtubeUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  livestreamDefaultSchedule: string;
}

async function fetchChurchSettingsUncached(): Promise<ChurchSettingsData> {
  const db = await getDb();
  const [row] = await db.select().from(settings).limit(1);

  if (!row) {
    return {
      id: "default",
      churchName: siteConfig.name,
      tagline: "Church Love, Faith Love",
      logoUrl: siteConfig.logo,
      address: siteConfig.defaultAddress,
      phone: siteConfig.defaultPhone,
      email: siteConfig.defaultEmail,
      vision:
        "To raise a Christ-centered community across Nigeria and beyond who walk in the fullness of God's love.",
      mission:
        "We gather in reverent worship, equip believers through faithful teaching of the Word, and serve our communities.",
      aboutIntro: siteConfig.description,
      aboutBackground: siteConfig.description,
      coreBeliefs: [],
      leadership: [],
      serviceSummary: "Every Sunday at 9:00 AM & 11:00 AM",
      mapLink: "https://maps.google.com",
      youtubeUrl: siteConfig.socialLinks.youtube,
      facebookUrl: siteConfig.socialLinks.facebook,
      instagramUrl: siteConfig.socialLinks.instagram,
      livestreamDefaultSchedule: "Every Sunday at 9:00 am & 11:00 am",
    };
  }

  let coreBeliefs: CoreBeliefItem[] = [];
  let leadership: LeadershipMember[] = [];

  try {
    coreBeliefs = JSON.parse(row.coreBeliefsJson) as CoreBeliefItem[];
  } catch {
    coreBeliefs = [];
  }

  try {
    leadership = JSON.parse(row.leadershipJson) as LeadershipMember[];
  } catch {
    leadership = [];
  }

  return {
    id: row.id,
    churchName: row.churchName,
    tagline: row.tagline,
    logoUrl: row.logoUrl,
    address: row.address,
    phone: row.phone,
    email: row.email,
    vision: row.vision,
    mission: row.mission,
    aboutIntro: row.aboutIntro,
    aboutBackground: row.aboutBackground,
    coreBeliefs,
    leadership,
    serviceSummary: row.serviceSummary,
    mapLink: row.mapLink,
    youtubeUrl: row.youtubeUrl || "",
    facebookUrl: row.facebookUrl || "",
    instagramUrl: row.instagramUrl || "",
    livestreamDefaultSchedule: row.livestreamDefaultSchedule,
  };
}

export const getPublicChurchSettings = withExplicitCache(
  fetchChurchSettingsUncached,
  ["public-church-settings"],
  {
    tags: [CACHE_TAGS.SETTINGS],
    revalidate: CACHE_TTL.CHURCH_SETTINGS,
  }
);

export async function getAdminChurchSettings(): Promise<ChurchSettingsData> {
  return fetchChurchSettingsUncached();
}
