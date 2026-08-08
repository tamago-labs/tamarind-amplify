"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { useParams } from "next/navigation";
import { CircleDollarSign, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  created: { label: "Draft", color: "text-sub bg-surface", icon: Clock },
  funding: { label: "Funding", color: "text-amber-700 bg-amber-50", icon: Clock },
  funded: { label: "Funded", color: "text-blue-700 bg-blue-50", icon: CheckCircle },
  repaid: { label: "Repaid", color: "text-green-700 bg-green-50", icon: CheckCircle },
  defaulted: { label: "Defaulted", color: "text-red-700 bg-red-50", icon: AlertCircle },
  closed: { label: "Closed", color: "text-sub bg-surface", icon: CheckCircle },
};

export default function ReceivablePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const [receivables, setReceivables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceivables();
  }, [workspaceId]);

  async function loadReceivables() {
    try {
      const result = await client.models.Receivable.list({
        filter: { workspaceId: { eq: workspaceId } },
      });
      setReceivables(result.data || []);
    } catch (e) {
      console.error("Failed to load receivables:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Receivables</h1>
          <p className="mt-1 text-sm text-sub">Manage receivables and financing</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-indigo px-4 py-2 text-sm font-medium text-white hover:bg-indigo/90">
          <Plus size={16} />
          Create Receivable
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sub">Loading...</div>
      ) : receivables.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-hair py-16">
          <CircleDollarSign size={40} className="text-sub" />
          <p className="mt-4 text-sm font-medium text-ink">No receivables yet</p>
          <p className="mt-1 text-xs text-sub">Create a receivable to start financing</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-hair">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-hair bg-surface">
              <tr>
                <th className="px-4 py-3 font-medium text-sub">Status</th>
                <th className="px-4 py-3 font-medium text-sub">Funding Target</th>
                <th className="px-4 py-3 font-medium text-sub">Repayment</th>
                <th className="px-4 py-3 font-medium text-sub">Due Date</th>
                <th className="px-4 py-3 font-medium text-sub">Funded</th>
                <th className="px-4 py-3 font-medium text-sub">Manager</th>
              </tr>
            </thead>
            <tbody>
              {receivables.map((r) => {
                const cfg = statusConfig[r.status] || statusConfig.created;
                const Icon = cfg.icon;
                const fundedPct = r.totalFunded && r.fundingTarget
                  ? Math.round((Number(r.totalFunded) / Number(r.fundingTarget)) * 100)
                  : 0;
                return (
                  <tr key={r.id} className="border-b border-hair last:border-0 hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
                        <Icon size={12} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">{r.fundingTarget} aJPYC</td>
                    <td className="px-4 py-3 text-ink">{r.repaymentAmount} aJPYC</td>
                    <td className="px-4 py-3 text-sub">{new Date(r.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-surface">
                          <div className="h-1.5 rounded-full bg-indigo" style={{ width: `${fundedPct}%` }} />
                        </div>
                        <span className="text-xs text-sub">{fundedPct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-sub">{r.managerAddress?.slice(0, 6)}...{r.managerAddress?.slice(-4)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
