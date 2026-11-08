import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import type { LivestreamPlatform } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\u2014\u2013]/g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function generateUniqueSlug(
  titleOrSlug: string,
  existsFn: (candidate: string) => Promise<boolean>
): Promise<string> {
  const base = slugify(titleOrSlug) || "item";
  let candidate = base;
  let counter = 2;

  while (await existsFn(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return candidate;
}

export function formatDate(
  value: Date | string | null | undefined,
  pattern = "MMMM d, yyyy"
): string {
  if (!value) return "";
  const dateObj = typeof value === "string" ? parseISO(value) : value;
  if (Number.isNaN(dateObj.getTime())) return "";
  return format(dateObj, pattern);
}

export function encodeCompositeCursor(timestamp: Date | string, id: string): string {
  const iso = typeof timestamp === "string" ? timestamp : timestamp.toISOString();
  return Buffer.from(`${iso}::${id}`, "utf8").toString("base64url");
}

export function decodeCompositeCursor(
  cursor?: string | null
): { timestamp: Date; id: string } | null {
  if (!cursor) return null;
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf8");
    const [iso, id] = decoded.split("::");
    if (!iso || !id) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return { timestamp: date, id };
  } catch {
    return null;
  }
}

export function validateAndBuildLivestreamEmbed(
  platform: LivestreamPlatform,
  rawUrl: string
): { isValid: boolean; embedUrl: string; error?: string } {
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== "https:") {
      return {
        isValid: false,
        embedUrl: "",
        error: "Livestream URL must use HTTPS.",
      };
    }

    const hostname = parsed.hostname.toLowerCase();

    if (platform === "YOUTUBE") {
      let videoId: string | null = null;

      if (hostname === "youtu.be") {
        videoId = parsed.pathname.slice(1).split("/")[0] || null;
      } else if (
        hostname === "www.youtube.com" ||
        hostname === "youtube.com" ||
        hostname === "m.youtube.com"
      ) {
        if (parsed.pathname === "/watch") {
          videoId = parsed.searchParams.get("v");
        } else if (parsed.pathname.startsWith("/live/")) {
          videoId = parsed.pathname.replace("/live/", "").split("/")[0] || null;
        } else if (parsed.pathname.startsWith("/embed/")) {
          videoId = parsed.pathname.replace("/embed/", "").split("/")[0] || null;
        }
      }

      if (!videoId || !/^[a-zA-Z0-9_-]{6,20}$/.test(videoId)) {
        return {
          isValid: false,
          embedUrl: "",
          error: "Invalid YouTube Live or video URL.",
        };
      }

      return {
        isValid: true,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
      };
    }

    if (platform === "FACEBOOK") {
      if (
        hostname !== "www.facebook.com" &&
        hostname !== "facebook.com" &&
        hostname !== "fb.watch"
      ) {
        return {
          isValid: false,
          embedUrl: "",
          error: "Invalid Facebook Live URL.",
        };
      }

      const encodedHref = encodeURIComponent(parsed.toString());
      return {
        isValid: true,
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodedHref}&show_text=false`,
      };
    }

    return {
      isValid: false,
      embedUrl: "",
      error: "Unsupported livestream platform.",
    };
  } catch {
    return {
      isValid: false,
      embedUrl: "",
      error: "Please enter a valid URL.",
    };
  }
}
