"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";

const PRIMARY_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/messages", label: "Messages" },
  { href: "/testimonies", label: "Testimonies" },
  { href: "/livestream", label: "Livestream" },
  { href: "/contact", label: "Contact" },
] as const;

const DROPDOWN_LINKS = [
  {
    href: "/blog",
    label: "Blog",
    description: "Articles and biblical reflections",
    icon: NewspaperIcon,
  },
  {
    href: "/events",
    label: "Events",
    description: "Upcoming conferences and gatherings",
    icon: CalendarDaysIcon,
  },
  {
    href: "/devotionals",
    label: "Devotionals",
    description: "Daily Scripture readings and prayer",
    icon: BookOpenIcon,
  },
] as const;

interface PublicNavbarProps {
  churchName: string;
}

export function PublicNavbar({ churchName }: PublicNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isDropdownActive = DROPDOWN_LINKS.some((item) => isActive(item.href));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#0B1325] text-white border-b border-white/10">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] rounded-sm"
        >
          <Image
            src="/assets/branding/logo-light.svg"
            alt={`${churchName} Logo`}
            width={34}
            height={34}
            className="h-8 w-8"
          />
          <span className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
            {churchName}
          </span>
        </Link>

        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-6"
        >
          {PRIMARY_LINKS.slice(0, 3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-[#F97316]"
                  : "text-slate-200 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              onClick={() => setDropdownOpen((prev) => !prev)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setDropdownOpen(false);
              }}
              className={`inline-flex items-center gap-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EA580C] rounded-sm ${
                isDropdownActive
                  ? "text-[#F97316]"
                  : "text-slate-200 hover:text-white"
              }`}
            >
              <span>Resources</span>
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                aria-label="Resources submenu"
                className="absolute left-0 mt-3 w-64 rounded-sm border border-slate-200 bg-white p-2 text-slate-900 shadow-lg"
              >
                {DROPDOWN_LINKS.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                      className={`flex items-start gap-3 rounded-sm p-2.5 transition-colors ${
                        active
                          ? "bg-orange-50 text-[#EA580C]"
                          : "hover:bg-slate-50 text-slate-800"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0 text-[#EA580C] mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-xs text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {PRIMARY_LINKS.slice(3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-[#F97316]"
                  : "text-slate-200 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/contact"
            className="inline-flex h-10 items-center justify-center rounded-sm bg-[#EA580C] px-5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#D94E07]"
          >
            Plan a Visit
          </Link>
        </div>

        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="lg:hidden inline-flex items-center justify-center rounded-sm p-2 text-slate-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          aria-label="Mobile Navigation"
          className="lg:hidden border-t border-white/10 bg-[#0B1325] px-4 pt-3 pb-6 space-y-1"
        >
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-sm px-3 py-2.5 text-sm font-medium ${
                isActive(link.href)
                  ? "bg-white/10 text-[#F97316]"
                  : "text-slate-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setMobileDropdownOpen((prev) => !prev)}
              className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400"
            >
              <span>Resources</span>
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${
                  mobileDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {mobileDropdownOpen && (
              <div className="space-y-1 pl-2">
                {DROPDOWN_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block rounded-sm px-3 py-2 text-sm font-medium ${
                      isActive(item.href)
                        ? "bg-white/10 text-[#F97316]"
                        : "text-slate-200 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4">
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-10 w-full items-center justify-center rounded-sm bg-[#EA580C] px-5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#D94E07]"
            >
              Plan a Visit
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

