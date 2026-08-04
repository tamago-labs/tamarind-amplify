"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowDownToLine,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  FolderKanban,
  LayoutDashboard,
  Network,
  Receipt,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import Brand from "@/components/Brand";

const icons = {
  overview: LayoutDashboard,
  workflows: FolderKanban,
  wallets: Wallet,
  payments: ArrowDownToLine,
  invoices: Receipt,
  proof: FileCheck2,
  knowledge: BookOpen,
  receivable: CircleDollarSign,
  availableReceivables: CircleDollarSign,
  dueDiligence: ShieldCheck,
  identity: Users,
  organization: Network,
};

type NavItem = { page: string; label: string; icon: keyof typeof icons };

const navByRole: Record<string, NavItem[]> = {
  admin: [
    { page: "overview", label: "Overview", icon: "overview" },
    { page: "workflows", label: "Workflows", icon: "workflows" },
    { page: "identities", label: "Identities", icon: "identity" },
    { page: "payments", label: "Payments", icon: "payments" },
    { page: "invoices", label: "Invoices", icon: "invoices" },
    { page: "proof-explorer", label: "Proof Explorer", icon: "proof" },
    { page: "receivable", label: "Receivable", icon: "receivable" },
    { page: "organization-members", label: "Organization", icon: "organization" },
  ],
  company: [
    { page: "overview", label: "Overview", icon: "overview" },
    { page: "workflows", label: "Workflows", icon: "workflows" },
    { page: "identities", label: "Identities", icon: "identity" },
    { page: "payments", label: "Payments", icon: "payments" },
    { page: "invoices", label: "Invoices", icon: "invoices" },
    { page: "proof-explorer", label: "Proof Explorer", icon: "proof" },
    { page: "receivable", label: "Receivable", icon: "receivable" },
    { page: "organization-members", label: "Organization", icon: "organization" },
  ],
  counterParty: [
    { page: "overview", label: "Overview", icon: "overview" },
    { page: "identity", label: "Identity", icon: "identity" },
    { page: "payments", label: "Payments", icon: "payments" },
    { page: "invoices", label: "Invoices", icon: "invoices" },
    { page: "proof-explorer", label: "Proof Explorer", icon: "proof" },
  ],
  partner: [
    { page: "overview", label: "Overview", icon: "overview" },
    { page: "available-receivables", label: "Available Receivables", icon: "availableReceivables" },
    { page: "due-diligence", label: "Due Diligence", icon: "dueDiligence" },
    { page: "identity", label: "Identity", icon: "identity" },
    { page: "proof-explorer", label: "Proof Explorer", icon: "proof" },
  ],
};

export function getNavigation(role: string): NavItem[] {
  return navByRole[role] || [];
}

export default function Sidebar({ role, workspaceId }: { role: string; workspaceId: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const navItems = getNavigation(role);

  return (
    <aside className={`flex min-h-screen flex-col border-r border-hair bg-panel transition-all duration-200 ${collapsed ? "w-16" : "w-60"}`}>
      <div className="flex h-16 items-center justify-between border-b border-hair px-4">
        {!collapsed && <Brand href="/app" />}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 text-sub transition-colors hover:text-ink" aria-label="Toggle sidebar">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const Icon = icons[item.icon];
          const href = item.page === "organization-members"
            ? `/app/workspaces/${workspaceId}/organization/members`
            : item.page === "identity"
              ? `/app/workspaces/${workspaceId}/identity/identities`
              : item.page === "identities"
                ? `/app/workspaces/${workspaceId}/identities`
            : `/app/workspaces/${workspaceId}/${item.page}`;
          const active = pathname === href || (item.page === "organization-members" && pathname.startsWith(`/app/workspaces/${workspaceId}/organization`)) || (item.page === "identity" && pathname.startsWith(`/app/workspaces/${workspaceId}/identity`)) || (item.page === "identities" && pathname.startsWith(`/app/workspaces/${workspaceId}/identities`));
          return (
            <Link key={item.page} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-indigo/10 text-indigo" : "text-sub hover:bg-paper hover:text-ink"}`}>
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
