"use client";

import TokenBalances from "./overview/TokenBalances";

interface DashboardProps {
  role: string;
  workspaceId: string;
}

export default function Dashboard({ role, workspaceId }: DashboardProps) {
  return (
    <div>
      <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-sub">Overview</p>
      <h1 className="mt-2 text-2xl font-semibold text-ink mb-6">Workspace overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-paper border border-hair rounded-xl p-6">
          <p className="text-sm text-sub mb-2">Workspace role</p>
          <p className="text-2xl font-semibold capitalize text-ink">{role}</p>
        </div>
        <div className="bg-paper border border-hair rounded-xl p-6">
          <p className="text-sm text-sub mb-2">Pending Invites</p>
          <p className="text-3xl font-semibold text-ink">0</p>
        </div>
        <div className="bg-paper border border-hair rounded-xl p-6">
          <p className="text-sm text-sub mb-2">RWAs Issued</p>
          <p className="text-3xl font-semibold text-ink">0</p>
        </div>
      </div>
      <TokenBalances workspaceId={workspaceId} />
    </div>
  );
}
