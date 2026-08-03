"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import InvitePopover from "./InvitePopover";
import UserMenu from "./UserMenu";

interface AppLayoutProps {
  children: ReactNode;
  workspaceName: string;
  pendingMessage?: string;
  role: string;
  inviteCode: string;
  workspaceId: string;
}

export default function AppLayout({
  children,
  workspaceName,
  pendingMessage,
  role,
  inviteCode,
  workspaceId,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-panel flex">
      <Sidebar role={role} workspaceId={workspaceId} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b border-hair bg-panel">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] font-medium text-sub uppercase tracking-wide">
              Workspace
            </span>
            <span className="text-sm font-semibold text-ink">{workspaceName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-indigo/10 px-2.5 py-1 text-xs font-medium capitalize text-indigo sm:inline-flex">{role}</span>
            {role === "admin" && <InvitePopover inviteCode={inviteCode} />}
            <UserMenu />
          </div>
        </header>

        {pendingMessage && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
            <p className="text-sm text-yellow-800">
              {pendingMessage}
            </p>
          </div>
        )}

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
