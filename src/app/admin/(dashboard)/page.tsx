import Link from "next/link";
import {
  FileText,
  Calendar,
  BookOpen,
  Mic,
  HeartHandshake,
  Radio,
  Clock,
  ShieldAlert,
  ArrowRight,
  Users,
  Settings,
} from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth";
import {
  getDashboardOverviewStats,
  listAdminActivityLogs,
} from "@/features/users/queries";
import { listContactSubmissions } from "@/features/contact/queries";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AdminOverviewPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminOverviewPage({
  searchParams,
}: AdminOverviewPageProps) {
  const { error } = await searchParams;
  const admin = await getCurrentAdmin();
  const stats = await getDashboardOverviewStats();
  const recentContacts = await listContactSubmissions(5);

  const isSuperAdmin = admin?.role === "SUPER_ADMIN";
  const recentLogs = isSuperAdmin ? await listAdminActivityLogs(6) : [];

  const statCards = [
    {
      label: "Total Published Posts",
      value: stats.publishedPosts,
      href: "/admin/blog",
      icon: FileText,
    },
    {
      label: "Total Published Events",
      value: stats.totalPublishedEvents,
      href: "/admin/events",
      icon: Calendar,
    },
    {
      label: "Upcoming Events",
      value: stats.upcomingEvents,
      href: "/admin/events",
      icon: Calendar,
    },
    {
      label: "Published Devotionals",
      value: stats.publishedDevotionals,
      href: "/admin/devotionals",
      icon: BookOpen,
    },
    {
      label: "Total Messages",
      value: stats.totalMessages,
      href: "/admin/messages",
      icon: Mic,
    },
    {
      label: "Pending Testimonies",
      value: stats.pendingTestimonies,
      href: "/admin/testimonies",
      icon: HeartHandshake,
    },
    {
      label: "Published Services",
      value: stats.publishedServices,
      href: "/admin/services",
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-8">
      {error === "unauthorized" && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-sm border border-amber-300 bg-amber-50 p-4 text-xs font-medium text-amber-900"
        >
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
          <span>
            Access restricted: Only a Super Admin can access administrator
            account management, system settings, and activity logs.
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Dashboard Overview
            </h1>
            <Badge variant={isSuperAdmin ? "default" : "secondary"}>
              {isSuperAdmin ? "Super Admin" : "Editor Admin"}
            </Badge>
          </div>
          <p className="text-xs text-slate-600">
            Welcome back, {admin?.name}.{" "}
            {isSuperAdmin
              ? "You have full administrative and content management control."
              : "Manage church programmes, events, sermons, devotionals, and media."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/livestream"
            className="inline-flex h-9 items-center gap-2 rounded-sm border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Radio className="h-4 w-4 text-[#EA580C]" />
            <span>
              Livestream:{" "}
              {stats.currentLivestream
                ? stats.currentLivestream.status
                : "NONE"}
            </span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-sm border border-slate-200 bg-white p-5 hover:border-[#EA580C] transition-colors flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">{card.label}</span>
                <Icon className="h-4 w-4 text-[#EA580C]" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900">
                  {card.value}
                </span>
                <span className="text-[11px] font-semibold text-[#EA580C] inline-flex items-center gap-0.5">
                  Manage <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          );
        })}

        <Link
          href="/admin/livestream"
          className="rounded-sm border border-slate-200 bg-[#0B1325] text-white p-5 flex flex-col justify-between space-y-3"
        >
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-xs font-medium">Current Livestream</span>
            <Radio className="h-4 w-4 text-[#F97316]" />
          </div>
          <div>
            <p className="text-lg font-bold">
              {stats.currentLivestream?.status || "NO ACTIVE STREAM"}
            </p>
            <p className="truncate text-xs text-slate-300">
              {stats.currentLivestream?.title || "Schedule next broadcast"}
            </p>
          </div>
        </Link>
      </div>

      {isSuperAdmin && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-sm border border-slate-200 bg-white p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#EA580C]" />
                <h2 className="text-sm font-bold text-slate-900">
                  Administrator Management
                </h2>
              </div>
              <Link
                href="/admin/users"
                className="text-xs font-semibold text-[#EA580C] hover:underline"
              >
                Manage Admins &rarr;
              </Link>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Invite or provision Editor Admin accounts, review account status,
              reset credentials, or revoke access.
            </p>
          </div>

          <div className="rounded-sm border border-slate-200 bg-white p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#EA580C]" />
                <h2 className="text-sm font-bold text-slate-900">
                  Church Identity & Website Settings
                </h2>
              </div>
              <Link
                href="/admin/settings"
                className="text-xs font-semibold text-[#EA580C] hover:underline"
              >
                Configure Settings &rarr;
              </Link>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Update church vision, mission, core beliefs, pastoral leadership,
              contact details, and default livestream schedules.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div
          className={`${
            isSuperAdmin ? "lg:col-span-6" : "lg:col-span-12"
          } rounded-sm border border-slate-200 bg-white p-6 space-y-4`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Recent Contact Inquiries
            </h2>
            <span className="text-xs text-slate-500">
              Latest {recentContacts.length} submissions
            </span>
          </div>

          {recentContacts.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">
              No contact inquiries have been submitted yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentContacts.map((item) => (
                <div key={item.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900">
                      {item.fullName} ({item.email})
                    </span>
                    <span className="text-slate-400">
                      {formatDate(item.createdAt, "MMM d, h:mm a")}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#EA580C]">
                    {item.subject}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {item.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {isSuperAdmin && (
          <div className="lg:col-span-6 rounded-sm border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Recent Administrative Activity
              </h2>
              <Link
                href="/admin/activity-logs"
                className="text-xs font-semibold text-[#EA580C] hover:underline"
              >
                View Full Audit Log &rarr;
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentLogs.map((log) => (
                <div key={log.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900">
                      {log.actorName}
                    </span>
                    <span className="text-slate-400">
                      {formatDate(log.createdAt, "MMM d, h:mm a")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{log.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

