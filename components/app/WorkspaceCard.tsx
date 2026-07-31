"use client";

interface WorkspaceCardProps {
  name: string;
  role: string;
  onClick: () => void;
}

export default function WorkspaceCard({ name, role, onClick }: WorkspaceCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-hair rounded-xl p-6 text-left hover:border-indigo/40 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="w-10 h-10 rounded-lg bg-indigo/10 flex items-center justify-center mb-4">
        <span className="text-indigo font-semibold text-lg">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-ink mb-2">{name}</h3>
      <span className="inline-block text-xs font-medium text-sub bg-paper rounded-full px-2.5 py-1">
        {role}
      </span>
    </button>
  );
}
