"use client";

import { Clock3 } from "lucide-react";

export default function PendingApproval({ workspaceName }: { workspaceName: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-md rounded-2xl border border-hair bg-panel p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo/10 text-indigo">
          <Clock3 size={22} />
        </div>
        <p className="mt-6 font-mono text-[11px] font-medium uppercase tracking-wide text-sub">{workspaceName}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Waiting for approval</h1>
        <p className="mt-3 text-sm leading-relaxed text-sub">
          Your request to join this workspace was received. A workspace admin must assign your role before you can access the workspace.
        </p>
      </div>
    </div>
  );
}
