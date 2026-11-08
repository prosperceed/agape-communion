"use server";

import type { ActionResult } from "@/types";
import { updateChurchSettings } from "./service";
import type { ChurchSettingsInput } from "./schemas";

export async function updateChurchSettingsAction(
  input: ChurchSettingsInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const res = await updateChurchSettings(input);
    return {
      success: true,
      data: res,
      message: "Church settings updated successfully.",
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to update church settings.",
    };
  }
}
