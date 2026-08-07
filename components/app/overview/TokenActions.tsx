"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Action {
  label: string;
  onClick: () => void;
}

interface TokenActionsProps {
  actions: Action[];
}

export default function TokenActions({ actions }: TokenActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (actions.length === 0) return <span className="text-sub text-sm">—</span>;

  if (actions.length === 1) {
    return (
      <button
        onClick={actions[0].onClick}
        className="text-sm text-indigo hover:text-indigo/80 transition-colors"
      >
        {actions[0].label}
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-sm text-indigo hover:text-indigo/80 transition-colors"
      >
        {actions[0].label}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-panel border border-hair rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-paper transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
