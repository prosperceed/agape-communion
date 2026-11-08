"use server";

import type { ActionResult, LivestreamStatus } from "@/types";
import {
  changeLivestreamState,
  createLivestreamAnnouncement,
  deleteLivestreamAnnouncement,
  updateLivestreamAnnouncement,
} from "./service";
import type { LivestreamInput } from "./schemas";

export async function createLivestreamAction(
  input: LivestreamInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const created = await createLivestreamAnnouncement(input);
    return {
      success: true,
      data: { id: created.id },
      message: "Livestream announcement created.",
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to create livestream.",
    };
  }
}

export async function updateLivestreamAction(
  id: string,
  input: LivestreamInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const updated = await updateLivestreamAnnouncement(id, input);
    return {
      success: true,
      data: { id: updated.id },
      message: "Livestream announcement updated.",
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to update livestream.",
    };
  }
}

export async function setLivestreamStateAction(
  id: string,
  status: LivestreamStatus
): Promise<ActionResult<{ id: string }>> {
  try {
    const updated = await changeLivestreamState(id, status);
    return {
      success: true,
      data: { id: updated.id },
      message: `Livestream is now ${status}.`,
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to change livestream state.",
    };
  }
}

export async function deleteLivestreamAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const deleted = await deleteLivestreamAnnouncement(id);
    return {
      success: true,
      data: { id: deleted.id },
      message: "Livestream deleted.",
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to delete livestream.",
    };
  }
}

