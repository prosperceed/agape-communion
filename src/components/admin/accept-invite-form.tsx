"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle2, Lock, ArrowRight } from "lucide-react";
import { acceptInvitationAction } from "@/features/users/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import type { AdminRole } from "@/types";

interface AcceptInviteFormProps {
  token: string;
  name: string;
  email: string;
  role: AdminRole;
}

export function AcceptInviteForm({
  token,
  name,
  email,
  role,
}: AcceptInviteFormProps) {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [verified, setVerified] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  const roleLabel = role === "SUPER_ADMIN" ? "Super Admin" : "Editor Admin";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsPending(true);
    try {
      const res = await acceptInvitationAction({ token, password });
      if (res.success) {
        toast.success("Account activated successfully.");
        setVerified(true);
        setTimeout(() => {
          router.push(`/admin/login?email=${encodeURIComponent(email)}&verified=1`);
        }, 1500);
      } else {
        toast.error(res.error || "Failed to activate account.");
        setError(res.error);
      }
    } finally {
      setIsPending(false);
    }
  }

  if (verified) {
    return (
      <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <h2 className="font-serif text-xl font-bold text-slate-900">
          Email Verified & Account Activated
        </h2>
        <p className="text-sm text-slate-700">
          Your password has been encrypted and saved. Your account now has{" "}
          <strong>{roleLabel}</strong> permissions. Redirecting you to sign in...
        </p>
        <div className="pt-2">
          <Link href={`/admin/login?email=${encodeURIComponent(email)}`}>
            <Button type="button">
              Proceed to Sign In
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Assigned Role
          </span>
          <Badge variant={role === "SUPER_ADMIN" ? "default" : "secondary"}>
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            {roleLabel}
          </Badge>
        </div>
        <p className="mt-2 font-semibold text-slate-900">{name}</p>
        <p className="text-xs text-slate-600">{email}</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div>
        <Label htmlFor="invite-password">Create Password</Label>
        <Input
          id="invite-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 10 chars, uppercase, lowercase & number"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="invite-confirm-password">Confirm Password</Label>
        <Input
          id="invite-confirm-password"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          className="mt-1.5"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        <Lock className="mr-1.5 h-4 w-4" />
        {isPending
          ? "Verifying & Activating..."
          : `Verify Email & Activate ${roleLabel} Account`}
      </Button>
    </form>
  );
}

