"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { useRouter } from "next/navigation";
import type { Schema } from "@/amplify/data/resource";
import AppLayout from "@/components/app/AppLayout";
import PendingApproval from "@/components/app/PendingApproval";
import { WorkspaceProvider } from "@/components/app/WorkspaceContext";

const client = generateClient<Schema>();

export default function WorkspaceLayout({ children, params }: { children: ReactNode; params: { workspaceId: string } }) {
  const { user } = useAuthenticator((context) => [context.user]);
  const router = useRouter();
  const [state, setState] = useState<{ name: string; role: string; status: string; inviteCode: string; ownerId: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = user?.username || user?.userId || "";

  useEffect(() => {
    async function loadWorkspace() {
      if (!userId) return;
      const { data: memberships } = await client.models.WorkspaceMember.list({ filter: { workspaceId: { eq: params.workspaceId }, userId: { eq: userId } } });
      const membership = memberships?.[0];
      if (!membership) { router.replace("/app"); return; }
      const { data: workspace } = await client.models.Workspace.get({ id: params.workspaceId });
      if (!workspace) { router.replace("/app"); return; }
      setState({ name: workspace.name, role: membership.role || "pending", status: membership.status || "pending", inviteCode: workspace.inviteCode, ownerId: workspace.ownerId });
      setLoading(false);
    }
    loadWorkspace();
  }, [params.workspaceId, userId, router]);

  if (loading || !state) return <div className="flex min-h-screen items-center justify-center bg-panel"><p className="text-sub">Loading workspace...</p></div>;
  if (state.status === "pending" || state.role === "pending") return <PendingApproval workspaceName={state.name} />;
  return <WorkspaceProvider value={{ workspaceId: params.workspaceId, ...state }}><AppLayout workspaceId={params.workspaceId} workspaceName={state.name} role={state.role} inviteCode={state.inviteCode}>{children}</AppLayout></WorkspaceProvider>;
}
