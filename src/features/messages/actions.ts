"use server";

import type { ActionResult, ContentStatus } from "@/types";
import {
  createMessageEntry,
  deleteMessageEntry,
  updateMessageEntry,
  updateMessageStatus,
} from "./service";
import type { MessageInput } from "./schemas";

export async function createMessageAction(
  input: MessageInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const created = await createMessageEntry(input);
    return {
      success: true,
      data: { id: created.id, slug: created.slug },
      message: "Message saved successfully.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save message.",
    };
  }
}

export async function updateMessageAction(
  id: string,
  input: MessageInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const updated = await updateMessageEntry(id, input);
    return {
      success: true,
      data: { id: updated.id, slug: updated.slug },
      message: "Message updated successfully.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update message.",
    };
  }
}

export async function setMessageStatusAction(
  id: string,
  status: ContentStatus
): Promise<ActionResult<{ id: string }>> {
  try {
    const updated = await updateMessageStatus(id, status);
    return {
      success: true,
      data: { id: updated.id },
      message: `Message status changed to ${status}.`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update status.",
    };
  }
}

export async function deleteMessageAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const deleted = await deleteMessageEntry(id);
    return {
      success: true,
      data: { id: deleted.id },
      message: "Message deleted.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete message.",
    };
  }
}

