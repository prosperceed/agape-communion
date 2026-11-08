import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { getInvitationByToken } from "@/features/users/queries";
import { AcceptInviteForm } from "@/components/admin/accept-invite-form";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  const invitation = await getInvitationByToken(token);

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#0B1325] px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <span className="inline-block rounded-full bg-orange-500/15 px-3 py-1 text-xs font-semibold tracking-wider text-orange-400 uppercase">
            Agape Communion Church
          </span>
          <h1 className="mt-3 font-serif text-3xl font-bold text-white">
            Verify Administrator Account
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Confirm your invitation and set your password to activate your role permissions.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-white p-8 shadow-xl">
          {!invitation || invitation.isExpired ? (
            <div className="space-y-4 text-center">
              <ShieldAlert className="mx-auto h-10 w-10 text-amber-600" />
              <h2 className="font-serif text-lg font-bold text-slate-900">
                {invitation?.isExpired
                  ? "Verification Link Expired"
                  : "Invalid or Already Used Verification Link"}
              </h2>
              <p className="text-sm text-slate-600">
                This administrator verification link is no longer valid. Please ask a Super Admin to send a new invitation or sign in if you have already activated your account.
              </p>
              <div className="pt-2">
                <Link href="/admin/login">
                  <Button type="button" variant="outline" className="w-full">
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Go to Administrator Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <AcceptInviteForm
              token={token}
              name={invitation.name}
              email={invitation.email}
              role={invitation.role}
            />
          )}
        </div>
      </div>
    </div>
  );
}

