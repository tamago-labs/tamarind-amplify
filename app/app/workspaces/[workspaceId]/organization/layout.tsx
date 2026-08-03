"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { FileStack, Settings2, Users } from "lucide-react";

export default function OrganizationLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const basePath = `/app/workspaces/${workspaceId}/organization`;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <aside className="w-full shrink-0 lg:w-52">
        <div className="mb-4">
          <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-sub">Organization</p>
          <h2 className="mt-2 text-lg font-semibold text-ink">Workspace setup</h2>
        </div>
        <nav className="flex gap-2 overflow-x-auto lg:block lg:space-y-1">
          <Link
            href={`${basePath}/members`}
            className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${pathname === `${basePath}/members` ? "bg-indigo/10 text-indigo" : "text-sub hover:bg-paper hover:text-ink"}`}
          >
            <Users size={17} />
            Members
          </Link>
          <Link
            href={`${basePath}/settings`}
            className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${pathname === `${basePath}/settings` ? "bg-indigo/10 text-indigo" : "text-sub hover:bg-paper hover:text-ink"}`}
          >
            <Settings2 size={17} />
            Settings
          </Link>
          <Link
            href={`${basePath}/templates`}
            className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${pathname === `${basePath}/templates` ? "bg-indigo/10 text-indigo" : "text-sub hover:bg-paper hover:text-ink"}`}
          >
            <FileStack size={17} />
            Templates
          </Link>
        </nav>
      </aside>
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
