"use client";

import { useAuthenticator } from "@aws-amplify/ui-react";
import { useParams } from "next/navigation";
import OrganizationMembers from "@/components/app/OrganizationMembers";

export default function MembersPage() {
  const { user } = useAuthenticator((context) => [context.user]);
  const { workspaceId } = useParams<{ workspaceId: string }>();
  return <OrganizationMembers workspaceId={workspaceId} adminId={user?.username || user?.userId || ""} />;
}
