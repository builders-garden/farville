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
    title: "Welcome to FarVille!",
    description:
      "Click on the carrot seed in your toolbar to plant your first crop.",
    icon: "🌱",
    targetSelector: "[data-tutorial='seed-menu']",
    position: "bottom",
  },
  {
    title: "Plant Your Seeds",
    description: "Then click any tilled plot to plant your carrot seeds!",
    icon: "🥕",
    targetSelector: "[data-tutorial='grid']",
    position: "top",
  },
  {
    title: "Use Fertilizer",
    description:
      "Speed up growth with fertilizer! Click the plot with your planted carrots and then fertilize.",
    icon: "💨",
    targetSelector: "[data-tutorial='grid']",
    position: "top",
  },
  {
    title: "Harvest Your Crops",
    description: "Once your crops are ready, click them to harvest!",
    icon: "🥕",
    targetSelector: "[data-tutorial='grid']",
    position: "top",
  },
  {
    title: "Visit Market",
    description: "Finally, head to the marketplace to sell your crops!",
    icon: "🏪",
    targetSelector: "[data-tutorial='marketplace']",
    position: "bottom",
  },
];

// Update the tutorial message positioning and styling
const getMessagePosition = (
  element: DOMRect,
  position: "top" | "bottom" | "left" | "right"
) => {
  const viewportHeight = window.innerHeight;

  // For bottom position (toolbar), place the message above the element
  if (position === "bottom") {
    return {
      bottom: viewportHeight - element.top + 20, // Position above the toolbar
    };
  }

  // For top position (header buttons), place the message below the element
  return {
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
  const [tutorialComplete, setTutorialComplete] = useState(false);
  const [isVisible] = useState(true);

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
      setTutorialComplete(true);
      onComplete();
    }
  };

  useEffect(() => {
    // Start tutorial automatically when component mounts
    updateHighlight();
    window.addEventListener("resize", updateHighlight);
    return () => window.removeEventListener("resize", updateHighlight);
  }, []);

  // Update highlight when step changes
  useEffect(() => {
    updateHighlight();
    window.addEventListener("resize", updateHighlight);
    return () => window.removeEventListener("resize", updateHighlight);
  }, [currentStep]);

  // If tutorial is complete or not visible, don't render anything
  if (tutorialComplete || !isVisible) {
    return null;
  }

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <motion.div
      className="fixed inset-0 z-[200]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Semi-transparent overlay with mask */}
      {highlightedElement && (
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <mask id="spotlight">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={highlightedElement.left - 8}
                  y={highlightedElement.top - 8}
                  width={highlightedElement.width + 16}
                  height={highlightedElement.height + 16}
                  fill="black"
                  rx="8"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.5)"
              mask="url(#spotlight)"
            />
          </svg>
        </div>
      )}

      {/* Highlight border */}
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
        <div
          className="fixed inset-x-0 px-4 z-[201]"
          style={getMessagePosition(highlightedElement, step.position)}
        >
          <motion.div
            className="bg-[#7E4E31] rounded-lg p-4 shadow-xl pointer-events-auto border-2 border-[#8B5E3C] max-w-md mx-auto"
            initial={{ opacity: 0, y: step.position === "bottom" ? 20 : -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-white/90 font-bold text-sm">{step.title}</h3>
            </div>
            <p className="text-white/80 mb-6 text-xs sm:text-base">
              {step.description}
            </p>
            <button
              onClick={handleNext}
              className="w-full py-3 bg-[#FFB938] text-[#7E4E31] rounded-lg font-bold
                       hover:bg-[#ffc661] transition-colors text-xs sm:text-base"
            >
              {currentStep < TUTORIAL_STEPS.length - 1 ? "Next" : "Got it!"}
            </button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
