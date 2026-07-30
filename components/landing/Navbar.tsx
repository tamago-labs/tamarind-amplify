"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Brand from "@/components/Brand";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors ${
        scrolled
          ? "bg-panel/85 backdrop-blur-md border-hair"
          : "bg-panel/0 border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Brand />
        <nav className="hidden md:flex items-center gap-8 text-sm text-sub font-medium">
          <a href="#features" className="hover:text-ink transition-colors no-underline">Product</a>
          <a href="#supported-chains" className="hover:text-ink transition-colors no-underline">Supported Chains</a>
          <a href="#flow" className="hover:text-ink transition-colors no-underline">How it works</a>
          <a href="#pricing" className="hover:text-ink transition-colors no-underline">Pricing</a>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/app" className="text-sm font-semibold text-white bg-indigo hover:brightness-110 transition rounded-md px-4 py-2 no-underline">
            Launch app
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 border border-hair rounded-md bg-panel"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="md:hidden border-t border-hair bg-panel overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              <a href="#features" onClick={() => setOpen(false)} className="text-sm font-medium text-sub hover:text-ink transition-colors no-underline">Product</a>
              <a href="#supported-chains" onClick={() => setOpen(false)} className="text-sm font-medium text-sub hover:text-ink transition-colors no-underline">Supported Chains</a>
              <a href="#flow" onClick={() => setOpen(false)} className="text-sm font-medium text-sub hover:text-ink transition-colors no-underline">How it works</a>
              <a href="#pricing" onClick={() => setOpen(false)} className="text-sm font-medium text-sub hover:text-ink transition-colors no-underline">Pricing</a>
              <Link href="/app" onClick={() => setOpen(false)} className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo text-white rounded-md text-sm font-semibold no-underline">
                Launch app
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
