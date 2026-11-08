import { eq } from "drizzle-orm";
import {
  getDb,
  media,
  events,
  posts,
  services,
  messages,
  devotionals,
  testimonies,
  livestreams,
  settings,
} from "@/lib/db";
import { logAdminActivity, requireAdminPermission } from "@/lib/auth";
import { CACHE_TAGS, invalidateContentCache } from "@/lib/cache";
import {
  generateUniqueObjectKey,
  getStorageProvider,
  validateFileSignature,
  validateUploadMetadata,
} from "@/lib/storage";
import {
  requestSignedUploadSchema,
  type RequestSignedUploadInput,
} from "./schemas";

export async function createSignedMediaUpload(rawInput: RequestSignedUploadInput) {
  await requireAdminPermission("MANAGE_MEDIA");
  const parsed = requestSignedUploadSchema.parse(rawInput);

  const metaValidation = validateUploadMetadata({
    mimeType: parsed.mimeType,
    sizeBytes: parsed.sizeBytes,
    filename: parsed.filename,
  });

  if (!metaValidation.valid) {
    throw new Error(metaValidation.error);
  }

  const objectKey = generateUniqueObjectKey(parsed.folder, parsed.filename);
  const storage = getStorageProvider();

  return storage.createSignedUploadUrl({
    objectKey,
    mimeType: parsed.mimeType,
    sizeBytes: parsed.sizeBytes,
  });
}

export async function uploadAndRegisterMediaFile(params: {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  folder: string;
  altText: string;
  bytes: Uint8Array;
  width?: number;
  height?: number;
}) {
  const actor = await requireAdminPermission("MANAGE_MEDIA");

  const metaCheck = validateUploadMetadata({
    mimeType: params.mimeType,
    sizeBytes: params.sizeBytes,
    filename: params.filename,
  });

  if (!metaCheck.valid) {
    throw new Error(metaCheck.error);
  }

  const signatureCheck = validateFileSignature(params.bytes, params.mimeType);
  if (!signatureCheck.valid) {
    throw new Error(signatureCheck.error);
  }

  const parsed = requestSignedUploadSchema.parse({
    filename: params.filename,
    mimeType: params.mimeType,
    sizeBytes: params.sizeBytes,
    folder: params.folder,
    altText: params.altText,
    width: params.width,
    height: params.height,
  });

  const objectKey = generateUniqueObjectKey(parsed.folder, parsed.filename);
  const storage = getStorageProvider();

  const uploaded = await storage.uploadBuffer({
    objectKey,
    buffer: params.bytes,
    mimeType: parsed.mimeType,
  });

  const db = await getDb();
  const [record] = await db
    .insert(media)
    .values({
      filename: objectKey.split("/").pop() || parsed.filename,
      originalName: parsed.filename,
      objectKey: uploaded.objectKey,
      url: uploaded.publicUrl,
      mimeType: parsed.mimeType,
      sizeBytes: parsed.sizeBytes,
      width: parsed.width ?? null,
      height: parsed.height ?? null,
      altText: parsed.altText,
      folder: parsed.folder,
      uploadedById: actor.id,
    })
    .returning();

  await logAdminActivity({
    actor,
    action: "UPLOAD_MEDIA",
    entityType: "MEDIA",
    entityId: record.id,
    summary: `Uploaded media file "${record.originalName}" to ${record.folder}.`,
  });

  invalidateContentCache([CACHE_TAGS.MEDIA], ["/admin/media"]);
  return record;
}

export async function isMediaUrlInUse(url: string): Promise<boolean> {
  const db = await getDb();

  const [
    eventRef,
    postRef,
    serviceRef,
    messageRef,
    devotionalRef,
    testimonyRef,
    streamRef,
    settingRef,
  ] = await Promise.all([
    db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.coverImage, url))
      .limit(1),
    db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.coverImage, url))
      .limit(1),
    db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.imageUrl, url))
      .limit(1),
    db
      .select({ id: messages.id })
      .from(messages)
      .where(eq(messages.thumbnailUrl, url))
      .limit(1),
    db
      .select({ id: devotionals.id })
      .from(devotionals)
      .where(eq(devotionals.coverImage, url))
      .limit(1),
    db
      .select({ id: testimonies.id })
      .from(testimonies)
      .where(eq(testimonies.imageUrl, url))
      .limit(1),
    db
      .select({ id: livestreams.id })
      .from(livestreams)
      .where(eq(livestreams.thumbnailUrl, url))
      .limit(1),
    db
      .select({ id: settings.id })
      .from(settings)
      .where(eq(settings.logoUrl, url))
      .limit(1),
  ]);

  return Boolean(
    eventRef[0] ||
      postRef[0] ||
      serviceRef[0] ||
      messageRef[0] ||
      devotionalRef[0] ||
      testimonyRef[0] ||
      streamRef[0] ||
      settingRef[0]
  );
}

export async function deleteMediaAsset(id: string, force = false) {
  const actor = await requireAdminPermission("MANAGE_MEDIA");
  const db = await getDb();

  const [asset] = await db
    .select()
    .from(media)
    .where(eq(media.id, id))
    .limit(1);

  if (!asset) {
    throw new Error("Media file not found.");
  }

  if (!force) {
    const inUse = await isMediaUrlInUse(asset.url);
    if (inUse) {
      throw new Error(
        "This media file is currently referenced by published or draft content and cannot be deleted while in use."
      );
    }
  }

  const storage = getStorageProvider();
  await storage.deleteObject(asset.objectKey);

  const [deleted] = await db
    .delete(media)
    .where(eq(media.id, id))
    .returning();

  await logAdminActivity({
    actor,
    action: "DELETE_MEDIA",
    entityType: "MEDIA",
    entityId: deleted.id,
    summary: `Deleted media asset "${deleted.originalName}".`,
  });

  invalidateContentCache([CACHE_TAGS.MEDIA], ["/admin/media"]);
  return deleted;
}

export async function cleanupOrphanedMediaAssets() {
  const actor = await requireAdminPermission("MANAGE_MEDIA");
  const db = await getDb();
  const allAssets = await db.select().from(media);
  const storage = getStorageProvider();

  let removedCount = 0;
  for (const asset of allAssets) {
    if (asset.objectKey.startsWith("assets/")) {
      continue;
    }
    const inUse = await isMediaUrlInUse(asset.url);
    if (!inUse) {
      await storage.deleteObject(asset.objectKey);
      await db.delete(media).where(eq(media.id, asset.id));
      removedCount += 1;
    }
  }

  if (removedCount > 0) {
    await logAdminActivity({
      actor,
      action: "CLEANUP_ORPHANED_MEDIA",
      entityType: "MEDIA",
      summary: `Cleaned up ${removedCount} orphaned media asset(s).`,
    });
    invalidateContentCache([CACHE_TAGS.MEDIA], ["/admin/media"]);
  }

  return { removedCount };
}

