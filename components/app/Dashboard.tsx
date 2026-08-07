"use client";

import TokenBalances from "./overview/TokenBalances";

interface DashboardProps {
  role: string;
  workspaceId: string;
}

export default function Dashboard({ role, workspaceId }: DashboardProps) {
  return (
    <div>
      <TokenBalances workspaceId={workspaceId} />
    </div>
  );
}
