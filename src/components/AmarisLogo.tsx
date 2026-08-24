import React from "react";

interface AmarisLogoProps {
  variant?: "horizontal" | "full" | "icon";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  lightText?: boolean; // Set to true when rendering on dark background
}

export const AmarisLogo: React.FC<AmarisLogoProps> = ({
  variant = "horizontal",
  size = "md",
  className = "",
  lightText = false,
}) => {
  // Height metrics based on size
  const iconSizeMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };

  const dim = iconSizeMap[size];

  // SVG Emblem component (matching official Amaris Learning Hub logo graphic)
  const Emblem = (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 240 240"
      className="shrink-0 transition-transform duration-200 group-hover:scale-105"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="amhPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>
        <linearGradient id="amhCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      <g transform="translate(120, 120)">
        {/* Main Pink Outer Ring Arc */}
        <path
          d="M -75 -15 A 80 80 0 1 0 65 35 A 62 62 0 1 1 -58 -8 Z"
          fill="url(#amhPinkGrad)"
        />

        {/* Cyan Upper Right Ring Arc */}
        <path
          d="M -15 -80 A 80 80 0 0 1 80 0 A 80 80 0 0 1 68 42 A 62 62 0 0 0 64 -12 A 62 62 0 0 0 -8 -62 Z"
          fill="url(#amhCyanGrad)"
        />

        {/* Inner Dark Navy Crescent */}
        <path
          d="M -8 -54 A 54 54 0 0 1 54 8 A 42 42 0 0 0 -4 -42 Z"
          fill="#0A2540"
        />

        {/* Left Badge 'A' */}
        <circle cx="-68" cy="-10" r="22" fill="#0A2540" stroke="#FFFFFF" strokeWidth="2" />
        <text
          x="-68"
          y="-2"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="22"
          fill="#FFFFFF"
          textAnchor="middle"
        >
          A
        </text>

        {/* Center 'Learning' Text */}
        <text
          x="0"
          y="-2"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="700"
          fontStyle="italic"
          fontSize="20"
          fill="#F43F5E"
          textAnchor="middle"
        >
          Learning
        </text>

        {/* Right Badge 'H' */}
        <rect
          x="48"
          y="-24"
          width="30"
          height="35"
          rx="6"
          fill="#0A2540"
          stroke="#06B6D4"
          strokeWidth="1.5"
        />
        <text
          x="63"
          y="0"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="22"
          fill="#06B6D4"
          textAnchor="middle"
        >
          H
        </text>
      </g>
    </svg>
  );

  if (variant === "icon") {
    return <div className={`inline-flex items-center ${className}`}>{Emblem}</div>;
  }

  if (variant === "full") {
    return (
      <div className={`flex flex-col items-center text-center group ${className}`}>
        {Emblem}
        <div className="mt-3">
          <h2 className={`font-black tracking-wider uppercase font-display leading-none ${size === "lg" || size === "xl" ? "text-2xl sm:text-3xl" : "text-xl"} ${lightText ? "text-white" : "text-navy-900 dark:text-white"}`}>
            AMARIS
          </h2>
          <div className={`text-[10px] sm:text-xs font-bold font-mono tracking-[0.2em] my-0.5 ${lightText ? "text-gold-400" : "text-royal-600 dark:text-gold-400"}`}>
            — LEARNING —
          </div>
          <h3 className={`font-extrabold tracking-widest leading-none ${size === "lg" || size === "xl" ? "text-xl sm:text-2xl" : "text-lg"} ${lightText ? "text-navy-200" : "text-navy-800 dark:text-navy-200"}`}>
            HUB
          </h3>
        </div>
      </div>
    );
  }

  // Horizontal variant (Emblem + Side-by-Side Wordmark)
  return (
    <div className={`flex items-center gap-3 group ${className}`}>
      {Emblem}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight font-display ${size === "xs" ? "text-xs" : size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : size === "xl" ? "text-2xl" : "text-base sm:text-lg"} ${lightText ? "text-white" : "text-navy-900 dark:text-white"}`}>
            Amaris
          </span>
          <span className={`font-bold font-display ${size === "xs" ? "text-xs" : size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : size === "xl" ? "text-2xl" : "text-base sm:text-lg"} ${lightText ? "text-rose-400" : "text-rose-500 dark:text-rose-400"}`}>
            Learning
          </span>
          <span className={`font-black font-display ${size === "xs" ? "text-xs" : size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : size === "xl" ? "text-2xl" : "text-base sm:text-lg"} ${lightText ? "text-cyan-400" : "text-cyan-600 dark:text-cyan-400"}`}>
            Hub
          </span>
        </div>
        <span className={`text-[9px] sm:text-[10px] font-mono tracking-widest uppercase mt-0.5 font-bold ${lightText ? "text-navy-300" : "text-navy-500 dark:text-navy-400"}`}>
          South Africa • CAPS &amp; IEB Maths
        </span>
      </div>
    </div>
  );
};
