"use client";

import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hover?: boolean;
  inner?: boolean;
}

export default function Card({ 
  children, 
  className = "", 
  style = {},
  hover = true,
  inner = false
}: CardProps) {
  const baseClasses = inner 
    ? "card-inner" 
    : hover 
      ? "card" 
      : "rounded-xl border border-[var(--border)] bg-[var(--bg)] shadow-[var(--shadow-sm)]";

  return (
    <div 
      className={`${baseClasses} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
