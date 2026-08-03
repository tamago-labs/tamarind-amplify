"use client";

import { useSearchParams } from "next/navigation";
import Dashboard from "./Dashboard";
import OrganizationMembers from "./OrganizationMembers";
import PlaceholderPage from "./PlaceholderPage";

const titles: Record<string, string> = {
  workflows: "Workflows", wallets: "Wallets", payments: "Payments", invoices: "Invoices", "proof-explorer": "Proof Explorer", "knowledge-base": "Knowledge Base", receivable: "Receivable", identity: "Identity", "available-receivables": "Available Receivables", "due-diligence": "Due Diligence",
};

export default function DashboardRouter({ role, workspaceId, userId }: { role: string; workspaceId: string; userId: string }) {
  const page = useSearchParams().get("page") || "overview";
  if (page === "overview") return <Dashboard role={role} />;
  if (page === "organization-members" && (role === "admin" || role === "company")) return <OrganizationMembers workspaceId={workspaceId} adminId={userId} />;
  if (page === "organization-templates" && (role === "admin" || role === "company")) return <PlaceholderPage title="Templates" description="Reusable organization templates will be available here." />;
  return <PlaceholderPage title={titles[page] || "Overview"} />;
}
