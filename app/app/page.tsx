"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import type { Schema } from "@/amplify/data/resource";
import WorkspaceSelector from "@/components/app/WorkspaceSelector";

const client = generateClient<Schema>();

interface Workspace { id: string; name: string; role: string; status: string; inviteCode: string; }
function generateInviteCode() { return Math.random().toString(36).substring(2, 10).toUpperCase(); }

export default function AppPage() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = user?.username || user?.userId || "";

  async function loadWorkspaces() {
    if (!userId) { setLoading(false); return; }
    try {
      const { data: memberships } = await client.models.WorkspaceMember.list({ filter: { userId: { eq: userId } } });
      const workspaceList: Workspace[] = [];
      for (const membership of memberships || []) {
        if (!membership.workspaceId) continue;
        const { data: workspace } = await client.models.Workspace.get({ id: membership.workspaceId });
        if (workspace) workspaceList.push({ id: workspace.id, name: workspace.name, role: membership.role || "pending", status: membership.status || "pending", inviteCode: workspace.inviteCode });
      }
      setWorkspaces(workspaceList);
    } catch (error) { console.error("Error loading workspaces:", error); } finally { setLoading(false); }
  }

  useEffect(() => { loadWorkspaces(); }, [userId]);

  async function handleCreateWorkspace(name: string, description: string) {
    try {
      const inviteCode = generateInviteCode();
      const { data: workspace } = await client.models.Workspace.create({ name, description, inviteCode, ownerId: userId });
      if (workspace) {
        await client.models.WorkspaceMember.create({ workspaceId: workspace.id, userId, role: "admin", status: "active" });
        await loadWorkspaces();
      }
    } catch (error) { console.error("Error creating workspace:", error); }
  }

  async function handleJoinWorkspace(inviteCode: string) {
    try {
      const { data: workspacesByCode } = await client.models.Workspace.list({ filter: { inviteCode: { eq: inviteCode } } });
      const workspace = workspacesByCode?.[0];
      if (!workspace) { alert("Invalid invite code."); return; }
      const { data: existingMembership } = await client.models.WorkspaceMember.list({ filter: { workspaceId: { eq: workspace.id }, userId: { eq: userId } } });
      if (existingMembership?.length) { alert("You are already a member of this workspace."); return; }
      await client.models.WorkspaceMember.create({ workspaceId: workspace.id, userId, status: "pending" });
      alert("Request sent! Waiting for admin approval.");
      await loadWorkspaces();
    } catch (error) { console.error("Error joining workspace:", error); }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-panel"><p className="text-sub">Loading...</p></div>;
  return <><div className="fixed right-4 top-4 z-50"><button onClick={signOut} className="text-sm text-sub hover:text-ink">Sign out</button></div><WorkspaceSelector workspaces={workspaces} onSelect={(id) => { window.location.href = `/app/workspaces/${id}/overview`; }} onCreate={handleCreateWorkspace} onJoin={handleJoinWorkspace} /></>;
}
