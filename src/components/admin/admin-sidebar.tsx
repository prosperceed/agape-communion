"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Clock,
  Calendar,
  FileText,
  Mic,
  BookOpen,
  HeartHandshake,
  Radio,
  Image as ImageIcon,
  Users,
  Settings,
  Activity,
  LogOut,
  ExternalLink,
  Shield,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import type { AuthenticatedAdmin } from "@/types";

const CONTENT_ITEMS = [
  { href: "/admin/services", label: "Services", icon: Clock },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: Mic },
  { href: "/admin/devotionals", label: "Devotionals", icon: BookOpen },
  { href: "/admin/testimonies", label: "Testimonies", icon: HeartHandshake },
  { href: "/admin/livestream", label: "Livestream", icon: Radio },
] as const;

const SUPER_ADMIN_SYSTEM_ITEMS = [
  { href: "/admin/users", label: "Administrators", icon: Users },
  { href: "/admin/settings", label: "Church Settings", icon: Settings },
  { href: "/admin/activity-logs", label: "Activity Logs", icon: Activity },
] as const;

interface AdminSidebarProps {
  admin: AuthenticatedAdmin;
}

export function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();
  const isSuperAdmin = admin.role === "SUPER_ADMIN";

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      aria-label="Administrative Dashboard Navigation"
      className="w-full lg:w-64 shrink-0 bg-[#0B1325] text-slate-200 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10"
    >
      <div className="p-5 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image
              src="/assets/branding/logo-light.svg"
              alt="Agape Communion Logo"
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Agape Admin
              </p>
              <p className="text-[11px] font-medium text-[#F97316]">
                {isSuperAdmin ? "Super Admin" : "Editor Admin"}
              </p>
            </div>
          </Link>
        </div>

        <nav className="space-y-5">
          <div>
            <Link
              href="/admin"
              className={`flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-semibold transition-colors ${
                isActive("/admin")
                  ? "bg-[#EA580C] text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview</span>
            </Link>
          </div>

          <div className="space-y-1">
            {isSuperAdmin && (
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Content
              </p>
            )}
            {CONTENT_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-[#EA580C] text-white font-semibold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="space-y-1 border-t border-white/10 pt-3">
            <Link
              href="/admin/media"
              className={`flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-medium transition-colors ${
                isActive("/admin/media")
                  ? "bg-[#EA580C] text-white font-semibold"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              <span>Media Library</span>
            </Link>
          </div>

          {isSuperAdmin && (
            <div className="space-y-1 border-t border-white/10 pt-3">
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Administration
              </p>
              {SUPER_ADMIN_SYSTEM_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-[#EA580C] text-white font-semibold"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
      </div>

      <div className="p-5 border-t border-white/10 space-y-3 bg-[#080E1C]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[#F97316]">
            <Shield className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">
              {admin.name}
            </p>
            <p className="truncate text-[11px] text-slate-400">{admin.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-sm border border-white/15 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="h-3 w-3" />
            <span>Website</span>
          </Link>
          <button
            type="button"
            onClick={async () => {
              toast.info("Signing out...");
              await signOut({ callbackUrl: "/admin/login" });
            }}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-sm border border-white/15 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:bg-red-500/20 hover:text-red-200"
          >
            <LogOut className="h-3 w-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

