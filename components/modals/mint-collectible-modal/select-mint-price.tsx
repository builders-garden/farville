import { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import { UsdcLogo } from "./usdc-logo";

import { formatNumberWithSuffix } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SelectMintPriceProps {
  totalBalanceUSD: number;
  selectedPrice: number;
  setSelectedPrice: Dispatch<SetStateAction<number>>;
}

export const SelectMintPrice = ({
  totalBalanceUSD,
  selectedPrice,
  setSelectedPrice,
}: SelectMintPriceProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="w-full flex flex-row items-center justify-between gap-2">
        <span className="text-white/70 text-lg">Pay</span>
        {/* USDC balance */}
        <div className="w-full flex items-center justify-end gap-2">
          <span className="flex flex-row items-center gap-1 text-white/70 text-[8px]">
            You have{" "}
            {totalBalanceUSD > 0
              ? formatNumberWithSuffix(totalBalanceUSD)
              : "0"}{" "}
            USD
          </span>
          <UsdcLogo />
        </div>
      </div>

      {/* SELECT MINT PRICE */}
      <div className="w-full flex flex-row items-center justify-between gap-2">
        <div className="w-full relative flex flex-row items-center gap-2">
          {[1, 3, 5].map((price) => (
            <Button
              key={`mint-price-${price}`}
              variant="ghost"
              onClick={() => setSelectedPrice(price)}
              className={cn(
                "text-md px-3 w-full rounded-md text-white font-semibold",
                selectedPrice === price
                  ? "bg-[#8A5F3C] opacity-100 border-2 border-white/80"
                  : "bg-[#8A5F3C] hover:bg-[#8A5F3C]/80 hover:text-white/80 opacity-80 border-2 border-transparent hover:border-white/80"
              )}
            >
              ${price}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
