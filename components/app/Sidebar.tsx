"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import Brand from "@/components/Brand";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/payroll", label: "Payroll", icon: FileText },
  { href: "/app/invoices", label: "Invoices", icon: FileText },
  { href: "/app/members", label: "Members", icon: Users },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`flex flex-col border-r border-hair bg-panel transition-all duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-hair">
        {!collapsed && <Brand />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-sub hover:text-ink transition-colors p-1"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors no-underline ${
                isActive
                  ? "bg-indigo/10 text-indigo"
                  : "text-sub hover:text-ink hover:bg-paper"
              }`}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
