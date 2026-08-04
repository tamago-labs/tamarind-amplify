"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { FileCheck2, Upload } from "lucide-react";
import { useParams } from "next/navigation";
import type { Schema } from "@/amplify/data/resource";
import { kybStatuses, statusLabel } from "@/lib/organizationOptions";

const client = generateClient<Schema>();
const documentTypes = ["Certificate of incorporation", "Business registration", "Proof of address", "Tax document", "Director document"];

export default function KybPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [status, setStatus] = useState<(typeof kybStatuses)[number]>("notStarted");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { async function load() { const { data } = await client.models.KYBProfile.get({ id: workspaceId }); if (data) { setStatus((data.status || "notStarted") as (typeof kybStatuses)[number]); setNote(data.reviewNote || ""); } } load(); }, [workspaceId]);
  async function save(nextStatus = status) { setSaving(true); const existing = await client.models.KYBProfile.get({ id: workspaceId }); const now = new Date().toISOString(); const response = existing.data ? await client.models.KYBProfile.update({ id: workspaceId, status: nextStatus, reviewNote: note, submittedAt: nextStatus === "submitted" ? now : existing.data.submittedAt }) : await client.models.KYBProfile.create({ id: workspaceId, workspaceId, status: nextStatus, reviewNote: note, submittedAt: nextStatus === "submitted" ? now : undefined }); if (response.errors?.length) setMessage(response.errors[0].message); else { setStatus(nextStatus); setMessage(nextStatus === "submitted" ? "KYB submitted for review." : "KYB status saved."); } setSaving(false); }
  return <div className="max-w-3xl"><div className="mb-8"><p className="font-mono text-[11px] font-medium uppercase tracking-wide text-sub">Organization</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">KYB Verification</h1><p className="mt-1 text-sm text-sub">Verify the business entity separately from individual A-Pass identities.</p></div><div className="space-y-6"><div className="flex items-center gap-4 rounded-xl border border-hair bg-panel p-5"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo/10 text-indigo"><FileCheck2 size={21} /></div><div className="flex-1"><p className="text-xs uppercase tracking-wide text-sub">Current status</p><p className="mt-1 text-xl font-semibold text-ink">{statusLabel(status)}</p></div><select value={status} onChange={(event) => setStatus(event.target.value as (typeof kybStatuses)[number])} className="rounded-lg border border-hair bg-panel px-3 py-2 text-sm text-ink">{kybStatuses.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}</select></div><div className="rounded-xl border border-hair bg-panel p-6"><h2 className="text-base font-semibold text-ink">Documents</h2><p className="mt-1 text-sm text-sub">Demo uploads are previewed locally. Secure document storage will be added with Amplify Storage.</p><div className="mt-5 space-y-3">{documentTypes.map((type) => <label key={type} className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-hair bg-paper px-4 py-3 text-sm text-sub hover:border-indigo/40"><Upload size={16} className="text-indigo" /><span className="flex-1">{files[type] || type}</span><input type="file" accept="image/*,.pdf" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) setFiles((current) => ({ ...current, [type]: file.name })); }} /></label>)}</div></div><div className="rounded-xl border border-hair bg-panel p-6"><label htmlFor="kyb-note" className="block text-sm font-medium text-ink">Review note</label><textarea id="kyb-note" value={note} onChange={(event) => setNote(event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-lg border border-hair bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-indigo" placeholder="Add context for the KYB review..." /><div className="mt-5 flex flex-wrap justify-end gap-3"><button onClick={() => save("draft")} disabled={saving} className="rounded-lg border border-hair px-4 py-2.5 text-sm font-medium text-ink">Save draft</button><button onClick={() => save("submitted")} disabled={saving} className="rounded-lg bg-indigo px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : "Submit KYB"}</button></div></div>{message && <p className="rounded-lg bg-okgreen/10 px-4 py-3 text-sm text-okgreen">{message}</p>}</div></div>;
}
