"use client";

import { useState } from "react";
import { Check, Copy, UserPlus } from "lucide-react";

export default function InvitePopover({ inviteCode }: { inviteCode: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyInviteCode() {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-lg border border-hair bg-panel px-3 py-2 text-sm font-medium text-ink hover:border-indigo/40 transition-colors"
      >
        <UserPlus size={16} className="text-indigo" />
        Invite members
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-20 w-72 rounded-xl border border-hair bg-panel p-4 shadow-lg">
          <p className="text-sm font-semibold text-ink">Workspace invite code</p>
          <p className="mt-1 text-xs leading-relaxed text-sub">
            Share this code with someone who should request access to this workspace.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-paper p-2">
            <code className="flex-1 px-2 font-mono text-sm font-semibold tracking-[0.18em] text-ink">
              {inviteCode}
            </code>
            <button
              onClick={copyInviteCode}
              className="rounded-md p-2 text-sub hover:bg-panel hover:text-indigo transition-colors"
              aria-label="Copy invite code"
            >
              {copied ? <Check size={16} className="text-okgreen" /> : <Copy size={16} />}
            </button>
          </div>
          {copied && <p className="mt-2 text-xs text-okgreen">Copied to clipboard</p>}
        </div>
      )}
    </div>
  );
}
