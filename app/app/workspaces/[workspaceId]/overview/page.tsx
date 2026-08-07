"use client";

import { useParams } from "next/navigation";
import Dashboard from "@/components/app/Dashboard";
import { useWorkspace } from "@/components/app/WorkspaceContext";

export default function OverviewPage() {
  const { role } = useWorkspace();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  return <Dashboard role={role} workspaceId={workspaceId} />;
}
