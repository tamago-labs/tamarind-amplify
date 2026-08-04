"use client";

import { ReactNode } from "react";
import IdentitySidebar from "@/components/app/IdentitySidebar";

export default function IdentityLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-6 lg:flex-row lg:gap-8"><IdentitySidebar /><section className="min-w-0 flex-1">{children}</section></div>;
}
