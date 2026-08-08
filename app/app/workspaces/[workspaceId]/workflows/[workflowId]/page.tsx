"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { useParams } from "next/navigation";
import type { Schema } from "@/amplify/data/resource";
import FlowBuilder from "@/components/canvas/FlowBuilder";

const client = generateClient<Schema>();

export default function WorkflowCanvasPage() {
  const { workspaceId, workflowId } = useParams<{ workspaceId: string; workflowId: string }>();
  const [workflow, setWorkflow] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await client.models.Workflow.get({ id: workflowId });
      if (data) {
        setWorkflow({ name: data.name });
      }
      setLoading(false);
    }
    load();
  }, [workflowId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-500">Loading workflow...</p>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-500">Workflow not found</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <FlowBuilder
        workflowId={workflowId}
        workspaceId={workspaceId}
        workflowName={workflow.name}
      />
    </div>
  );
}
