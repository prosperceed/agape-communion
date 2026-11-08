"use server";

import type { ActionResult, TestimonyStatus } from "@/types";
import {
  createAdminTestimony,
  deleteTestimonyEntry,
  submitPublicTestimony,
  updateAdminTestimony,
  updateTestimonyStatus,
} from "./service";
import type {
  PublicTestimonySubmissionInput,
  TestimonyAdminInput,
} from "./schemas";

export async function createTestimonyAction(
  input: TestimonyAdminInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const created = await createAdminTestimony(input);
    return {
      success: true,
      data: { id: created.id },
      message: "Testimony saved successfully.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save testimony.",
    };
  }
}

export async function updateTestimonyAction(
  id: string,
  input: TestimonyAdminInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const updated = await updateAdminTestimony(id, input);
    return {
      success: true,
      data: { id: updated.id },
      message: "Testimony updated successfully.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update testimony.",
    };
  }
}

export async function setTestimonyStatusAction(
  id: string,
  status: TestimonyStatus
): Promise<ActionResult<{ id: string }>> {
  try {
    const updated = await updateTestimonyStatus(id, status);
    return {
      success: true,
      data: { id: updated.id },
      message: `Testimony status updated to ${status}.`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update status.",
    };
  }
}

export async function deleteTestimonyAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const deleted = await deleteTestimonyEntry(id);
    return {
      success: true,
      data: { id: deleted.id },
      message: "Testimony deleted.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete testimony.",
    };
  }
}

export async function submitPublicTestimonyAction(
  input: PublicTestimonySubmissionInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const submitted = await submitPublicTestimony(input);
    return {
      success: true,
      data: { id: submitted.id },
      message:
        "Thank you for sharing your testimony. Our pastoral team will review it shortly.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit testimony.",
    };
  }
}

