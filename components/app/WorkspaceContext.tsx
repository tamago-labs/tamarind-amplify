"use client";

import { createContext, useContext } from "react";

export interface WorkspaceContextValue {
  workspaceId: string;
  name: string;
  role: string;
  status: string;
  inviteCode: string;
  ownerId: string;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export const WorkspaceProvider = WorkspaceContext.Provider;

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used inside a workspace route");
  return context;
}
