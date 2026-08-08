"use client";

import { type CanvasNode, type CanvasConnection, CARD_WIDTH, CARD_HEIGHTS } from "./types";

interface CanvasLinesProps {
  nodes: CanvasNode[];
  connections: CanvasConnection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function CanvasLines({ nodes, connections, selectedId, onSelect }: CanvasLinesProps) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <svg className="absolute inset-0 h-full w-full" style={{ zIndex: 0 }}>
      <defs>
        <marker id="arrow" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 3 L 0 6 z" fill="#c97a3d" />
        </marker>
      </defs>
      {connections.map((conn) => {
        const from = nodeMap.get(conn.fromNodeId);
        const to = nodeMap.get(conn.toNodeId);
        if (!from || !to) return null;

        const fromHeight = CARD_HEIGHTS[from.nodeRole];
        const toHeight = CARD_HEIGHTS[to.nodeRole];
        const x1 = from.x + CARD_WIDTH;
        const y1 = from.y + fromHeight / 2;
        const x2 = to.x;
        const y2 = to.y + toHeight / 2;
        const dx = Math.abs(x2 - x1) * 0.5;
        const path = `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const isSelected = conn.id === selectedId;

        const label = conn.fixedAmount && conn.currency 
          ? `${conn.fixedAmount} ${conn.currency.split("-")[0]}`
          : conn.flowType === "payment" ? "Payment" : "Invoice";
        const labelWidth = Math.max(60, label.length * 7 + 20);

        return (
          <g key={conn.id} onClick={(e) => { e.stopPropagation(); onSelect(conn.id); }} className="pointer-events-auto cursor-pointer">
            <path
              d={path}
              fill="none"
              stroke={isSelected ? "#6366f1" : "#c97a3d"}
              strokeWidth={isSelected ? 3 : 2}
              markerEnd="url(#arrow)"
            />
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth={14}
            />
            <rect
              x={midX - labelWidth / 2}
              y={midY - 12}
              width={labelWidth}
              height={24}
              rx={12}
              fill="white"
              stroke={isSelected ? "#6366f1" : "#e5e7eb"}
              strokeWidth={1}
              className="pointer-events-none"
            />
            <text
              x={midX}
              y={midY + 4}
              textAnchor="middle"
              className="pointer-events-none"
              fill={isSelected ? "#6366f1" : "#6b7280"}
              fontSize={10}
              fontWeight={500}
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
