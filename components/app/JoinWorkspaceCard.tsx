"use client";

import { LogIn } from "lucide-react";

interface JoinWorkspaceCardProps {
  onClick: () => void;
}

export default function JoinWorkspaceCard({ onClick }: JoinWorkspaceCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-paper border border-dashed border-hair rounded-xl p-6 text-left hover:border-indigo/40 hover:bg-indigo/5 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[160px]"
    >
      <div className="w-10 h-10 rounded-lg bg-indigo/10 flex items-center justify-center mb-4">
        <LogIn size={20} className="text-indigo" />
      </div>
      <h3 className="text-lg font-semibold text-ink mb-1">Join Workspace</h3>
      <p className="text-sm text-sub">Enter an invite code</p>
    </button>
  );
}
