"use client";

import type { CSSProperties, ReactNode } from "react";
import { IoShareSocial } from "react-icons/io5";
import ThemeToggle from "@/components/ThemeToggle";

export default function NavBar({
  title,
  right,
  sticky = true,
  className,
  style,
}: {
  title: string;
  right?: ReactNode;
  sticky?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <header
      className={`${sticky ? "sticky top-0 z-50" : ""} w-full backdrop-blur-md px-6 md:px-10 py-4 ${className ?? ""}`}
      style={{ background: "rgba(var(--bg-rgb,255,255,255),.88)", borderBottom: "1px solid var(--border)", ...(style ?? {}) }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg press"
            style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
          >
            <IoShareSocial className="block text-[20px]" />
          </div>
          <span className="text-xl font-bold tracking-tight">{title}</span>
        </div>

        <div className="flex items-center gap-3">
          {right}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
