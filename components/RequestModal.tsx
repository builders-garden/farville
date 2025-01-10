"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useFrameContext } from "../context/FrameContext";
import { useUser } from "@/hooks/use-user";
import { useItem } from "@/hooks/use-item";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useDonate } from "@/hooks/game-actions/use-donate";
import { useGame } from "@/context/GameContext";

export default function RequestModal({
  onClose,
  fid,
  itemId,
  quantity,
}: {
  onClose: () => void;
  fid: number;
  itemId?: number;
  quantity?: number;
}) {
  const { safeAreaInsets } = useFrameContext();
  const { user } = useUser({ fid });
  const { data: item, isLoading } = useItem(itemId!);
  const { donate } = useDonate();
  const { state } = useGame();
  const currentQuantity =
    state.inventory.find((seed) => seed.itemId === itemId)?.quantity || 0;
  const [selectedQuantity, setSelectedQuantity] = useState(() => {
    if (currentQuantity > 0) {
      return Math.min(currentQuantity, quantity || 0);
    }
    return 0;
  });

  const handleMaxQuantity = () => {
    setSelectedQuantity(Math.min(currentQuantity, quantity!));
  };

  const handleQuantityChange = (value: string) => {
    if (value === "") {
      setSelectedQuantity(0);
      return;
    }

    // Allow any valid number input, including multi-digit numbers
    const numericValue = value.replace(/[^0-9]/g, "");

    // Convert to number
    const newQuantity = parseInt(numericValue);

    // Only enforce limits if the input is a valid number
    if (!isNaN(newQuantity)) {
      // Allow typing any number, even if it exceeds the max
      setSelectedQuantity(newQuantity);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-[#7E4E31] w-full h-[calc(100%-env(safe-area-inset-top)-env(safe-area-inset-bottom))]"
      >
        <div
          className="w-full h-full p-4 sm:p-6 flex flex-col max-w-4xl mx-auto"
          style={{
            marginTop: safeAreaInsets.top,
            marginBottom: safeAreaInsets.bottom,
            marginLeft: safeAreaInsets.left,
            marginRight: safeAreaInsets.right,
          }}
        >
          {/* Header */}
          <div className="flex justify-end items-center mb-4">
            <button
              onClick={onClose}
              className="w-8 h-8 hover:bg-black/20 rounded-full transition-colors text-white/90 
                       flex items-center justify-center hover:rotate-90 transform duration-200"
            >
              ✕
            </button>
          </div>

          {/* Content area */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-0">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="w-24 h-24 rounded-full bg-white/10" />
                <div className="space-y-2">
                  <Skeleton className="w-48 h-6 bg-white/10" />
                  <Skeleton className="w-32 h-6 bg-white/10" />
                </div>
              </div>
            ) : (
              user &&
              item && (
                <>
                  {/* Profile Picture - Reduced size on mobile */}
                  {user.avatarUrl && (
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-2 sm:mb-4">
                      <Image
                        src={user.avatarUrl}
                        alt={user.username || "User"}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                  )}

                  {/* Request Text - Reduced text sizes and spacing */}
                  <div className="flex flex-col items-center text-center text-white/90 gap-4">
                    <div className="flex flex-col gap-1 items-center">
                      <p className="text-base sm:text-lg font-medium text-white/80">
                        {user.username}
                      </p>
                      <p className="text-sm sm:text-base text-white/60">
                        is looking for
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 items-center">
                      <div className="flex flex-row gap-2 items-center">
                        <p className="text-xl sm:text-2xl font-semibold text-white">
                          {quantity}x
                        </p>
                        <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                          <Image
                            src={`/images${item.icon}`}
                            alt={item.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-white">
                        {item.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 mt-2">
                    {currentQuantity > 0 ? (
                      <>
                        <p className="text-white/80 text-xs sm:text-sm">
                          You have{" "}
                          <span className="text-amber-500 font-medium">
                            {currentQuantity}x
                          </span>{" "}
                          in inventory
                        </p>
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-white/80 text-[10px] sm:text-sm text-center">
                            Enter amount to donate
                          </p>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={selectedQuantity || ""}
                              onChange={(e) =>
                                handleQuantityChange(e.target.value)
                              }
                              min="0"
                              max={Math.min(currentQuantity, quantity!)}
                              className="w-16 sm:w-20 px-2 py-1.5 bg-white/20 rounded-lg text-white text-center 
                                       focus:outline-none focus:ring-2 focus:ring-white/20"
                            />
                            <button
                              onClick={handleMaxQuantity}
                              className="px-3 py-1.5 border border-white/90 rounded-lg text-white/90 
                                       transition-colors text-xs sm:text-sm font-medium"
                            >
                              Max
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-amber-500/90 text-sm text-center">
                        You don&apos;t have any {item.name} in your inventory
                      </p>
                    )}
                  </div>
                </>
              )
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex-none p-4">
            <div className="flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-6 sm:px-8 py-2.5 bg-black/10 hover:bg-black/30 rounded-lg text-white/90 
                         transition-colors font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                disabled={
                  selectedQuantity === 0 || selectedQuantity > currentQuantity
                }
                onClick={() => {
                  donate({ itemId, quantity: selectedQuantity, toFid: fid });
                  onClose();
                }}
                className="px-6 sm:px-8 py-2.5 bg-green-600/80 hover:bg-green-600 disabled:bg-green-600/20 
                         disabled:text-white/50 disabled:cursor-not-allowed rounded-lg text-white transition-colors 
                         font-medium text-sm sm:text-base"
              >
                Donate {selectedQuantity}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
