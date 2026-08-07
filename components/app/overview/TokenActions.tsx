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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left,
      });
    }
  }, [isOpen]);

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
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1 text-sm text-indigo hover:text-indigo/80 transition-colors"
      >
        {actions[0].label}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed bg-panel border border-hair rounded-lg shadow-lg py-1 z-50 min-w-[120px]"
          style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
        >
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={(e) => {
                e.stopPropagation();
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
