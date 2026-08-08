"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Building2, User, Briefcase, X } from "lucide-react";
import { networkIcons } from "@web3icons/react";
import Flag from "react-flagkit";
import { type CanvasNode, CARD_WIDTH, CARD_HEIGHTS, NODE_COLORS, NODE_LABELS, type NodeRole } from "./types";

interface CanvasCardProps {
  node: CanvasNode;
  isSelected: boolean;
  locked: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onPortClick: (nodeId: string, portType: "input" | "output") => void;
  connectFrom: string | null;
}

const ROLE_ICONS: Record<NodeRole, typeof Building2> = {
  company: Building2,
  recipient: User,
  deposit: Briefcase,
};

function getChainIcon(chain?: string) {
  if (chain === "monad") return networkIcons.NetworkMonad;
  return networkIcons.NetworkBase;
}

function countryFlag(code: string) {
  if (!code || code.length !== 2) return "";
  return String.fromCodePoint(...code.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0)));
}

function getChainLabel(chain?: string) {
  if (chain === "monad") return "Monad";
  return "Base";
}

function formatExpiration(expirationTime?: number) {
  if (!expirationTime) return "";
  const date = new Date(expirationTime * 1000);
  return date.toLocaleDateString("en", { month: "short", year: "numeric" });
}

export default function CanvasCard({ node, isSelected, locked, onSelect, onDelete, onPortClick, connectFrom }: CanvasCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `card-${node.id}`,
    data: { placementId: node.id },
    disabled: locked,
  });

  const colors = NODE_COLORS[node.nodeRole];
  const height = CARD_HEIGHTS[node.nodeRole];
  const Icon = ROLE_ICONS[node.nodeRole];
  const canReceiveInput = node.nodeRole === "company" || node.nodeRole === "recipient";
  const canSendOutput = node.nodeRole === "company" || node.nodeRole === "deposit";
  const isValidTarget = connectFrom && canReceiveInput;
  const isConnecting = connectFrom !== null;

  return (
    <div
      ref={setNodeRef}
      className="absolute select-none"
      style={{
        left: node.x,
        top: node.y,
        width: CARD_WIDTH,
        height,
        transform: CSS.Translate.toString(transform),
      }}
      data-card
    >
      <div
        className="relative h-full rounded-xl border-l-4 bg-white shadow-md transition-shadow hover:shadow-lg cursor-grab active:cursor-grabbing"
        style={{
          borderLeftColor: colors.border,
          backgroundColor: isSelected ? colors.bg : "white",
          outline: isConnecting && isValidTarget ? "2px dashed #10b981" : "none",
        }}
        {...listeners}
        {...attributes}
        onClick={(e) => {
          onSelect(node.id);
        }}
      >
        <div className="flex items-center gap-2 px-3 pt-3">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ backgroundColor: colors.bg }}
          >
            <Icon size={14} style={{ color: colors.border }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">{node.label}</p>
            <p className="text-[10px] text-gray-500">{NODE_LABELS[node.nodeRole]}</p>
          </div>
          {!locked && (
            <button
              data-delete
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete(node.id);
              }}
              className="rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {node.walletAddress && (
          <div className="px-3 pb-2">
            <p className="text-[10px] font-mono text-gray-400 truncate">{node.walletAddress}</p>
          </div>
        )}
        <div className="flex items-center gap-1.5 px-3 pb-2">
          {(() => {
            const ChainIcon = getChainIcon(node.chain);
            return <ChainIcon size={12} />;
          })()}
          <span className="text-[9px] text-gray-500">{getChainLabel(node.chain)}</span>
          {node.countries && node.countries.length > 0 && (
            <Flag country={node.countries[0]} size={12} />
          )}
          {node.tier && (
            <span className="text-[9px] text-gray-500">Tier {node.tier}</span>
          )}
          {node.expirationTime && (
            <span className="text-[9px] text-gray-400">{formatExpiration(node.expirationTime)}</span>
          )}
        </div>
        {canReceiveInput && (
          <button
            className="absolute -left-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-white bg-gray-300 hover:bg-indigo-500 transition-colors"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onPortClick(node.id, "input");
            }}
            data-port
          />
        )}
        {canSendOutput && (
          <button
            className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-white bg-gray-300 hover:bg-indigo-500 transition-colors"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onPortClick(node.id, "output");
            }}
            data-port
          />
        )}
      </div>
    </div>
  );
}
