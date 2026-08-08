export type NodeRole = "company" | "recipient" | "deposit";
export type IdentityType = "organizationIdentity" | "workspaceIdentity";

export interface CanvasNode {
  id: string;
  workflowId: string;
  identityType: IdentityType;
  identityId: string;
  nodeRole: NodeRole;
  label: string;
  x: number;
  y: number;
  walletAddress?: string;
  chain?: string;
  internalStatus?: string;
  countries?: string[];
  tier?: string;
  expirationTime?: number;
}

export interface CanvasConnection {
  id: string;
  workflowId: string;
  fromNodeId: string;
  toNodeId: string;
  flowType: "payment" | "invoice";
  templateId?: string;
  templateVersion?: number;
  amountMode?: "fixed" | "input";
  fixedAmount?: string;
  currency?: string;
  chain?: string;
  approvalRequired?: boolean;
  configuration?: string;
}

export interface CanvasState {
  nodes: CanvasNode[];
  connections: CanvasConnection[];
}

export const CARD_WIDTH = 220;
export const CARD_HEIGHTS: Record<NodeRole, number> = {
  company: 120,
  recipient: 100,
  deposit: 100,
};

export const NODE_COLORS: Record<NodeRole, { border: string; bg: string; badge: string }> = {
  company: { border: "#6366f1", bg: "#eef2ff", badge: "#6366f1" },
  recipient: { border: "#10b981", bg: "#ecfdf5", badge: "#10b981" },
  deposit: { border: "#f59e0b", bg: "#fffbeb", badge: "#f59e0b" },
};

export const NODE_LABELS: Record<NodeRole, string> = {
  company: "Company Wallet",
  recipient: "Recipient Wallet",
  deposit: "Deposit Wallet",
};

export const VALID_CONNECTIONS: Array<{ from: NodeRole; to: NodeRole; flowType: "payment" | "invoice" }> = [
  { from: "company", to: "recipient", flowType: "payment" },
  { from: "deposit", to: "company", flowType: "invoice" },
];
