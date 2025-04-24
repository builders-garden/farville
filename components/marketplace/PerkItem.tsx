import { DbItem } from "@/supabase/types";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Input } from "../ui/input";

interface PerkItemProps {
  perk: DbItem;
  ownedQuantity: number;
  onBuyClick: (itemId: number, quantity: number) => void;
  gridSize: number;
  userCoins: number;
}

export default function PerkItem({
  perk,
  ownedQuantity,
  onBuyClick,
  gridSize,
  userCoins,
}: PerkItemProps) {
  const [customQuantity, setCustomQuantity] = useState<string>("");
  const buttons = gridSize > 10 ? [1, 5, 10, gridSize] : [1, 5, 10];

  const handleCustomQuantityChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/\D/g, "");
    const numValue = value === "" ? 0 : parseInt(value, 10);
    const maxPurchase = Math.floor(userCoins / (perk.buyPrice || 1));

    if (numValue > maxPurchase) {
      setCustomQuantity(maxPurchase.toString());
      return;
    }

    setCustomQuantity(value);
  };

  const handleCustomQuantitySubmit = () => {
    const quantity = parseInt(customQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) return;
    onBuyClick(perk.id, quantity);
    setCustomQuantity("");
  };

  return (
    <motion.div
      key={perk.id}
      className="bg-[#6d4c2c] px-3 xs:px-4 py-3 xs:py-3 rounded-lg flex flex-col gap-2 xs:gap-4
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
            {perk.buyPrice && (
              <p className="text-white/90 flex items-center text-xs xs:text-sm">
                <span className="pb-1 mr-1">🪙</span>
                {perk.buyPrice}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-0.5 xs:gap-1">
            <p className="text-white/90 text-[9px] xs:text-[10px]">
              Owned: {ownedQuantity ? ownedQuantity : 0}
            </p>
            <p className="text-white/60 text-[9px] xs:text-[10px]">
              {perk.description}
            </p>
            {!perk.buyPrice && (
              <p className="text-white/60 text-[9px] xs:text-[10px]">
                (this perk is not available for purchase. You can only earn it)
              </p>
            )}
          </div>
        </div>
      </div>
      {perk.buyPrice && (
        <div className="flex flex-col gap-1 w-full">
          <div className="flex gap-3 ml-13 md:ml-0 items-center">
            <span className="text-[10px] xs:text-xs w-fit text-white/90 pl-1">
              Buy
            </span>
            <div className="flex gap-2 w-full">
              {buttons.map((amount) => (
                <motion.button
                  key={amount}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    onBuyClick(perk.id, amount);
                  }}
                  disabled={userCoins < (perk.buyPrice || 0) * amount}
                  className="w-full px-1 xs:px-2 py-1 xs:py-1.5 bg-[#2B593B] text-white/90 rounded hover:bg-[#346344] 
                  transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[10px] xs:text-xs font-medium
                  border border-white/10"
                  data-testid={`market-buy-perk-${perk.slug}-${amount}`}
                >
                  {amount}
                </motion.button>
              ))}
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem
              value="custom-quantity"
              className="border-0 pb-0 pt-1 xs:pt-2"
            >
              <AccordionTrigger className="py-0.5 xs:py-1 text-[10px] xs:text-xs text-white/70 hover:no-underline">
                Custom quantity
              </AccordionTrigger>
              <AccordionContent className="pt-1 xs:pt-2 pb-0">
                <div className="flex flex-col gap-1 xs:gap-2">
                  <div className="flex gap-2 items-center w-full justify-between">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={customQuantity}
                      onChange={handleCustomQuantityChange}
                      className="h-6 xs:h-7 bg-[#5A4129] border-[#8B5E3C] text-white/90 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 max-w-[50%]"
                      placeholder="Quantity"
                      style={{ fontSize: "16px" }}
                      onFocus={(e) => {
                        e.currentTarget.style.fontSize = "16px";
                        e.currentTarget.select();
                      }}
                    />
                    <div className="text-[10px] xs:text-xs text-white/80">
                      {!isNaN(parseInt(customQuantity, 10))
                        ? parseInt(customQuantity, 10) * (perk.buyPrice || 0)
                        : 0}{" "}
                      🪙
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCustomQuantitySubmit}
                    disabled={
                      isNaN(parseInt(customQuantity, 10)) ||
                      parseInt(customQuantity, 10) <= 0 ||
                      userCoins <
                        (perk.buyPrice || 0) * parseInt(customQuantity, 10)
                    }
                    className="w-full px-2 xs:px-3 py-1.5 xs:py-2 bg-[#2B593B] text-white/90 rounded hover:bg-[#346344] 
                            transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[10px] xs:text-xs font-medium
                            border border-white/10"
                  >
                    Buy {customQuantity}
                  </motion.button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </motion.div>
  );
}
