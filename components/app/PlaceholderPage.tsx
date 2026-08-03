"use client";

import { Construction } from "lucide-react";

export default function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-hair bg-panel p-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo/10 text-indigo"><Construction size={21} /></div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-sub">{description || "This workspace module is being prepared."}</p>
    </div>
  );
}
