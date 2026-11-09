"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import { acceptInvitationAction } from "@/features/users/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

function AdminLoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("inviteToken");
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteCompleted, setInviteCompleted] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      toast.error("Invalid administrator credentials or inactive account.");
      setError(
        "Invalid administrator credentials or inactive account. Please verify your email and password."
      );
      return;
    }

    toast.success("Signed in successfully. Redirecting...");
    router.push(callbackUrl);
    router.refresh();
  }

  async function handleAcceptInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteToken) return;
    setLoading(true);
    setError(null);

    const res = await acceptInvitationAction({
      token: inviteToken,
      password: invitePassword,
    });

    setLoading(false);
    if (!res.success) {
      toast.error(res.error || "Failed to activate account.");
      setError(res.error);
      return;
    }

    toast.success("Account activated successfully. Please sign in.");
    setEmail(res.data.email);
    setInviteCompleted(true);
  }

  if (inviteToken && !inviteCompleted) {
    return (
      <form onSubmit={handleAcceptInvite} className="space-y-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#EA580C]">
            <ShieldCheck className="h-4 w-4" />
            <span>Administrator Invitation</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Complete Account Setup
          </h1>
          <p className="text-xs text-slate-600">
            Set a strong password to activate your Editor Admin account.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-sm border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800"
          >
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="invite-password">New Administrator Password</Label>
          <Input
            id="invite-password"
            type="password"
            required
            minLength={10}
            value={invitePassword}
            onChange={(e) => setInvitePassword(e.target.value)}
            placeholder="At least 10 chars with upper, lower, and number"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Activating Account..." : "Activate Editor Admin Account"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#EA580C]">
          Secure Portal
        </p>
        <h1 className="text-2xl font-bold text-slate-900">
          Administrator Sign In
        </h1>
        <p className="text-xs text-slate-600">
          Authorized access for Super Admin and Editor Admin accounts only.
        </p>
      </div>

      {inviteCompleted && (
        <div className="rounded-sm border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
          Your Editor Admin account is now active. Please sign in below.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-sm border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800"
        >
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="admin-email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            id="admin-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9"
            placeholder="superadmin@agapecommunion.org.ng"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="admin-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            id="admin-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-9"
            placeholder="Enter your password"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing In..." : "Sign In to Dashboard"}
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#0B1325] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/assets/branding/logo-light.svg"
            alt="Agape Communion Church"
            width={44}
            height={44}
            className="h-11 w-11"
          />
          <span className="text-base font-bold uppercase tracking-widest text-white">
            Agape Communion Church
          </span>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
          <Suspense
            fallback={
              <div className="text-sm text-slate-500">Loading login form...</div>
            }
          >
            <AdminLoginFormContent />
          </Suspense>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

