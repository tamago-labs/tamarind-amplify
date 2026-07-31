"use client";

import { Plus } from "lucide-react";

interface CreateWorkspaceCardProps {
  onClick: () => void;
}

export default function CreateWorkspaceCard({ onClick }: CreateWorkspaceCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-paper border border-dashed border-hair rounded-xl p-6 text-left hover:border-indigo/40 hover:bg-indigo/5 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[160px]"
    >
      <div className="w-10 h-10 rounded-lg bg-indigo/10 flex items-center justify-center mb-4">
        <Plus size={20} className="text-indigo" />
      </div>
      <h3 className="text-lg font-semibold text-ink mb-1">Create Workspace</h3>
      <p className="text-sm text-sub">Set up a new workspace</p>
    </button>
  );
}
