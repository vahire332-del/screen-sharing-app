"use client";

import React from "react";
import { IoSync } from "react-icons/io5";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:  "btn-accent",
  secondary: "btn-outline",
  danger:   "btn-danger",
  ghost:    "btn-outline opacity-70",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3.5 text-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={[
        variantClass[variant],
        sizeClass[size],
        "font-semibold",
        className,
      ].join(" ")}
    >
      {loading && (
        <IoSync className="h-4 w-4 animate-spin" />
      )}
      {children}
    </button>
  );
}
