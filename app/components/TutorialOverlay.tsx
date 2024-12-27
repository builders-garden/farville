"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
  targetSelector: string;
  position: "top" | "bottom" | "left" | "right";
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Plant Seeds",
    description:
      "Click or drag a seed from the toolbar and tap a tilled plot to plant!",
    icon: "🌱",
    targetSelector: "[data-tutorial='toolbar']",
    position: "bottom",
  },
  {
    title: "Check Inventory",
    description:
      "View your seeds, crops, and special items. 4 fertilizers are included!",
    icon: "🎒",
    targetSelector: "[data-tutorial='inventory']",
    position: "bottom",
  },
  {
    title: "Visit Market",
    description: "Buy seeds and sell your crops for coins!",
    icon: "🏪",
    targetSelector: "[data-tutorial='marketplace']",
    position: "top",
  },
];

// Update the tutorial message positioning and styling
const getMessagePosition = (
  element: DOMRect,
  position: "top" | "bottom" | "left" | "right"
) => {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  // For bottom position (toolbar), place the message above the element
  if (position === "bottom") {
    return {
      left: Math.min(
        Math.max(element.left + element.width / 2, 150),
        viewportWidth - 150
      ),
      bottom: viewportHeight - element.top + 20, // Position above the toolbar
    };
  }

  // For top position (header buttons), place the message below the element
  return {
    left: Math.min(
      Math.max(element.left + element.width / 2, 150),
      viewportWidth - 150
    ),
    top: element.bottom + 20, // Position below the header buttons
  };
};

export default function TutorialOverlay({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<DOMRect | null>(
    null
  );

  // Update highlighted element position when step changes
  const updateHighlight = () => {
    const element = document.querySelector(
      TUTORIAL_STEPS[currentStep].targetSelector
    );
    if (element) {
      setHighlightedElement(element.getBoundingClientRect());
    }
  };

  // Handle next step or complete tutorial
  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  // Update highlight when step changes
  useEffect(() => {
    updateHighlight();
    window.addEventListener("resize", updateHighlight);
    return () => window.removeEventListener("resize", updateHighlight);
  }, [currentStep]);

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <motion.div
      className="fixed inset-0 z-[200]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Semi-transparent overlay with pointer-events */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => {}} // Prevent clicks from passing through
      />

      {/* Highlight current element */}
      {highlightedElement && (
        <motion.div
          className="absolute border-4 border-yellow-400 rounded-lg pointer-events-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: highlightedElement.left - 8,
            y: highlightedElement.top - 8,
            width: highlightedElement.width + 16,
            height: highlightedElement.height + 16,
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Tutorial message */}
      {highlightedElement && (
        <motion.div
          className="fixed bg-white rounded-xl p-4 shadow-xl mx-4 pointer-events-auto"
          initial={{ opacity: 0, y: step.position === "bottom" ? 20 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...getMessagePosition(highlightedElement, step.position),
            transform: "translateX(-50%)",
            maxWidth: "min(300px, calc(100vw - 32px))",
            zIndex: 201,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{step.icon}</span>
            <h3 className="font-bold text-lg">{step.title}</h3>
          </div>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            {step.description}
          </p>
          <button
            onClick={handleNext}
            className="w-full py-3 bg-green-500 text-white rounded-lg font-medium
                     hover:bg-green-600 transition-colors text-sm sm:text-base"
          >
            {currentStep < TUTORIAL_STEPS.length - 1 ? "Next" : "Got it!"}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
