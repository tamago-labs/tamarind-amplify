"use client";

import { useEffect, useRef, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchUserAttributes } from "aws-amplify/auth";
import type { Schema } from "@/amplify/data/resource";
import WorkspaceSelector from "@/components/app/WorkspaceSelector";
import type { JoinWorkspaceResult } from "@/components/app/JoinWorkspaceStatusModal";

const client = generateClient<Schema>();

interface Workspace { id: string; name: string; role: string; status: string; inviteCode: string; }
function generateInviteCode() { return Math.random().toString(36).substring(2, 10).toUpperCase(); }
function isUserId(value?: string | null) { return Boolean(value && /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(value)); }

export default function AppPage() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const profileBootstrap = useRef<{ userId: string; promise: Promise<void> } | null>(null);
  const userId = user?.username || user?.userId || "";

  async function ensureUserProfile() {
    if (!userId) return;
    if (profileBootstrap.current?.userId === userId) {
      await profileBootstrap.current.promise;
      return;
    }

    const promise = (async () => {
      try {
      let attributes: Awaited<ReturnType<typeof fetchUserAttributes>> = {};
      try { attributes = await fetchUserAttributes(); } catch (error) { console.warn("Could not load user attributes:", error); }
      const nameFromParts = [attributes.given_name, attributes.family_name].filter(Boolean).join(" ");
      const displayName = attributes.name || nameFromParts || attributes.preferred_username || attributes.email || userId;
      const { data: profile } = await client.models.UserProfile.get({ id: userId });
      if (!profile) {
        const { errors } = await client.models.UserProfile.create({ id: userId, userId, displayName, avatarUrl: attributes.picture });
        if (errors?.length) console.error("Could not create user profile:", errors);
      } else if (isUserId(profile.displayName) && !isUserId(displayName)) {
        const { errors } = await client.models.UserProfile.update({ id: profile.id, displayName, avatarUrl: attributes.picture });
        if (errors?.length) console.error("Could not update user profile:", errors);
      }
      } catch (error) {
        console.error("Could not bootstrap user profile:", error);
      }
    })();

    profileBootstrap.current = { userId, promise };
    await promise;
  }

  async function loadWorkspaces() {
    if (!userId) { setLoading(false); return; }
    try {
      await ensureUserProfile();
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

  async function handleJoinWorkspace(inviteCode: string): Promise<JoinWorkspaceResult> {
    try {
      const { data: workspacesByCode } = await client.models.Workspace.list({ filter: { inviteCode: { eq: inviteCode } } });
      const workspace = workspacesByCode?.[0];
      if (!workspace) return { success: false, title: "Invalid invite code", message: "We could not find a workspace with that invite code. Check the code and try again." };
      const { data: existingMembership } = await client.models.WorkspaceMember.list({ filter: { workspaceId: { eq: workspace.id }, userId: { eq: userId } } });
      if (existingMembership?.length) return { success: false, title: "Already requested", message: "You already have access to, or have already requested access to, this workspace." };
      await client.models.WorkspaceMember.create({ workspaceId: workspace.id, userId, status: "pending" });
      await loadWorkspaces();
      return { success: true, title: "Request sent", message: "Your request is waiting for workspace admin approval. You will get access once a role is assigned." };
    } catch (error) { console.error("Error joining workspace:", error); return { success: false, title: "Request failed", message: "We could not send your request. Please try again." }; }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-panel"><p className="text-sub">Loading...</p></div>;
  return <><div className="fixed right-4 top-4 z-50"><button onClick={signOut} className="text-sm text-sub hover:text-ink">Sign out</button></div><WorkspaceSelector workspaces={workspaces} onSelect={(id) => { window.location.href = `/app/workspaces/${id}/overview`; }} onCreate={handleCreateWorkspace} onJoin={handleJoinWorkspace} /></>;
}
