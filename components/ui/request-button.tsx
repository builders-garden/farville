import React from "react";

interface RequestButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "secondary";
}

/**
 * Reusable RequestButton component with consistent styling across the application
 */
export default function RequestButton({
  onClick,
  disabled = false,
  className = "",
  variant = "primary",
}: RequestButtonProps) {
  const baseStyles = "px-2 py-1 rounded text-xs font-bold transition-colors";
  const variantStyles =
    variant === "primary"
      ? "bg-[#FFB938] text-[#7E4E31] hover:bg-[#ffc661]"
      : "bg-[#5A4129] text-white/80 hover:bg-[#503d2b]";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent event bubbling
        onClick();
      }}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      Request
    </button>
  );
}
