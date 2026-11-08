"use server";

import type { ActionResult, ContentStatus } from "@/types";
import {
  createDevotionalEntry,
  deleteDevotionalEntry,
  updateDevotionalEntry,
  updateDevotionalStatus,
} from "./service";
import type { DevotionalInput } from "./schemas";

export async function createDevotionalAction(
  input: DevotionalInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const created = await createDevotionalEntry(input);
    return {
      success: true,
      data: { id: created.id, slug: created.slug },
      message: "Devotional created successfully.",
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to create devotional.",
    };
  }
}

export async function updateDevotionalAction(
  id: string,
  input: DevotionalInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const updated = await updateDevotionalEntry(id, input);
    return {
      success: true,
      data: { id: updated.id, slug: updated.slug },
      message: "Devotional updated successfully.",
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to update devotional.",
    };
  }
}

export async function setDevotionalStatusAction(
  id: string,
  status: ContentStatus
): Promise<ActionResult<{ id: string }>> {
  try {
    const updated = await updateDevotionalStatus(id, status);
    return {
      success: true,
      data: { id: updated.id },
      message: `Devotional status changed to ${status}.`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update status.",
    };
  }
}

export async function deleteDevotionalAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const deleted = await deleteDevotionalEntry(id);
    return {
      success: true,
      data: { id: deleted.id },
      message: "Devotional deleted.",
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to delete devotional.",
    };
  }
}

