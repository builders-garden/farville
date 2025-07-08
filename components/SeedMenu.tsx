"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Item } from "@prisma/client";
import { motion } from "motion/react";
import { useNextStep } from "nextstepjs";
import { useRef } from "react";
import { useGame } from "../context/GameContext";
import { SeedType } from "../lib/types/game";

const CROP_COLORS: Record<SeedType, string> = {
  "carrot-seeds": "border-orange-400",
  "pumpkin-seeds": "border-yellow-400",
  "tomato-seeds": "border-red-400",
  "potato-seeds": "border-yellow-400",
  "wheat-seeds": "border-orange-400",
  "corn-seeds": "border-yellow-400",
  "lettuce-seeds": "border-green-400",
  "eggplant-seeds": "border-purple-400",
  "radish-seeds": "border-red-400",
  "strawberry-seeds": "border-red-400",
  "watermelon-seeds": "border-red-400",
};

export default function SeedMenu() {
  const { currentStep, currentTour, setCurrentStep } = useNextStep();
  const {
    selectedSeed,
    setSelectedSeed,
    selectedPerk,
    setSelectedPerk,
    setRemainingUses,
    state,
  } = useGame();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Add these scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -100, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 100, behavior: "smooth" });
    }
  };

  // Update click handler to set remaining uses
  const handleClick = (item: Item) => {
    const seed = state.seeds.find((s) => s.item.id === item.id);
    const perk = state.perks?.find((p) => p.item.id === item.id);
    const isAvailable = item.category === "seed" ? !!seed : !!perk;
    const quantity =
      item.category === "seed" ? seed?.quantity || 0 : perk?.quantity || 0;

    if (!isAvailable || quantity <= 0) return;

    if (item.category === "seed") {
      setSelectedSeed(item.slug as SeedType);
      setSelectedPerk(null);
      setRemainingUses(seed?.quantity || 0);
      if (currentTour === "mainTour" && currentStep === 0) {
        setCurrentStep(1);
      }
    } else {
      setSelectedPerk(perk!);
      setSelectedSeed(null);
      setRemainingUses(perk?.quantity || 0);
      if (currentTour === "mainTour" && currentStep === 2) {
        setCurrentStep(3);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex items-center gap-2 px-2 overflow-y-hidden"
      id="seed-menu"
    >
      <motion.div
        className="bg-[#7E4E31]/40 p-1 xs:px-4 xs:py-2 rounded-lg shadow-lg border-2 border-[#8B5E3C]/60 w-full relative"
        whileHover={{ scale: 1.02 }}
      >
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#6d4c2c]/90 hover:bg-[#6d4c2c] rounded-lg p-1 h-12 flex items-center justify-center z-40 transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4 text-white/90" />
        </button>
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#6d4c2c]/90 hover:bg-[#6d4c2c] rounded-lg p-1 h-12 flex items-center justify-center z-40 transition-colors"
        >
          <ChevronRightIcon className="w-4 h-4 text-white/90" />
        </button>
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto py-3 px-6 no-scrollbar"
        >
          {state.items
            .filter(
              (item) => item.category === "seed" || item.category === "perk"
            )
            .sort((a, b) => {
              const aQuantity =
                a.category === "seed"
                  ? state.seeds.find((s) => s.item.id === a.id)?.quantity || 0
                  : state.perks?.find((p) => p.item.id === a.id)?.quantity || 0;
              const bQuantity =
                b.category === "seed"
                  ? state.seeds.find((s) => s.item.id === b.id)?.quantity || 0
                  : state.perks?.find((p) => p.item.id === b.id)?.quantity || 0;

              // If both items have quantity > 0 or both have 0 quantity, sort by category
              if (
                (aQuantity > 0 && bQuantity > 0) ||
                (aQuantity === 0 && bQuantity === 0)
              ) {
                if (a.category === b.category) return 0;
                return a.category === "seed" ? -1 : 1;
              }

              // If one item has 0 quantity, sort by quantity first
              return bQuantity - aQuantity;
            })
            .map((item) => {
              const seed = state.seeds.find((seed) => seed.item.id === item.id);
              const perk = state.perks?.find(
                (perk) => perk.item.id === item.id
              );
              const isAvailable = item.category === "seed" ? !!seed : !!perk;
              const quantity =
                item.category === "seed"
                  ? seed?.quantity || 0
                  : perk?.quantity || 0;

              return (
                <div key={item.id} id={item.slug} className="py-1 px-1">
                  <motion.button
                    onClick={() => handleClick(item)}
                    className={`
                      relative min-w-[2.5rem] w-10 h-10 rounded-lg flex items-center justify-center
                      ${
                        item.category === "seed"
                          ? selectedSeed === item.slug
                            ? "bg-[#6d4c2c]"
                            : "bg-[#8B5E3C]"
                          : selectedPerk?.item.slug === item.slug
                          ? "bg-[#6d4c2c]"
                          : "bg-[#8B5E3C]"
                      }
                      border-2 ${
                        item.category === "seed"
                          ? CROP_COLORS[item.slug as SeedType]
                          : "border-blue-400"
                      }
                      ${
                        isAvailable && quantity > 0
                          ? "hover:bg-[#6d4c2c]"
                          : "opacity-50 cursor-not-allowed"
                      }
                      transition-colors
                    `}
                    whileHover={
                      isAvailable && quantity > 0 ? { scale: 1.05 } : undefined
                    }
                    whileTap={
                      isAvailable && quantity > 0 ? { scale: 0.95 } : undefined
                    }
                  >
                    <motion.img
                      src={`/images${item.icon}`}
                      alt={`${item.slug}`}
                      className="w-8 h-8 object-contain"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <div className="absolute -top-2 -right-2 bg-[#6d4c2c] rounded-full w-5 h-5 flex items-center justify-center text-xs text-white/90">
                      {quantity}
                    </div>
                  </motion.button>
                </div>
              );
            })}
        </div>
        <div className="text-white/90 text-[8px] text-center">
          Select a seed or perk to use
        </div>
      </motion.div>
    </motion.div>
  );
}
