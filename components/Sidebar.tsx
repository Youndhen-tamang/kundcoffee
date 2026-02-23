"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Table2,
  ChevronDown,
  ChevronRight,
  UtensilsCrossed,
  QrCode,
  Map,
  Settings,
  LogOut,
  Coffee,
  Database,
  Tag,
  Layers,
  Puzzle,
  Package,
  Users,
} from "lucide-react";

export default function Sidebar() {
  const { data: session } = useSession(); // 2. Get session data
  
  // 3. Helper to get initials (e.g., "Bhuban Acharya" -> "BA")
  const getInitials = (name?: string | null) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>(
    pathname.includes("menu")
      ? "menu"
      : pathname.includes("tables") ||
          pathname.includes("spaces") ||
          pathname.includes("qrcodes")
        ? "core"
        : null,
  );

  const isActive = (path: string) => pathname === path;

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const NavItem = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string;
    icon: any;
    label: string;
  }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          active
            ? "bg-zinc-500 text-white shadow-sm"
            : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"
        }`}
      >
        <Icon size={18} />
        {label}
      </Link>
    );
  };

  const AccordionItem = ({
    id,
    label,
    icon: Icon,
    children,
  }: {
    id: string;
    label: string;
    icon: any;
    children: React.ReactNode;
  }) => {
    const isOpen = openSection === id;
    const hasActiveChild =
      pathname.includes(id === "core" ? "tables" : id) ||
      pathname.includes("spaces") ||
      pathname.includes("qrcodes");

    return (
      <div className="space-y-1">
        <button
          onClick={() => toggleSection(id)}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isOpen || hasActiveChild
              ? "text-zinc-900 bg-zinc-50"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <Icon size={18} />
            {label}
          </div>
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {isOpen && <div className="ml-9 space-y-1 pr-2">{children}</div>}
      </div>
    );
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white border-r border-zinc-100 flex flex-col z-20">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2 py-1 mb-10">
          <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Coffee size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-zinc-900 leading-none">
              Kund
            </h1>
            <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">
              Coffee
            </span>
          </div>
        </div>

        <nav className="space-y-8">
          <div>
            {/* <span className="px-4 text-[9px] font-semibold text-zinc-500 uppercase tracking-widest mb-4 block">
              Menu
            </span> */}
            <div className="space-y-1">
              <div className="mb-8 border-b border-gray-300 flex flex-col gap-2 pb-4">
                <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem href="/dashboard/orders" icon={Package} label="Orders" />
              </div>

              <AccordionItem id="menu" label="Menu" icon={UtensilsCrossed}>
                <NavItem
                  href="/dashboard/menu/categories"
                  icon={Tag}
                  label="Categories"
                />
                <NavItem
                  href="/dashboard/menu/sub-menus"
                  icon={Layers}
                  label="Sub Categories"
                />
                <NavItem
                  href="/dashboard/menu/dishes"
                  icon={UtensilsCrossed}
                  label="Dishes"
                />

                <NavItem href="/dashboard/menu/addons" icon={Puzzle} label="Add-ons" />
                <NavItem
                  href="/dashboard/menu/combos"
                  icon={Package}
                  label="Combos Set"
                />
                {/* <NavItem href="/menu/sets" icon={Coffee} label="Menu Sets" /> */}
              </AccordionItem>

              <AccordionItem id="core" label="Tables" icon={Database}>
                <NavItem href="/dashboard/spaces" icon={Map} label="Spaces" />
                <NavItem href="/dashboard/tables" icon={Table2} label="Tables" />
                <NavItem href="/dashboard/qrcodes" icon={QrCode} label="QR Codes" />
              </AccordionItem>

              <NavItem href="/dashboard/customers" icon={Users} label="Customers" />
              <NavItem href="/dashboard/finance" icon={Database} label="Finance" />
            </div>
          </div>

          <div>
            <span className="px-4 text-[9px] font-semibold text-zinc-500 uppercase tracking-widest mb-4 block">
              Settings
            </span>
            <div className="space-y-1">
              <NavItem href="/dashboard/settings" icon={Settings} label="General" />
            </div>
          </div>
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-zinc-50 space-y-2">
        {/* User Profile Info */}
        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 rounded-2xl border border-zinc-100 mb-2">
          <div className="w-9 h-9 bg-zinc-900 rounded-xl flex items-center justify-center text-white font-black text-xs">
            JD
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-zinc-900 leading-none">
              {session?.user.email}
            </span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">
              {session?.user.role}
            </span>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-all group"
        >
          <LogOut
            size={18}
            className="transition-transform group-hover:-translate-x-1"
          />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
