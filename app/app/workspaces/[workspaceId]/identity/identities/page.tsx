"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { useParams, useRouter } from "next/navigation";
import { Fingerprint, Plus } from "lucide-react";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();
export default function IdentitiesPage() {
  const { user } = useAuthenticator((context) => [context.user]);
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const router = useRouter();
  const [empty, setEmpty] = useState(false);
  const userId = user?.username || user?.userId || "";
  useEffect(() => { async function load() { const { data } = await client.models.WorkspaceIdentity.list({ filter: { workspaceId: { eq: workspaceId }, userId: { eq: userId } } }); if (data?.[0]) router.replace(`/app/workspaces/${workspaceId}/identity/identities/${data[0].id}`); else setEmpty(true); } if (workspaceId && userId) load(); }, [workspaceId, userId, router]);
  if (!empty) return <div className="rounded-xl border border-hair bg-panel p-10 text-center text-sm text-sub">Loading identities...</div>;
  return <div className="rounded-2xl border border-dashed border-hair bg-panel p-12 text-center"><Fingerprint size={28} className="mx-auto text-indigo" /><h1 className="mt-4 text-xl font-semibold text-ink">No A-Passes yet</h1><p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-sub">Create an A-Pass for a connected wallet and network. Each network has its own A-Pass.</p><Link href={`/app/workspaces/${workspaceId}/identity/identities/new`} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} />Create New Identity</Link></div>;
}
