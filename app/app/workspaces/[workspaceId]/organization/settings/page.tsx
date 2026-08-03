"use client";

import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import type { Schema } from "@/amplify/data/resource";
import { useWorkspace } from "@/components/app/WorkspaceContext";

const client = generateClient<Schema>();

export default function OrganizationSettingsPage() {
  const { user } = useAuthenticator((context) => [context.user]);
  const { workspaceId, name, ownerId, role } = useWorkspace();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const userId = user?.username || user?.userId || "";
  const canDelete = role === "admin" && userId === ownerId;

  async function deleteWorkspace() {
    setDeleting(true);
    const { data: members } = await client.models.WorkspaceMember.list({ filter: { workspaceId: { eq: workspaceId } } });
    await Promise.all((members || []).map((member) => client.models.WorkspaceMember.delete({ id: member.id })));
    await client.models.Workspace.delete({ id: workspaceId });
    window.location.href = "/app";
  }

  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-sub">Organization</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Settings</h1>
        <p className="mt-1 text-sm text-sub">Manage workspace-level actions and data.</p>
      </div>

      <section className="rounded-xl border border-red-200 bg-panel">
        <div className="border-b border-red-100 px-5 py-4">
          <div className="flex items-center gap-2 text-red-700"><AlertTriangle size={17} /><h2 className="font-semibold">Danger zone</h2></div>
          <p className="mt-1 text-sm text-sub">Destructive actions for {name}.</p>
        </div>
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="font-medium text-ink">Delete workspace</p><p className="mt-1 max-w-xl text-sm text-sub">Permanently delete this workspace, its members, and all workspace data.</p></div>
          <button disabled={!canDelete} onClick={() => setShowDeleteModal(true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={16} /> Delete workspace</button>
        </div>
        {!canDelete && <p className="border-t border-red-100 px-5 py-3 text-xs text-sub">Only the workspace owner can delete this workspace.</p>}
      </section>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6" role="dialog" aria-modal="true" aria-labelledby="delete-workspace-title">
          <div className="w-full max-w-md rounded-xl bg-panel p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700"><AlertTriangle size={19} /></div><button onClick={() => setShowDeleteModal(false)} className="p-1 text-sub hover:text-ink" aria-label="Close dialog"><X size={18} /></button></div>
            <h2 id="delete-workspace-title" className="mt-5 text-xl font-semibold text-ink">Delete {name}?</h2>
            <p className="mt-2 text-sm leading-relaxed text-sub">This action cannot be undone. All members will lose access and the workspace will be permanently removed.</p>
            <div className="mt-6 flex justify-end gap-3"><button onClick={() => setShowDeleteModal(false)} className="rounded-lg border border-hair px-4 py-2 text-sm font-medium text-ink hover:bg-paper">Cancel</button><button disabled={deleting} onClick={deleteWorkspace} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{deleting ? "Deleting..." : "Delete workspace"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
