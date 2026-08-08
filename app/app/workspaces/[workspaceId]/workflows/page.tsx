"use client";

import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { useParams, useRouter } from "next/navigation";
import { FileText, Plus, Pencil, Trash2, ArrowRight } from "lucide-react";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

interface WorkflowRecord {
  id: string;
  name: string;
  description?: string | null;
  flowTypes: string[];
  status: string;
  version: number;
  createdAt?: string | null;
}

export default function WorkflowsPage() {
  const { user } = useAuthenticator((context) => [context.user]);
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const userId = user?.username || user?.userId || "";

  async function load() {
    setLoading(true);
    const { data: workflows } = await client.models.Workflow.list({
      filter: { workspaceId: { eq: workspaceId } },
    });
    const workflowList = workflows || [];
    const workflowsWithFlowTypes = await Promise.all(
      workflowList.map(async (w) => {
        const { data: connections } = await client.models.WorkflowConnection.list({
          filter: { workflowId: { eq: w.id } },
        });
        const flowTypes = Array.from(new Set((connections || []).map((c) => c.flowType).filter(Boolean))) as string[];
        return {
          id: w.id,
          name: w.name,
          description: w.description,
          flowTypes: flowTypes.length > 0 ? flowTypes : ["payment"],
          status: w.status || "draft",
          version: w.version || 1,
          createdAt: w.createdAt,
        };
      })
    );
    setWorkflows(workflowsWithFlowTypes);
    setLoading(false);
  }

  useEffect(() => {
    if (workspaceId) load();
  }, [workspaceId]);

  async function createWorkflow() {
    setCreating(true);
    const { data } = await client.models.Workflow.create({
      workspaceId,
      name: "New Workflow",
      flowType: "payment",
      status: "draft",
      version: 1,
      createdBy: userId,
      updatedBy: userId,
    });
    if (data) {
      router.push(`/app/workspaces/${workspaceId}/workflows/${data.id}`);
    }
    setCreating(false);
  }

  async function deleteWorkflow(id: string) {
    if (!confirm("Delete this workflow?")) return;
    await client.models.Workflow.delete({ id });
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-sub">Workspace</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Workflows</h1>
          <p className="mt-1 text-sm text-sub">Create and manage payment and invoice workflows.</p>
        </div>
        <button
          onClick={createWorkflow}
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo px-3 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
        >
          <Plus size={16} />
          {creating ? "Creating..." : "New Workflow"}
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-hair bg-panel p-10 text-center text-sm text-sub">
          Loading workflows...
        </div>
      ) : workflows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hair bg-panel p-12 text-center">
          <FileText size={28} className="mx-auto text-indigo" />
          <h2 className="mt-4 text-lg font-semibold text-ink">No workflows yet</h2>
          <p className="mt-2 text-sm text-sub">Create your first payment or invoice workflow.</p>
          <button
            onClick={createWorkflow}
            className="mt-5 rounded-lg bg-indigo px-4 py-2.5 text-sm font-semibold text-white"
          >
            New Workflow
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="flex items-center justify-between rounded-xl border border-hair bg-panel p-4 transition-colors hover:border-indigo-200"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo/10">
                  <FileText size={18} className="text-indigo" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">{workflow.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    {(workflow.flowTypes || []).length > 1 ? (
                      <span className="rounded-full bg-indigo/10 px-2 py-0.5 text-[10px] font-medium text-indigo">
                        Mixed
                      </span>
                    ) : (
                      <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] text-sub">
                        {(workflow.flowTypes || [])[0] === "payment" ? "Payment" : "Invoice"}
                      </span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${workflow.status === "published" ? "bg-okgreen/10 text-okgreen" : "bg-yellow-100 text-yellow-800"}`}>
                      {workflow.status}
                    </span>
                    <span className="text-[10px] text-sub">v{workflow.version}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/app/workspaces/${workspaceId}/workflows/${workflow.id}`)}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-indigo hover:bg-indigo/10"
                >
                  Open
                  <ArrowRight size={12} />
                </button>
                <button
                  onClick={() => deleteWorkflow(workflow.id)}
                  className="p-1.5 text-sub hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
