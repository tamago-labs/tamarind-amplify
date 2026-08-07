"use client";

import TokenRegistry from "@/components/app/token-registry/TokenRegistry";

export default function TokenRegistryPage() {
  // These would come from context/session in production
  const workspaceId = "current-workspace-id";
  const userRole = "company";

  return <TokenRegistry workspaceId={workspaceId} userRole={userRole} />;
}
