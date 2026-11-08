"use server";

import type { ActionResult, ContentStatus } from "@/types";
import {
  createEventEntry,
  deleteEventEntry,
  updateEventEntry,
  updateEventStatus,
} from "./service";
import type { EventInput } from "./schemas";

export async function createEventAction(
  input: EventInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const created = await createEventEntry(input);
    return {
      success: true,
      data: { id: created.id, slug: created.slug },
      message: "Event created successfully.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create event.",
    };
  }
}

export async function updateEventAction(
  id: string,
  input: EventInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const updated = await updateEventEntry(id, input);
    return {
      success: true,
      data: { id: updated.id, slug: updated.slug },
      message: "Event updated successfully.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update event.",
    };
  }
}

export async function setEventStatusAction(
  id: string,
  status: ContentStatus
): Promise<ActionResult<{ id: string }>> {
  try {
    const updated = await updateEventStatus(id, status);
    return {
      success: true,
      data: { id: updated.id },
      message: `Event status updated to ${status}.`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update event status.",
    };
  }
}

export async function deleteEventAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const deleted = await deleteEventEntry(id);
    return {
      success: true,
      data: { id: deleted.id },
      message: "Event deleted.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete event.",
    };
  }
}

