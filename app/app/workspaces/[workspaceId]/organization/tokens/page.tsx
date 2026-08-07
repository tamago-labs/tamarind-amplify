"use client";

import { useParams } from "next/navigation";
import { useAuthenticator } from "@aws-amplify/ui-react";
import TokenRegistry from "@/components/app/token-registry/TokenRegistry";

export default function TokenRegistryPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { user } = useAuthenticator((context) => [context.user]);

  // In production, get userRole from workspace membership
  const userRole = "company";

  return <TokenRegistry workspaceId={workspaceId} userRole={userRole} />;
}
