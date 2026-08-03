"use client";

import CompanyIdentities from "@/components/app/CompanyIdentities";
import { useWorkspace } from "@/components/app/WorkspaceContext";

export default function CompanyIdentitiesPage() {
  const { role } = useWorkspace();
  if (role !== "admin" && role !== "company") return <p className="rounded-xl border border-hair bg-panel p-8 text-center text-sm text-sub">This page is not available for your workspace role.</p>;
  return <CompanyIdentities />;
}
