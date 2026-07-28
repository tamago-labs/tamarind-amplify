"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Brand() {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href="/"
      className="flex items-center gap-2 no-underline"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.span
        className="w-6 h-6 rounded-[6px] bg-indigo flex items-center justify-center"
        animate={hovered ? { rotate: [0, -12, 12, -6, 6, 0] } : { rotate: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <span className="w-2 h-2 bg-white rounded-[2px]" />
      </motion.span>
      <span
        className={`font-mono text-[15px] font-medium tracking-tight transition-colors ${
          hovered ? "text-indigo" : "text-ink"
        }`}
      >
        tamarind
      </span>
    </Link>
  );
}
