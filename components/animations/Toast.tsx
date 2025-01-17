"use client";

import { motion } from "framer-motion";
import { createPortal } from "react-dom";

interface ToastProps {
  message: string;
  type?: "info" | "warning" | "error" | "success";
}

export default function Toast({ message, type = "info" }: ToastProps) {
  // Only render in browser environment
  if (typeof document === "undefined") return null;

  const getBackgroundColor = () => {
    switch (type) {
      case "warning":
        return "bg-yellow-500/90 text-yellow-900";
      case "error":
        return "bg-red-500/90 text-white";
      case "success":
        return "bg-green-500/90 text-white";
      default:
        return "bg-blue-500/90 text-white";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      case "success":
        return "✅";
      default:
        return "ℹ️";
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [-20, 0, 0, -20],
      }}
      transition={{
        duration: 3,
        ease: "easeInOut",
        times: [0, 0.1, 0.9, 1],
      }}
      className="mx-4 fixed top-6 -translate-x-1/2 pointer-events-none z-[100]"
    >
      <div
        className={`text-[10px] px-4 py-2 rounded-lg shadow-lg ${getBackgroundColor()} font-medium flex items-center gap-2`}
      >
        <span>{getIcon()}</span>
        {message}
      </div>
    </motion.div>,
    document.body
  );
}
