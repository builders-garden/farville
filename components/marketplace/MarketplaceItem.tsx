import { DbItem } from "@/supabase/types";
import { motion } from "framer-motion";
import RequestButton from "../ui/request-button";

interface MarketplaceItemProps {
  item: DbItem;
  ownedQuantity: number;
  index: number;
  isLevelRequired: boolean;
  requiredLevel?: number;
  onItemSelect: (item: DbItem) => void;
  onRequestClick: (item: DbItem) => void;
  onBuyClick: (itemId: number, quantity: number) => void;
  gridSize: number;
  canBuy?: boolean;
}

export default function MarketplaceItem({
  item,
  ownedQuantity,
  index,
  isLevelRequired,
  requiredLevel,
  onItemSelect,
  onRequestClick,
  onBuyClick,
  gridSize,
  canBuy = true,
}: MarketplaceItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-[#6d4c2c] px-4 py-3 rounded-lg flex flex-col md:flex-row md:items-center gap-3
               border border-[#8B5E3C]/50 shadow-md relative
               hover:bg-[#7d583a] transition-colors ${
                 isLevelRequired ? "opacity-75" : ""
               }`}
    >
      {isLevelRequired && (
        <div className="absolute inset-0 bg-red-900/20 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
          <span className="text-white/90 font-medium bg-red-900/90 px-3 py-1 rounded-lg text-sm">
            Level {requiredLevel} Required
          </span>
        </div>
      )}
      <div
        className="flex items-center gap-3 flex-1"
        id="card-header"
        onClick={() => onItemSelect(item)}
      >
        <div className="w-10 h-10 flex items-center justify-center">
          <motion.img
            src={`/images${item.icon}`}
            alt={item.name}
            className="w-8 h-8 object-contain"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex flex-row gap-1 justify-between">
            <p className="text-white/90 font-medium cursor-pointer hover:text-white">
              {item.name}
            </p>
            <p className="text-white/90 flex items-center">
              <span className="pb-1 mr-1">🪙</span>
              {item.category === "crop" ? item.sellPrice : item.buyPrice}
            </p>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-white/60">
              Owned:
              <span className="text-white/90 font-medium ml-1">
                {ownedQuantity}
              </span>
            </span>
            <RequestButton
              variant="secondary"
              onClick={() => onRequestClick(item)}
            />
          </div>
        </div>
      </div>

      {canBuy && (
        <div className="flex gap-4 ml-13 md:ml-0 items-center">
          <span className="text-xs w-fit text-white/90">
            {item.category === "crop" ? "Sell" : "Buy"}
          </span>
          <div className="flex gap-2 w-full">
            {item.category === "crop"
              ? // Sell options for crops
                [1, 5, 10, "ALL"].map((amount) => (
                  <BuySellButton
                    key={amount}
                    amount={amount}
                    itemId={item.id}
                    disabled={
                      ownedQuantity < (amount === "ALL" ? 1 : Number(amount))
                    }
                    onClick={onBuyClick}
                  />
                ))
              : // Buy options for seeds and perks
                [1, 5, 10, gridSize].map((amount) => (
                  <BuySellButton
                    key={amount}
                    amount={amount}
                    itemId={item.id}
                    disabled={false}
                    onClick={onBuyClick}
                  />
                ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function BuySellButton({
  amount,
  itemId,
  disabled,
  onClick,
}: {
  amount: number | string;
  itemId: number;
  disabled: boolean;
  onClick: (itemId: number, quantity: number) => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        const quantity = amount === "ALL" ? -1 : Number(amount);
        onClick(itemId, quantity);
      }}
      disabled={disabled}
      className="w-full px-2 py-1.5 bg-[#2B593B] text-white/90 rounded hover:bg-[#346344] 
            transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium
            border border-white/10"
    >
      {amount}
    </motion.button>
  );
}
