"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";

export interface JoinWorkspaceResult {
  success: boolean;
  title: string;
  message: string;
}

export default function JoinWorkspaceStatusModal({ result, onClose }: { result: JoinWorkspaceResult | null; onClose: () => void }) {
  if (!result) return null;
  const SuccessIcon = result.success ? CheckCircle2 : AlertCircle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6" role="dialog" aria-modal="true" aria-labelledby="join-result-title">
      <div className="w-full max-w-md rounded-2xl border border-hair bg-panel p-6 text-center shadow-xl">
        <button onClick={onClose} className="absolute right-5 top-5 p-1 text-sub hover:text-ink" aria-label="Close dialog"><X size={18} /></button>
        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${result.success ? "bg-okgreen/10 text-okgreen" : "bg-red-100 text-red-700"}`}><SuccessIcon size={24} /></div>
        <h2 id="join-result-title" className="mt-5 text-xl font-semibold text-ink">{result.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-sub">{result.message}</p>
        <button onClick={onClose} className="mt-6 w-full rounded-lg bg-indigo px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110">Done</button>
      </div>
    </div>
  );
}
