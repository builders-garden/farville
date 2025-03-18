import { EXPANSION_COSTS } from "@/lib/game-constants";
import { motion } from "framer-motion";

interface ExpansionPanelProps {
  expansionLevel: number;
  userLevel: number;
  userCoins: number;
  onExpand: () => void;
}

export default function ExpansionPanel({
  expansionLevel,
  userLevel,
  userCoins,
  onExpand,
}: ExpansionPanelProps) {
  const hasMoreExpansions = expansionLevel < EXPANSION_COSTS.length;

  if (!hasMoreExpansions) {
    return (
      <div className="bg-[#6d4c2c] px-4 py-3 rounded-lg border border-[#8B5E3C]/50 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <p className="text-white/90">Maximum expansion level reached!</p>
        </div>
      </div>
    );
  }

  const currentExpansion = EXPANSION_COSTS[expansionLevel];
  const canAfford = userCoins >= currentExpansion.coins;
  const hasRequiredLevel = userLevel >= currentExpansion.level;
  const canExpand = canAfford && hasRequiredLevel;

  return (
    <div className="bg-[#6d4c2c] px-4 py-3 rounded-lg border border-[#8B5E3C]/50 shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 flex items-center justify-center">
          <motion.span
            className="text-2xl"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🌟
          </motion.span>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <p className="text-white/90 font-medium">Next Expansion</p>
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-white/60">
              Size:{" "}
              <span className="text-white/90 font-medium">
                {currentExpansion.nextSize.width}x
                {currentExpansion.nextSize.height}
              </span>
            </span>
            <span className="text-white/60">
              Required Level:{" "}
              <span
                className={`font-medium ${
                  hasRequiredLevel ? "text-green-400" : "text-red-400"
                }`}
              >
                {currentExpansion.level}
              </span>
            </span>
          </div>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onExpand}
        disabled={!canExpand}
        className="w-full py-1.5 bg-[#FFB938] text-[#7E4E31] rounded hover:bg-[#ffc65c] 
                 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium
                 border border-white/10"
      >
        {hasRequiredLevel
          ? `Expand for 🪙 ${currentExpansion.coins}`
          : `Reach Level ${currentExpansion.level} to Expand`}
      </motion.button>
    </div>
  );
}
