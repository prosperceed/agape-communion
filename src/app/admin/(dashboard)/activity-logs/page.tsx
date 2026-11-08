import { redirect } from "next/navigation";
import { ShieldCheck, Activity } from "lucide-react";
import { requireAdminPermission } from "@/lib/auth";
import { listAdminActivityLogs } from "@/features/users/queries";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminActivityLogsPage() {
  try {
    await requireAdminPermission("VIEW_ACTIVITY_LOGS");
  } catch {
    redirect("/admin?error=forbidden");
  }

  const logs = await listAdminActivityLogs(100);

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          Super Admin Governance
        </div>
        <h1 className="mt-2 font-serif text-2xl font-bold text-slate-900">
          Administrative Activity Logs
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Immutable audit trail of content updates, status transitions, and account provisioning across the platform.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Entity</th>
                <th className="px-5 py-3.5">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60">
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {log.actorName}
                    </p>
                    <p className="text-xs text-slate-500">{log.actorRole}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="default" className="font-mono text-[11px]">
                      <Activity className="mr-1 h-3 w-3 text-orange-600" />
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-slate-700">
                    {log.entityType}
                  </td>
                  <td className="px-5 py-4 text-slate-700">{log.summary}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No administrative actions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

