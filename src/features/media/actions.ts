"use server";

import type { ActionResult } from "@/types";
import {
  cleanupOrphanedMediaAssets,
  createSignedMediaUpload,
  deleteMediaAsset,
} from "./service";
import type { RequestSignedUploadInput } from "./schemas";

export async function getSignedUploadUrlAction(
  input: RequestSignedUploadInput
): Promise<
  ActionResult<{
    uploadUrl: string;
    publicUrl: string;
    objectKey: string;
  }>
> {
  try {
    const signed = await createSignedMediaUpload(input);
    return {
      success: true,
      data: {
        uploadUrl: signed.uploadUrl,
        publicUrl: signed.publicUrl,
        objectKey: signed.objectKey,
      },
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to generate upload URL.",
    };
  }
}

export async function deleteMediaAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const deleted = await deleteMediaAsset(id);
    return {
      success: true,
      data: { id: deleted.id },
      message: "Media asset deleted.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete media.",
    };
  }
}

export async function cleanupOrphanedMediaAction(): Promise<
  ActionResult<{ removedCount: number }>
> {
  try {
    const res = await cleanupOrphanedMediaAssets();
    return {
      success: true,
      data: res,
      message: `Cleaned up ${res.removedCount} unused media file(s).`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to cleanup media.",
    };
  }
}

