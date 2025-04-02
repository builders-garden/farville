import { DbItem } from "@/supabase/types";
import { motion } from "framer-motion";

interface PerkItemProps {
  perk: DbItem;
  ownedQuantity: number;
  onBuyClick: (itemId: number, quantity: number) => void;
  gridSize: number;
}

export default function PerkItem({
  perk,
  ownedQuantity,
  onBuyClick,
  gridSize,
}: PerkItemProps) {
  return (
    <motion.div
      key={perk.id}
      className="bg-[#6d4c2c] p-3 rounded-lg flex flex-col sm:flex-row sm:items-start gap-2 xs:gap-4
                 border border-[#8B5E3C]/50 shadow-md hover:bg-[#7d583a] transition-colors"
    >
      <div className="flex sm:flex-1 items-start gap-2 xs:gap-4 min-w-0">
        <div className="flex flex-col items-center gap-1 xs:gap-2 flex-shrink-0">
          <div className="w-10 h-10 xs:w-12 xs:h-12 bg-[#8B5E3C]/30 rounded-lg flex items-center justify-center">
            <motion.img
              src={`/images${perk.icon}`}
              alt={perk.name}
              className="w-6 h-6 xs:w-8 xs:h-8 object-contain"
              animate={{ y: [0, -2, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          </div>
        </div>
        <div className="flex flex-col min-w-0 gap-0.5 xs:gap-1">
          <div className="flex flex-row justify-between items-center">
            <h3 className="text-xs xs:text-sm text-white/90 font-medium">
              {perk.name}
            </h3>
            <p className="text-white/90 flex items-center text-xs xs:text-sm">
              <span className="pb-1 mr-1">🪙</span>
              {perk.buyPrice}
            </p>
          </div>
          <div className="flex flex-col gap-0.5 xs:gap-1">
            <p className="text-white/90 text-[9px] xs:text-[10px]">
              Owned: {ownedQuantity ? ownedQuantity : 0}
            </p>
            <p className="text-white/60 text-[9px] xs:text-[10px]">
              {perk.description}
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-3 ml-13 md:ml-0 items-center">
        <span className="text-[10px] xs:text-xs w-fit text-white/90 pl-1">
          Buy
        </span>
        <div className="flex gap-2 w-full">
          {[1, 5, 10, gridSize].map((amount) => (
            <motion.button
              key={amount}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                onBuyClick(perk.id, amount);
              }}
              className="w-full px-1 xs:px-2 py-1 xs:py-1.5 bg-[#2B593B] text-white/90 rounded hover:bg-[#346344] 
                transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[10px] xs:text-xs font-medium
                border border-white/10"
            >
              {amount}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
