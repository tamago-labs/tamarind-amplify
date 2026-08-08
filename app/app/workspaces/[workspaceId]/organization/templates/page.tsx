"use client";

import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { FileText, Pencil, Plus, Archive, Copy } from "lucide-react";
import { useParams } from "next/navigation";
import type { Schema } from "@/amplify/data/resource";
import TemplateEditor, { type TemplateDraft } from "@/components/app/TemplateEditor";
import { documentTypeLabel, type DocumentType, type TemplateField } from "@/lib/templateOptions";

const client = generateClient<Schema>();

type TemplateRecord = TemplateDraft & { status: string; createdAt?: string | null; updatedAt?: string | null };

export default function TemplatesPage() {
  const { user } = useAuthenticator((context) => [context.user]);
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorTemplate, setEditorTemplate] = useState<TemplateDraft | null | undefined>(undefined);
  const [message, setMessage] = useState("");
  const userId = user?.username || user?.userId || "";

  async function load() {
    setLoading(true);
    const { data } = await client.models.DocumentTemplate.list({ filter: { workspaceId: { eq: workspaceId } } });
    setTemplates((data || []).map((template) => ({ ...template, documentType: (template.documentType || "payment") as DocumentType, status: template.status || "draft", fields: (template.fields || []) as unknown as TemplateField[] })) as TemplateRecord[]);
    setLoading(false);
  }
  useEffect(() => { if (workspaceId) load(); }, [workspaceId]);

  async function saveDraft(draft: TemplateDraft) {
    const fieldsJson = JSON.stringify(draft.fields);
    const result = draft.id ? await client.models.DocumentTemplate.update({ id: draft.id, name: draft.name, fields: fieldsJson, updatedBy: userId }) : await client.models.DocumentTemplate.create({ workspaceId, name: draft.name, templateKey: draft.templateKey, documentType: draft.documentType, status: "draft", version: 1, isDefault: false, fields: fieldsJson, createdBy: userId, updatedBy: userId });
    if (result.errors?.length) { setMessage(result.errors[0].message); return; }
    setEditorTemplate(undefined);
    await load();
  }

  async function updateStatus(template: TemplateRecord, status: "published" | "archived") {
    if (!template.id) return;
    const result = await client.models.DocumentTemplate.update({ id: template.id, status, publishedAt: status === "published" ? new Date().toISOString() : undefined, updatedBy: userId });
    if (result.errors?.length) setMessage(result.errors[0].message); else await load();
  }

  async function setDefault(template: TemplateRecord) {
    if (!template.id) return;
    const { data: sameType } = await client.models.DocumentTemplate.list({ filter: { workspaceId: { eq: workspaceId }, documentType: { eq: template.documentType } } });
    await Promise.all((sameType || []).filter((item) => item.id !== template.id && item.isDefault).map((item) => client.models.DocumentTemplate.update({ id: item.id, isDefault: false, updatedBy: userId })));
    await client.models.DocumentTemplate.update({ id: template.id, isDefault: true, status: "published", publishedAt: new Date().toISOString(), updatedBy: userId });
    await load();
  }

  return <div><div className="mb-6 flex items-start justify-between gap-4"><div><p className="font-mono text-[11px] font-medium uppercase tracking-wide text-sub">Organization</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Templates</h1><p className="mt-1 text-sm text-sub">Create reusable payment, invoice, and payslip document templates.</p></div><button onClick={() => setEditorTemplate(null)} className="inline-flex items-center gap-2 rounded-lg bg-indigo px-3 py-2 text-sm font-semibold text-white hover:brightness-110"><Plus size={16} />New template</button></div>{message && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>}{loading ? <div className="rounded-xl border border-hair bg-panel p-10 text-center text-sm text-sub">Loading templates...</div> : templates.length === 0 ? <div className="rounded-2xl border border-dashed border-hair bg-panel p-12 text-center"><FileText size={28} className="mx-auto text-indigo" /><h2 className="mt-4 text-lg font-semibold text-ink">No templates yet</h2><p className="mt-2 text-sm text-sub">Create your first workspace document template.</p><button onClick={() => setEditorTemplate(null)} className="mt-5 rounded-lg bg-indigo px-4 py-2.5 text-sm font-semibold text-white">New template</button></div> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{templates.map((template) => <div key={template.id} className="rounded-xl border border-hair bg-panel p-5"><div className="flex items-start justify-between gap-2"><div className="flex items-center gap-2"><FileText size={18} className="text-indigo" /><h2 className="text-sm font-semibold text-ink">{template.name}</h2></div><span className={`rounded-full px-2 py-1 text-[10px] font-medium ${template.status === "published" ? "bg-okgreen/10 text-okgreen" : template.status === "archived" ? "bg-paper text-sub" : "bg-yellow-100 text-yellow-800"}`}>{template.status}</span></div><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-paper px-2 py-1 text-[10px] text-sub">{documentTypeLabel(template.documentType)}</span><span className="rounded-full bg-paper px-2 py-1 text-[10px] text-sub">v{template.version}</span>{template.isDefault && <span className="rounded-full bg-indigo/10 px-2 py-1 text-[10px] text-indigo">Default</span>}</div><p className="mt-4 text-xs text-sub">{template.fields.length} configured fields</p><div className="mt-5 flex flex-wrap gap-2"><button onClick={() => setEditorTemplate(template.status === "draft" ? template : { ...template, id: undefined, name: `${template.name} copy`, status: "draft", version: 1, isDefault: false })} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-sub hover:bg-paper hover:text-ink"><Pencil size={13} />{template.status === "draft" ? "Edit" : "Duplicate"}</button>{template.status !== "archived" && <button onClick={() => updateStatus(template, "archived")} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-sub hover:bg-paper hover:text-ink"><Archive size={13} />Archive</button>}{template.status === "draft" && <button onClick={() => updateStatus(template, "published")} className="rounded-md bg-indigo/10 px-2.5 py-1.5 text-xs font-medium text-indigo">Publish</button>}{template.status === "published" && !template.isDefault && <button onClick={() => setDefault(template)} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-sub hover:bg-paper hover:text-ink"><Copy size={13} />Set default</button>}</div></div>)}</div>}{editorTemplate !== undefined && <TemplateEditor template={editorTemplate} onClose={() => { setEditorTemplate(undefined); setMessage(""); }} onSave={saveDraft} error={message} />}</div>;
}
