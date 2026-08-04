"use client";

import KybPage from "@/components/app/KybPage";
import { useWorkspace } from "@/components/app/WorkspaceContext";

export default function KybRoute() {
  const { role } = useWorkspace();
  if (role !== "admin" && role !== "company") return <p className="rounded-xl border border-hair bg-panel p-8 text-center text-sm text-sub">This page is not available for your workspace role.</p>;
  return <KybPage />;
}
