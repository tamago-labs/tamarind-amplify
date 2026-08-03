"use client";

import { useState } from "react";
import WorkspaceCard from "./WorkspaceCard";
import CreateWorkspaceCard from "./CreateWorkspaceCard";
import JoinWorkspaceCard from "./JoinWorkspaceCard";
import CreateWorkspaceModal from "./CreateWorkspaceModal";
import JoinWorkspaceModal from "./JoinWorkspaceModal";
import JoinWorkspaceStatusModal, { JoinWorkspaceResult } from "./JoinWorkspaceStatusModal";

interface Workspace {
  id: string;
  name: string;
  role: string;
}

interface WorkspaceSelectorProps {
  workspaces: Workspace[];
  onSelect: (workspaceId: string) => void;
  onCreate: (name: string, description: string) => void;
  onJoin: (inviteCode: string) => Promise<JoinWorkspaceResult>;
}

export default function WorkspaceSelector({
  workspaces,
  onSelect,
  onCreate,
  onJoin,
}: WorkspaceSelectorProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinResult, setJoinResult] = useState<JoinWorkspaceResult | null>(null);

  return (
    <div className="min-h-screen bg-panel flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-10">
            <p className="font-mono text-[11px] font-medium tracking-wide text-sub uppercase mb-3">
              Workspace
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight leading-tight mb-4">
              Select a{" "}
              <span className="text-indigo">Workspace</span>
            </h1>
            <p className="text-base text-sub max-w-lg mx-auto leading-relaxed">
              Choose a workspace to continue, or create a new one.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((ws) => (
              <WorkspaceCard
                key={ws.id}
                name={ws.name}
                role={ws.role}
                onClick={() => onSelect(ws.id)}
              />
            ))}
            <JoinWorkspaceCard onClick={() => setShowJoinModal(true)} />
            <CreateWorkspaceCard onClick={() => setShowCreateModal(true)} />
          </div>
        </div>
      </div>

      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={onCreate}
      />

      <JoinWorkspaceModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={async (inviteCode) => {
          const result = await onJoin(inviteCode);
          setJoinResult(result);
          return result;
        }}
      />
      <JoinWorkspaceStatusModal result={joinResult} onClose={() => setJoinResult(null)} />
    </div>
  );
}
