"use client";

import Dashboard from "@/components/app/Dashboard";
import { useWorkspace } from "@/components/app/WorkspaceContext";

export default function OverviewPage() {
  const { role } = useWorkspace();
  return <Dashboard role={role} />;
}
