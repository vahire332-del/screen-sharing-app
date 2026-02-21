"use client";

import type { CSSProperties, ReactNode } from "react";

export default function Footer({
  children,
  className,
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <footer
      className={`p-6 text-center ${className ?? ""}`}
      style={{ background: "var(--bg)", borderTop: "1px solid var(--border)", ...(style ?? {}) }}
    >
      {children ?? (
        <p className="text-xs" style={{ color: "var(--text-faint)" }}>
          © 2026 Screen Share Test App
        </p>
      )}
    </footer>
  );
}
