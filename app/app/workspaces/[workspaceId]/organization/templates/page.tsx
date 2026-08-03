"use client";

import PlaceholderPage from "@/components/app/PlaceholderPage";
import { useWorkspace } from "@/components/app/WorkspaceContext";

export default function TemplatesPage() {
  const { role } = useWorkspace();
  if (role !== "admin" && role !== "company") return <PlaceholderPage title="Access restricted" description="This page is not available for your workspace role." />;
  return <PlaceholderPage title="Templates" description="Reusable organization templates will be available here." />;
}
