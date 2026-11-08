"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult, AdminRole } from "@/types";
import {
  provisionOrInviteEditorAdmin,
  resetEditorAdminPassword,
  updateEditorAdminStatus,
  acceptAdminInvitation,
} from "./service";
import type {
  InviteEditorAdminInput,
  ResetAdminPasswordInput,
  UpdateAdminAccountStatusInput,
} from "./schemas";

export async function createOrInviteAdminAction(
  input: InviteEditorAdminInput
): Promise<
  ActionResult<{
    id: string;
    email: string;
    role: AdminRole;
    inviteLink: string | null;
  }>
> {
  try {
    const created = await provisionOrInviteEditorAdmin(input);
    revalidatePath("/admin/users");
    revalidatePath("/admin/activity-logs");
    const roleLabel =
      created.role === "SUPER_ADMIN" ? "Super Admin" : "Editor Admin";
    return {
      success: true,
      data: {
        id: created.id,
        email: created.email,
        role: created.role,
        inviteLink: created.inviteLink,
      },
      message: input.sendInviteOnly
        ? `Verification link created for ${created.email} (${roleLabel}).`
        : `${roleLabel} account provisioned successfully.`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to provision account.",
    };
  }
}

export async function changeAdminStatusAction(
  input: UpdateAdminAccountStatusInput
): Promise<ActionResult<{ id: string; status: string }>> {
  try {
    const updated = await updateEditorAdminStatus(input);
    revalidatePath("/admin/users");
    revalidatePath("/admin/activity-logs");
    return {
      success: true,
      data: { id: updated.id, status: updated.status },
      message: `Administrator account status updated to ${updated.status}.`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update account status.",
    };
  }
}

export async function resetAdminPasswordAction(
  input: ResetAdminPasswordInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const result = await resetEditorAdminPassword(input);
    revalidatePath("/admin/users");
    revalidatePath("/admin/activity-logs");
    return {
      success: true,
      data: { id: result.id },
      message: "Administrator password reset successfully.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reset password.",
    };
  }
}

export async function acceptInvitationAction(input: {
  token: string;
  password: string;
}): Promise<ActionResult<{ email: string; role: AdminRole }>> {
  try {
    const activated = await acceptAdminInvitation(input);
    revalidatePath("/admin/users");
    return {
      success: true,
      data: { email: activated.email, role: activated.role },
      message: "Email verified and password saved. You may now sign in.",
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to activate account.",
    };
  }
}
