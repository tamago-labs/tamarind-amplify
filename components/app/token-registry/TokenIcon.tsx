"use client";

interface TokenIconProps {
  icon: string;
  symbol: string;
  chain: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

const chainColors: Record<string, string> = {
  base: "bg-blue-500",
  monad: "bg-purple-500",
};

export default function TokenIcon({ icon, symbol, chain, size = "md" }: TokenIconProps) {
  return (
    <div className="relative inline-flex">
      <img
        src={icon}
        alt={symbol}
        className={`${sizeClasses[size]} rounded-full object-cover`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          target.nextElementSibling?.classList.remove("hidden");
        }}
      />
      <div
        className={`${sizeClasses[size]} rounded-full bg-indigo/10 items-center justify-center text-indigo font-semibold text-xs hidden`}
      >
        {symbol.charAt(0).toUpperCase()}
      </div>
      <span
        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${chainColors[chain] || "bg-gray-500"} border-2 border-panel`}
      />
    </div>
  );
}
