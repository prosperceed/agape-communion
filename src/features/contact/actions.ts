"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";
import { markContactSubmissionRead, submitContactInquiry } from "./service";
import type { ContactSubmissionInput } from "./schemas";

export async function submitContactFormAction(
  input: ContactSubmissionInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const created = await submitContactInquiry(input);
    return {
      success: true,
      data: { id: created.id },
      message:
        "Thank you for reaching out to Agape Communion Church. We have received your message.",
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Unable to send your message right now.",
    };
  }
}

export async function markContactReadAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const updated = await markContactSubmissionRead(id);
    revalidatePath("/admin");
    return {
      success: true,
      data: { id: updated.id },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update message.",
    };
  }
}

