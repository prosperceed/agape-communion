import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, sql } from "drizzle-orm";
import { getDb, users } from "@/lib/db";
import {
  AuthorizationError,
  logAdminActivity,
  requireAdminPermission,
} from "@/lib/auth";
import { sendAdminInvitationEmail } from "@/lib/email";
import {
  acceptAdminInviteSchema,
  inviteEditorAdminSchema,
  resetAdminPasswordSchema,
  updateAdminAccountStatusSchema,
  type InviteEditorAdminInput,
  type ResetAdminPasswordInput,
  type UpdateAdminAccountStatusInput,
} from "./schemas";

export async function provisionOrInviteEditorAdmin(
  rawInput: Omit<InviteEditorAdminInput, "role"> & { role?: string }
) {
  const actor = await requireAdminPermission("MANAGE_ADMINS");

  if (
    rawInput.role &&
    rawInput.role !== "EDITOR_ADMIN" &&
    rawInput.role !== "SUPER_ADMIN"
  ) {
    throw new AuthorizationError(
      "Privilege escalation blocked: Invalid administrator role requested.",
      403
    );
  }

  const parsed = inviteEditorAdminSchema.parse(rawInput);
  const email = parsed.email.toLowerCase();
  const assignedRole = parsed.role || "EDITOR_ADMIN";

  const db = await getDb();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    throw new Error("An administrator with this email address already exists.");
  }

  const passwordToHash = parsed.sendInviteOnly
    ? crypto.randomBytes(16).toString("hex") + "Aa1!"
    : parsed.password || "TempInvite!2026";
  const passwordHash = await bcrypt.hash(passwordToHash, 12);
  const invitationToken = parsed.sendInviteOnly
    ? crypto.randomBytes(24).toString("hex")
    : null;
  const invitationExpiresAt = parsed.sendInviteOnly
    ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    : null;

  const [createdUser] = await db
    .insert(users)
    .values({
      name: parsed.name,
      email,
      passwordHash,
      role: assignedRole,
      status: parsed.sendInviteOnly ? "INVITED" : "ACTIVE",
      invitationToken,
      invitationExpiresAt,
      invitedById: actor.id,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      invitationToken: users.invitationToken,
      createdAt: users.createdAt,
    });

  let inviteLink: string | null = null;
  if (invitationToken) {
    const emailRes = await sendAdminInvitationEmail({
      recipientEmail: createdUser.email,
      recipientName: createdUser.name,
      invitedByName: actor.name,
      invitationToken,
      role: createdUser.role,
    });
    inviteLink = emailRes.inviteLink;
  }

  const roleLabel =
    createdUser.role === "SUPER_ADMIN" ? "Super Admin" : "Editor Admin";

  await logAdminActivity({
    actor,
    action: parsed.sendInviteOnly ? "INVITE_ADMIN" : "CREATE_ADMIN",
    entityType: "USER",
    entityId: createdUser.id,
    summary: `${parsed.sendInviteOnly ? "Invited" : "Created"} ${roleLabel} account for ${createdUser.name} (${createdUser.email}).`,
  });

  return {
    ...createdUser,
    inviteLink,
  };
}

export async function updateEditorAdminStatus(
  rawInput: UpdateAdminAccountStatusInput
) {
  const actor = await requireAdminPermission("MANAGE_ADMINS");
  const parsed = updateAdminAccountStatusSchema.parse(rawInput);

  if (parsed.userId === actor.id) {
    throw new AuthorizationError(
      "You cannot deactivate or revoke your own Super Admin account.",
      400
    );
  }

  const db = await getDb();
  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, parsed.userId))
    .limit(1);

  if (!targetUser) {
    throw new Error("Administrator account not found.");
  }

  if (targetUser.role === "SUPER_ADMIN" && parsed.status !== "ACTIVE") {
    const [activeSuperAdmins] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(users)
      .where(
        and(eq(users.role, "SUPER_ADMIN"), eq(users.status, "ACTIVE"))
      );

    if ((activeSuperAdmins?.count ?? 0) <= 1) {
      throw new AuthorizationError(
        "Cannot deactivate the last active Super Admin account.",
        400
      );
    }
  }

  const [updated] = await db
    .update(users)
    .set({
      status: parsed.status,
      invitationToken: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, parsed.userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
    });

  await logAdminActivity({
    actor,
    action: `UPDATE_ADMIN_STATUS_${parsed.status}`,
    entityType: "USER",
    entityId: updated.id,
    summary: `Changed status of ${updated.name} (${updated.email}) to ${parsed.status}.`,
  });

  return updated;
}

export async function resetEditorAdminPassword(rawInput: ResetAdminPasswordInput) {
  const actor = await requireAdminPermission("MANAGE_ADMINS");
  const parsed = resetAdminPasswordSchema.parse(rawInput);

  const db = await getDb();
  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, parsed.userId))
    .limit(1);

  if (!targetUser) {
    throw new Error("Administrator account not found.");
  }

  const passwordHash = await bcrypt.hash(parsed.newPassword, 12);

  await db
    .update(users)
    .set({
      passwordHash,
      invitationToken: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, parsed.userId));

  await logAdminActivity({
    actor,
    action: "RESET_ADMIN_CREDENTIALS",
    entityType: "USER",
    entityId: targetUser.id,
    summary: `Reset password credentials for ${targetUser.name} (${targetUser.email}).`,
  });

  return { id: targetUser.id, email: targetUser.email };
}

export async function acceptAdminInvitation(rawInput: {
  token: string;
  password: string;
  role?: string;
}) {
  const parsed = acceptAdminInviteSchema.parse(rawInput);
  const db = await getDb();

  const [invitedUser] = await db
    .select()
    .from(users)
    .where(eq(users.invitationToken, parsed.token))
    .limit(1);

  if (!invitedUser || invitedUser.status !== "INVITED") {
    throw new Error("Invalid or already used invitation token.");
  }

  if (rawInput.role && rawInput.role !== invitedUser.role) {
    throw new AuthorizationError(
      "Privilege escalation blocked: You cannot alter the role assigned to your invitation.",
      403
    );
  }

  if (
    invitedUser.invitationExpiresAt &&
    invitedUser.invitationExpiresAt.getTime() < Date.now()
  ) {
    throw new Error("This invitation token has expired.");
  }

  const passwordHash = await bcrypt.hash(parsed.password, 12);

  const [activatedUser] = await db
    .update(users)
    .set({
      passwordHash,
      status: "ACTIVE",
      invitationToken: null,
      invitationExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, invitedUser.id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
    });

  return activatedUser;
}
