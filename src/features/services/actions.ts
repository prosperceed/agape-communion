"use server";

import type { ActionResult, ContentStatus } from "@/types";
import {
  createServiceEntry,
  deleteServiceEntry,
  updateServiceEntry,
  updateServiceStatus,
} from "./service";
import type { ServiceInput } from "./schemas";

export async function createServiceAction(
  input: ServiceInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const created = await createServiceEntry(input);
    return {
      success: true,
      data: { id: created.id },
      message: "Service programme created successfully.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create service.",
    };
  }
}

export async function updateServiceAction(
  id: string,
  input: ServiceInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const updated = await updateServiceEntry(id, input);
    return {
      success: true,
      data: { id: updated.id },
      message: "Service programme updated successfully.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update service.",
    };
  }
}

export async function setServiceStatusAction(
  id: string,
  status: ContentStatus
): Promise<ActionResult<{ id: string }>> {
  try {
    const updated = await updateServiceStatus(id, status);
    return {
      success: true,
      data: { id: updated.id },
      message: `Service status updated to ${status}.`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update status.",
    };
  }
}

export async function deleteServiceAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const deleted = await deleteServiceEntry(id);
    return {
      success: true,
      data: { id: deleted.id },
      message: "Service programme deleted.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete service.",
    };
  }
}
