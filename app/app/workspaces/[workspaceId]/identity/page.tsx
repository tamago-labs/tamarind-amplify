import { redirect } from "next/navigation";

export default function IdentityPage({ params }: { params: { workspaceId: string } }) {
  redirect(`/app/workspaces/${params.workspaceId}/identity/identities`);
}
