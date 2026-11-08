"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  ShieldCheck,
  KeyRound,
  UserX,
  UserCheck,
  Ban,
  Copy,
  Check,
  X,
} from "lucide-react";
import {
  createOrInviteAdminAction,
  changeAdminStatusAction,
  resetAdminPasswordAction,
} from "@/features/users/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import type { AdminRole, AccountStatus } from "@/types";

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AccountStatus;
  invitationToken: string | null;
  invitationExpiresAt: Date | string | null;
  lastLoginAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export function UsersManager({
  initialUsers,
  currentAdminId,
}: {
  initialUsers: AdminUserRow[];
  currentAdminId: string;
}) {
  const router = useRouter();
  const [isProvisionOpen, setIsProvisionOpen] = React.useState(false);
  const [resetUserId, setResetUserId] = React.useState<string | null>(null);
  const [newPassword, setNewPassword] = React.useState("");

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<AdminRole>("EDITOR_ADMIN");
  const [initialPassword, setInitialPassword] = React.useState("");
  const [sendInviteOnly, setSendInviteOnly] = React.useState(true);
  const [copiedTokenId, setCopiedTokenId] = React.useState<string | null>(null);

  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    text: string;
    inviteLink?: string | null;
  } | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  async function handleProvision(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setIsPending(true);
    try {
      const res = await createOrInviteAdminAction({
        name,
        email,
        role,
        password: sendInviteOnly ? "TempInvite!2026" : initialPassword,
        sendInviteOnly,
      });

      if (res.success) {
        toast.success(res.message || "Administrator account created.");
        setFeedback({
          type: "success",
          text: res.message || "Administrator account invited.",
          inviteLink: res.data.inviteLink,
        });
        setName("");
        setEmail("");
        setRole("EDITOR_ADMIN");
        setInitialPassword("");
        setIsProvisionOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create administrator account.");
        setFeedback({ type: "error", text: res.error });
      }
    } finally {
      setIsPending(false);
    }
  }

  async function handleStatusChange(
    userId: string,
    status: "ACTIVE" | "DEACTIVATED" | "REVOKED"
  ) {
    setFeedback(null);
    setIsPending(true);
    try {
      const res = await changeAdminStatusAction({ userId, status });
      if (res.success) {
        toast.success(res.message || `Account status updated to ${status}.`);
        setFeedback({
          type: "success",
          text: res.message || `Account status updated to ${status}.`,
        });
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update account status.");
        setFeedback({ type: "error", text: res.error });
      }
    } finally {
      setIsPending(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetUserId) return;
    setFeedback(null);
    setIsPending(true);
    try {
      const res = await resetAdminPasswordAction({
        userId: resetUserId,
        newPassword,
      });
      if (res.success) {
        toast.success("Password reset successfully.");
        setFeedback({
          type: "success",
          text: res.message || "Password reset successfully.",
        });
        setResetUserId(null);
        setNewPassword("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to reset password.");
        setFeedback({ type: "error", text: res.error });
      }
    } finally {
      setIsPending(false);
    }
  }

  function copyInviteLink(id: string, token: string) {
    const url = `${window.location.origin}/admin/accept-invite?token=${encodeURIComponent(
      token
    )}`;
    navigator.clipboard.writeText(url);
    toast.info("Invite verification link copied to clipboard.");
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 2000);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Super Admin Governance
          </div>
          <h1 className="mt-2 font-serif text-2xl font-bold text-slate-900">
            Administrator Accounts
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Assign administrator emails and roles, send verification links for password setup, and manage access.
          </p>
        </div>
        {!isProvisionOpen && (
          <Button type="button" onClick={() => setIsProvisionOpen(true)}>
            <UserPlus className="mr-1.5 h-4 w-4" />
            Invite or Assign Administrator
          </Button>
        )}
      </div>

      {feedback && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <p className="font-medium">{feedback.text}</p>
          {feedback.inviteLink && (
            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-emerald-300/80 bg-white px-3 py-2 text-xs text-slate-800">
              <span className="font-semibold text-emerald-800">
                Verification Link:
              </span>
              <code className="break-all text-slate-700">
                {feedback.inviteLink}
              </code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(feedback.inviteLink!);
                  setCopiedTokenId("banner");
                  setTimeout(() => setCopiedTokenId(null), 2000);
                }}
              >
                {copiedTokenId === "banner" ? (
                  <>
                    <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-3.5 w-3.5" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {isProvisionOpen && (
        <form
          onSubmit={handleProvision}
          className="space-y-5 rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900">
                Assign & Invite Administrator
              </h2>
              <p className="text-xs text-slate-500">
                Assign an email address and role. They will receive a verification link to set their password and activate their permissions.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsProvisionOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <Label htmlFor="admin-name">Full Name</Label>
              <Input
                id="admin-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sister Chidinma Okafor"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="admin-email">Email Address</Label>
              <Input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chidinma@agapecommunion.org.ng"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="admin-role">Assigned Role</Label>
              <select
                id="admin-role"
                value={role}
                onChange={(e) => setRole(e.target.value as AdminRole)}
                className="mt-1.5 flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="EDITOR_ADMIN">
                  Editor Admin (Content & Media)
                </option>
                <option value="SUPER_ADMIN">
                  Super Admin (Full Governance & Settings)
                </option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="admin-invite-only"
              type="checkbox"
              checked={sendInviteOnly}
              onChange={(e) => setSendInviteOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-orange-600"
            />
            <Label htmlFor="admin-invite-only">
              Send email verification link so the user verifies and enters their own password (Recommended)
            </Label>
          </div>

          {!sendInviteOnly && (
            <div className="max-w-md">
              <Label htmlFor="admin-pass">Initial Password</Label>
              <Input
                id="admin-pass"
                type="password"
                required={!sendInviteOnly}
                value={initialPassword}
                onChange={(e) => setInitialPassword(e.target.value)}
                placeholder="Minimum 10 chars with uppercase, lowercase & number"
                className="mt-1.5"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsProvisionOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : sendInviteOnly
                  ? "Send Verification Link"
                  : "Create Active Account"}
            </Button>
          </div>
        </form>
      )}

      {resetUserId && (
        <form
          onSubmit={handleResetPassword}
          className="space-y-4 rounded-xl border border-orange-200 bg-orange-50/40 p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-slate-900">
              Reset Administrator Password
            </h3>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setResetUserId(null);
                setNewPassword("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-w-md">
            <Label htmlFor="reset-password-input">New Password</Label>
            <Input
              id="reset-password-input"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 10 chars with uppercase, lowercase & number"
              className="mt-1.5 bg-white"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              Save New Password
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setResetUserId(null);
                setNewPassword("");
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3.5">Administrator</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Last Login</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {initialUsers.map((admin) => {
                const isSelf = admin.id === currentAdminId;
                return (
                  <tr key={admin.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {admin.name}
                        {isSelf && (
                          <span className="ml-2 text-xs font-normal text-slate-500">
                            (You)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{admin.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          admin.role === "SUPER_ADMIN" ? "default" : "secondary"
                        }
                      >
                        {admin.role === "SUPER_ADMIN"
                          ? "Super Admin"
                          : "Editor Admin"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          admin.status === "ACTIVE"
                            ? "success"
                            : admin.status === "INVITED"
                              ? "warning"
                              : "destructive"
                        }
                      >
                        {admin.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      {admin.lastLoginAt
                        ? formatDate(admin.lastLoginAt)
                        : "Never signed in"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex flex-wrap justify-end gap-1.5">
                        {admin.status === "INVITED" && admin.invitationToken && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              copyInviteLink(admin.id, admin.invitationToken!)
                            }
                            title="Copy verification link"
                          >
                            {copiedTokenId === admin.id ? (
                              <>
                                <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                                Copied Link
                              </>
                            ) : (
                              <>
                                <Copy className="mr-1 h-3.5 w-3.5" />
                                Copy Invite Link
                              </>
                            )}
                          </Button>
                        )}

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setResetUserId(admin.id)}
                          title="Reset password"
                        >
                          <KeyRound className="mr-1 h-3.5 w-3.5" />
                          Reset Password
                        </Button>

                        {!isSelf && (
                          <>
                            {admin.status !== "ACTIVE" && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="text-emerald-700 hover:bg-emerald-50"
                                onClick={() =>
                                  handleStatusChange(admin.id, "ACTIVE")
                                }
                              >
                                <UserCheck className="mr-1 h-3.5 w-3.5" />
                                Activate
                              </Button>
                            )}
                            {admin.status === "ACTIVE" && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="text-amber-700 hover:bg-amber-50"
                                onClick={() =>
                                  handleStatusChange(admin.id, "DEACTIVATED")
                                }
                              >
                                <UserX className="mr-1 h-3.5 w-3.5" />
                                Deactivate
                              </Button>
                            )}
                            {admin.status !== "REVOKED" && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() =>
                                  handleStatusChange(admin.id, "REVOKED")
                                }
                              >
                                <Ban className="mr-1 h-3.5 w-3.5" />
                                Revoke
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
