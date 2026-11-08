import type { AdminRole, AuthenticatedAdmin } from "@/types";

export type Permission =
  | "MANAGE_ADMINS"
  | "MANAGE_SETTINGS"
  | "VIEW_ACTIVITY_LOGS"
  | "MANAGE_CONTENT"
  | "MANAGE_MEDIA"
  | "MANAGE_LIVESTREAMS";

const ROLE_PERMISSIONS: Record<AdminRole, readonly Permission[]> = {
  SUPER_ADMIN: [
    "MANAGE_ADMINS",
    "MANAGE_SETTINGS",
    "VIEW_ACTIVITY_LOGS",
    "MANAGE_CONTENT",
    "MANAGE_MEDIA",
    "MANAGE_LIVESTREAMS",
  ],
  EDITOR_ADMIN: [
    "MANAGE_CONTENT",
    "MANAGE_MEDIA",
    "MANAGE_LIVESTREAMS",
  ],
};

export class AuthorizationError extends Error {
  public readonly statusCode: number;

  constructor(message = "You do not have permission to perform this action.", statusCode = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = statusCode;
  }
}

export function hasPermission(role: AdminRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canManageAdmins(role: AdminRole | undefined | null): boolean {
  return hasPermission(role, "MANAGE_ADMINS");
}

export function canManageSettings(role: AdminRole | undefined | null): boolean {
  return hasPermission(role, "MANAGE_SETTINGS");
}

export function canViewActivityLogs(role: AdminRole | undefined | null): boolean {
  return hasPermission(role, "VIEW_ACTIVITY_LOGS");
}

export function canManageContent(role: AdminRole | undefined | null): boolean {
  return hasPermission(role, "MANAGE_CONTENT");
}

export function canManageMedia(role: AdminRole | undefined | null): boolean {
  return hasPermission(role, "MANAGE_MEDIA");
}

export function canManageLivestreams(role: AdminRole | undefined | null): boolean {
  return hasPermission(role, "MANAGE_LIVESTREAMS");
}

export function assertAdminPermission(
  admin: AuthenticatedAdmin | null | undefined,
  permission: Permission
): AuthenticatedAdmin {
  if (!admin) {
    throw new AuthorizationError("Authentication required.", 401);
  }
  if (admin.status !== "ACTIVE") {
    throw new AuthorizationError("Your administrator account is not active.", 403);
  }
  if (!hasPermission(admin.role, permission)) {
    throw new AuthorizationError(
      `Role ${admin.role} is not permitted to perform ${permission}.`,
      403
    );
  }
  return admin;
}
