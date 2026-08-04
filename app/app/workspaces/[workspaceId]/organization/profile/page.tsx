"use client";

import OrganizationProfilePage from "@/components/app/OrganizationProfilePage";
import { useWorkspace } from "@/components/app/WorkspaceContext";

export default function CompanyProfileRoute() {
  const { role } = useWorkspace();
  if (role !== "admin" && role !== "company") return <p className="rounded-xl border border-hair bg-panel p-8 text-center text-sm text-sub">This page is not available for your workspace role.</p>;
  return <OrganizationProfilePage />;
}
