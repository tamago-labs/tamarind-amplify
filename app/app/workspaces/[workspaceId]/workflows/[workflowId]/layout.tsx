"use client";

import { ReactNode } from "react";

export default function WorkflowCanvasLayout({ children }: { children: ReactNode }) {
  return (
    <div className="-m-6 flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {children}
    </div>
  );
}
