"use client";

import { useParams } from "next/navigation";
import PlaceholderPage from "@/components/app/PlaceholderPage";
import { useWorkspace } from "@/components/app/WorkspaceContext";

const titles: Record<string, string> = {
  workflows: "Workflows", wallets: "Wallets", identities: "Identities", payments: "Payments", invoices: "Invoices", "proof-explorer": "Proof Explorer", "knowledge-base": "Knowledge Base", receivable: "Receivable", identity: "Identity", "available-receivables": "Available Receivables", "due-diligence": "Due Diligence",
};
const pagesByRole: Record<string, string[]> = {
  admin: ["workflows", "wallets", "identities", "payments", "invoices", "proof-explorer", "knowledge-base", "receivable"],
  company: ["workflows", "wallets", "identities", "payments", "invoices", "proof-explorer", "knowledge-base", "receivable"],
  counterParty: ["identity", "payments", "invoices", "proof-explorer", "knowledge-base"],
  partner: ["available-receivables", "due-diligence", "identity", "proof-explorer", "knowledge-base"],
};

export default function WorkspacePlaceholderPage() {
  const page = useParams<{ page: string }>().page;
  const { role } = useWorkspace();
  if (!pagesByRole[role]?.includes(page)) return <PlaceholderPage title="Access restricted" description="This page is not available for your workspace role." />;
  return <PlaceholderPage title={titles[page] || "Workspace page"} />;
}
