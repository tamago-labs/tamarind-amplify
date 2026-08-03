"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { LockKeyhole, Users } from "lucide-react";

const client = generateClient<Schema>();
const assignableRoles = ["company", "counterParty", "partner"] as const;
type AssignableRole = (typeof assignableRoles)[number];

type Member = {
  id: string;
  userId: string;
  role: string | null;
  status: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  displayName?: string;
};

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) : "-";
}

export default function OrganizationMembers({ workspaceId, adminId }: { workspaceId: string; adminId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function loadMembers() {
    setLoading(true);
    const { data } = await client.models.WorkspaceMember.list({ filter: { workspaceId: { eq: workspaceId } } });
    const withProfiles = await Promise.all((data || []).map(async (member) => {
      const { data: profiles } = await client.models.UserProfile.list({ filter: { userId: { eq: member.userId } } });
      return {
        ...member,
        displayName: profiles?.[0]?.displayName || member.userId,
      };
    }));
    setMembers(withProfiles as Member[]);
    setLoading(false);
  }

  useEffect(() => { loadMembers(); }, [workspaceId]);

  async function assignRole(member: Member, role: AssignableRole) {
    setSavingId(member.id);
    await client.models.WorkspaceMember.update({
      id: member.id,
      role,
      status: "active",
      assignedAt: new Date().toISOString(),
      assignedBy: adminId,
    });
    await loadMembers();
    setSavingId(null);
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div><p className="font-mono text-[11px] font-medium uppercase tracking-wide text-sub">Organization</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Members</h1><p className="mt-1 text-sm text-sub">Manage access and workspace roles.</p></div>
        <div className="flex items-center gap-2 rounded-lg bg-indigo/10 px-3 py-2 text-xs font-medium text-indigo"><Users size={15} /> {members.length} members</div>
      </div>
      <div className="mb-5 flex gap-2 border-b border-hair pb-3">
        <a href="/app?page=organization-members" className="rounded-md bg-indigo px-3 py-2 text-sm font-medium text-white">Members</a>
        <a href="/app?page=organization-templates" className="rounded-md px-3 py-2 text-sm font-medium text-sub hover:bg-paper hover:text-ink">Templates</a>
      </div>
      <div className="overflow-x-auto rounded-xl border border-hair bg-panel">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-hair bg-paper/60 text-xs uppercase tracking-wide text-sub"><tr><th className="px-5 py-4 font-medium">Member</th><th className="px-5 py-4 font-medium">Status</th><th className="px-5 py-4 font-medium">Role</th><th className="px-5 py-4 font-medium">Created</th><th className="px-5 py-4 font-medium">Updated</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-5 py-10 text-center text-sub">Loading members...</td></tr>}
            {!loading && members.map((member) => {
              const isAdmin = member.userId === adminId || member.role === "admin";
              return <tr key={member.id} className="border-b border-hair last:border-0">
                <td className="px-5 py-4"><p className="font-medium text-ink">{member.displayName}</p><p className="mt-1 text-xs text-sub">{member.userId}</p></td>
                <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${member.status === "active" ? "bg-okgreen/10 text-okgreen" : "bg-yellow-100 text-yellow-800"}`}>{member.status || "pending"}</span></td>
                <td className="px-5 py-4">{isAdmin ? <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink"><LockKeyhole size={14} className="text-sub" /> Admin</span> : <select value={member.role || ""} disabled={savingId === member.id} onChange={(event) => assignRole(member, event.target.value as AssignableRole)} className="rounded-md border border-hair bg-panel px-2.5 py-2 text-sm text-ink outline-none focus:border-indigo"><option value="" disabled>Assign role</option>{assignableRoles.map((role) => <option key={role} value={role}>{role === "counterParty" ? "Counter-party" : role[0].toUpperCase() + role.slice(1)}</option>)}</select>}</td>
                <td className="px-5 py-4 text-sub">{formatDate(member.createdAt)}</td><td className="px-5 py-4 text-sub">{formatDate(member.updatedAt)}</td>
              </tr>;
            })}
            {!loading && members.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-sub">No members found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
