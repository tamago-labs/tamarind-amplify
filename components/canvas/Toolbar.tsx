"use client";

import { useState } from "react";
import { Building2, User, Briefcase, ZoomIn, ZoomOut, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ToolbarProps {
  workflowId: string;
  workspaceId: string;
  workflowName: string;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onAddNode: (role: "company" | "recipient" | "deposit") => void;
  onNameChange: (name: string) => void;
  locked: boolean;
}

export default function Toolbar({ workflowId, workspaceId, workflowName, zoom, onZoomChange, onAddNode, onNameChange, locked }: ToolbarProps) {
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(workflowName);

  function handleSave() {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== workflowName) {
      onNameChange(trimmed);
    } else {
      setNameValue(workflowName);
    }
    setEditing(false);
  }

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
      <div className="flex items-center gap-4">
        <Link
          href={`/app/workspaces/${workspaceId}/workflows`}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={14} />
          Workflows
        </Link>
        <div className="h-5 w-px bg-gray-200" />
        {editing ? (
          <input
            autoFocus
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setNameValue(workflowName);
                setEditing(false);
              }
            }}
            className="rounded-md border border-indigo-300 px-2 py-1 text-sm font-semibold text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        ) : (
          <h1
            onClick={() => !locked && setEditing(true)}
            className={`text-sm font-semibold text-gray-900 ${locked ? "" : "cursor-pointer hover:text-indigo-600"}`}
          >
            {workflowName}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5">
          <button
            onClick={() => onAddNode("company")}
            disabled={locked}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
          >
            <Building2 size={13} />
            Company
          </button>
          <button
            onClick={() => onAddNode("recipient")}
            disabled={locked}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 disabled:opacity-50"
          >
            <User size={13} />
            Recipient
          </button>
          <button
            onClick={() => onAddNode("deposit")}
            disabled={locked}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 disabled:opacity-50"
          >
            <Briefcase size={13} />
            Deposit
          </button>
        </div>
        <div className="h-5 w-px bg-gray-200" />
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5">
          <button
            onClick={() => onZoomChange(Math.min(3, zoom * 1.2))}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <ZoomIn size={14} />
          </button>
          <span className="min-w-[40px] text-center text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => onZoomChange(Math.max(0.25, zoom / 1.2))}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <ZoomOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
