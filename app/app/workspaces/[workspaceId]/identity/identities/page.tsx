"use client";

import { useWorkspace } from "@/components/app/WorkspaceContext";
import CounterpartyIdentities from "@/components/app/CounterpartyIdentities";
import CompanyIdentities from "@/components/app/CompanyIdentities";

export default function IdentitiesPage() {
  const { role } = useWorkspace();
  return role === "admin" || role === "company" ? <CompanyIdentities /> : <CounterpartyIdentities />;
}
