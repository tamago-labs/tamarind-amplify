"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Repeat2 } from "lucide-react";
import { useAuthenticator } from "@aws-amplify/ui-react";

export default function UserMenu() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [open, setOpen] = useState(false);
  const identity = user?.username || user?.userId || "User";
  const initials = identity.slice(0, 2).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo text-xs font-semibold text-white hover:brightness-110"
        aria-label="Open account menu"
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-20 w-56 rounded-xl border border-hair bg-panel p-2 shadow-lg">
          <div className="border-b border-hair px-3 py-2">
            <p className="truncate text-sm font-medium text-ink">{identity}</p>
            <p className="mt-1 text-xs text-sub">Signed in account</p>
          </div>
          <Link href="/app" className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sub hover:bg-paper hover:text-ink">
            <Repeat2 size={15} />
            Switch workspace
          </Link>
          <button onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sub hover:bg-paper hover:text-ink">
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
