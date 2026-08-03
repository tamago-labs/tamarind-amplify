import { redirect } from "next/navigation";

export default function OrganizationPage({ params }: { params: { workspaceId: string } }) {
  redirect(`/app/workspaces/${params.workspaceId}/organization/members`);
}
