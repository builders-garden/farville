"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useFrameContext } from "../context/FrameContext";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useDonate } from "@/hooks/game-actions/use-donate";
import { useGame } from "@/context/GameContext";
import { useRequest } from "@/hooks/use-request";
import { useDonationHistory } from "@/hooks/use-donation-history";
import {
  MAX_DAILY_ALLOWED_DONATION_BETWEEN_USERS,
  MAX_DAILY_ALLOWED_DONATION_TO_USERS,
  XP_PER_DONATED_ITEM,
} from "@/lib/game-constants";
import FloatingNumber from "./animations/FloatingNumber";
import { useUserXp } from "@/hooks/use-user-xp";

export default function RequestModal({
  onClose,
  id,
}: {
  onClose: () => void;
  id: number;
}) {
  const { safeAreaInsets } = useFrameContext();
  const { request, isLoading } = useRequest(id);
  const { donate } = useDonate();
  const { state, updateUserItems } = useGame();
  const {
    donationsLast24h,
    lastDonation,
    isLoading: isDonationHistoryLoading,
  } = useDonationHistory(state.user?.fid, request?.fid);
  const [showFloatingNumber, setShowFloatingNumber] = useState(false);
  const [rewardedXp, setRewardedXp] = useState(0);
  const { addUserXpsAndCheckLevelUp } = useUserXp();

  // Add check for user's own request
  const isOwnRequest = request?.fid === state.user?.fid;

  const currentQuantity =
    state.inventory.find((seed) => seed.itemId === request?.itemId)?.quantity ||
    0;

  // Calculate remaining quantity needed
  const remainingQuantity = request
    ? request.quantity - (request.filledQuantity || 0)
    : 0;

  const [selectedQuantity, setSelectedQuantity] = useState(() => {
    if (currentQuantity > 0) {
      return Math.min(currentQuantity, remainingQuantity);
    }
    return 0;
  });

  const handleMaxQuantity = () => {
    setSelectedQuantity(Math.min(currentQuantity, remainingQuantity));
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
      // Enforce maximum limit based on both current inventory and remaining quantity needed
      const maxAllowed = Math.min(currentQuantity, remainingQuantity);
      setSelectedQuantity(Math.min(newQuantity, maxAllowed));
    }
  };

  if (!request && !isLoading) {
    return (
      <div className="bg-white text-red-500 rounded-lg text-center p-4 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        Error: Request not found
      </div>
    );
  }

  if (!request && isLoading) {
    return (
      <div className="bg-white text-emerald-500 rounded-lg text-center p-4 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        Loading Request...
      </div>
    );
  }

  if (!request) {
    return <></>;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-[#7E4E31] w-full h-[calc(100%-env(safe-area-inset-top)-env(safe-area-inset-bottom))]"
      >
        <div
          className="w-full h-full p-3 xs:p-4 flex flex-col max-w-4xl mx-auto"
          style={{
            marginTop: safeAreaInsets.top,
            marginBottom: safeAreaInsets.bottom,
            marginLeft: safeAreaInsets.left,
            marginRight: safeAreaInsets.right,
          }}
        >
          {/* Header */}
          <div className="flex justify-end items-center mb-2 xs:mb-4">
            <button
              onClick={onClose}
              className="w-7 h-7 xs:w-8 xs:h-8 hover:bg-black/20 rounded-full transition-colors text-white/90 
                      flex items-center justify-center hover:rotate-90 transform duration-200"
            >
              ✕
            </button>
          </div>

          {/* Content area */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3 xs:gap-4 min-h-0">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3 xs:gap-4">
                <Skeleton className="w-20 h-20 xs:w-24 xs:h-24 rounded-full bg-white/10" />
                <div className="space-y-2">
                  <Skeleton className="w-40 xs:w-48 h-5 xs:h-6 bg-white/10" />
                  <Skeleton className="w-28 xs:w-32 h-5 xs:h-6 bg-white/10" />
                </div>
              </div>
            ) : (
              request?.user &&
              request?.item && (
                <>
                  {/* Profile Picture - Keep original size */}
                  {(request?.user?.selectedAvatarUrl ||
                    request?.user?.avatarUrl) && (
                    <div className="relative w-16 h-16 xs:w-20 xs:h-20 mb-2 xs:mb-4">
                      <Image
                        src={
                          request?.user?.selectedAvatarUrl ||
                          request?.user?.avatarUrl ||
                          ""
                        }
                        alt={request?.user?.username || "User"}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                  )}

                  {/* Updated Request Text */}
                  <div className="flex flex-col items-center text-center text-white/90 gap-3 xs:gap-4">
                    <div className="flex flex-col gap-0.5 xs:gap-1 items-center">
                      <p className="text-sm xs:text-base font-medium text-white/80">
                        {request?.user?.username}
                      </p>
                      <p className="text-xs xs:text-sm text-white/60">
                        is looking for
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 xs:gap-2 items-center">
                      <div className="flex flex-row gap-1.5 xs:gap-2 items-center">
                        <p className="text-lg xs:text-xl font-semibold text-white">
                          {remainingQuantity}x
                        </p>
                        <div className="relative w-7 h-7 xs:w-8 xs:h-8">
                          <Image
                            src={`/images${request?.item?.icon}`}
                            alt={request?.item?.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                      <p className="text-xl xs:text-2xl font-bold text-white">
                        {request?.item?.name}
                      </p>
                      {request.filledQuantity > 0 && (
                        <p className="text-xs xs:text-sm text-white/60">
                          ({request.filledQuantity} of {request.quantity}{" "}
                          received)
                        </p>
                      )}
                    </div>
                  </div>

                  {lastDonation &&
                  lastDonation.times >=
                    MAX_DAILY_ALLOWED_DONATION_BETWEEN_USERS &&
                  new Date(lastDonation.lastDonation).toDateString() ===
                    new Date().toDateString() ? (
                    <div className="flex flex-col items-center gap-1.5 xs:gap-2 mt-1.5 xs:mt-2">
                      <p className="text-amber-500/90 text-xs xs:text-sm text-center">
                        You can only donate to the same user{" "}
                        {MAX_DAILY_ALLOWED_DONATION_BETWEEN_USERS} times a day
                      </p>
                    </div>
                  ) : donationsLast24h &&
                    donationsLast24h >= MAX_DAILY_ALLOWED_DONATION_TO_USERS ? (
                    <div className="flex flex-col items-center gap-1.5 xs:gap-2 mt-1.5 xs:mt-2">
                      <p className="text-amber-500/90 text-xs xs:text-sm text-center">
                        You can only donate to{" "}
                        {MAX_DAILY_ALLOWED_DONATION_TO_USERS} farmers a day
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 xs:gap-2 mt-1.5 xs:mt-2">
                      {isOwnRequest ? (
                        <p className="text-amber-500/90 text-xs xs:text-sm text-center">
                          You can&apos;t donate to yourself
                        </p>
                      ) : currentQuantity > 0 ? (
                        <>
                          <p className="text-white/80 text-[10px] xs:text-xs">
                            You have{" "}
                            <span className="text-amber-500 font-medium">
                              {currentQuantity}x
                            </span>{" "}
                            in inventory
                          </p>
                          {remainingQuantity > 0 ? (
                            <div className="flex flex-col items-center gap-1.5 xs:gap-2">
                              <p className="text-white/80 text-[9px] xs:text-[10px] text-center">
                                Enter amount to donate
                              </p>
                              <div className="flex items-center gap-2 xs:gap-3">
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={selectedQuantity || ""}
                                  onChange={(e) =>
                                    handleQuantityChange(e.target.value)
                                  }
                                  min="0"
                                  max={Math.min(
                                    currentQuantity,
                                    remainingQuantity
                                  )}
                                  className="w-14 xs:w-16 px-1.5 xs:px-2 py-1 xs:py-1.5 bg-white/20 rounded-lg text-white text-center 
                                           focus:outline-none focus:ring-2 focus:ring-white/20"
                                />
                                <button
                                  onClick={handleMaxQuantity}
                                  className="px-2 xs:px-3 py-1 xs:py-1.5 border border-white/90 rounded-lg text-white/90 
                                           transition-colors text-[10px] xs:text-xs font-medium"
                                >
                                  Max
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-green-400/90 text-xs xs:text-sm text-center">
                              This request has been fully filled!
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-amber-500/90 text-xs xs:text-sm text-center">
                          You don&apos;t have any {request?.item?.name} in your
                          inventory
                        </p>
                      )}
                    </div>
                  )}
                </>
              )
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex-none p-3 xs:p-4">
            <div className="flex justify-center gap-2 xs:gap-3">
              <button
                onClick={onClose}
                className="px-4 xs:px-6 py-2 xs:py-2.5 bg-black/10 hover:bg-black/30 rounded-lg text-white/90 
                         transition-colors font-medium text-xs xs:text-sm"
              >
                Cancel
              </button>
              {!isOwnRequest && (
                <button
                  disabled={
                    selectedQuantity === 0 ||
                    selectedQuantity > currentQuantity ||
                    selectedQuantity > remainingQuantity ||
                    remainingQuantity === 0 ||
                    showFloatingNumber ||
                    isDonationHistoryLoading
                  }
                  onClick={() => {
                    // Add safety check here as well
                    const safeQuantity = Math.min(
                      selectedQuantity,
                      remainingQuantity,
                      currentQuantity
                    );
                    const rewardedXp = safeQuantity * XP_PER_DONATED_ITEM;
                    setRewardedXp(rewardedXp);
                    donate({
                      itemId: request?.itemId,
                      quantity: safeQuantity,
                      toFid: request?.fid,
                      requestId: request?.id,
                    });
                    updateUserItems([
                      {
                        itemId: request?.itemId,
                        quantity: currentQuantity - safeQuantity,
                        item: request?.item,
                      },
                    ]);
                    setShowFloatingNumber(true);
                    addUserXpsAndCheckLevelUp(rewardedXp);
                    setTimeout(() => {
                      onClose();
                    }, 1000);
                  }}
                  className="px-4 xs:px-6 py-2 xs:py-2.5 bg-green-600/80 hover:bg-green-600 disabled:bg-green-600/20 
                           disabled:text-white/50 disabled:cursor-not-allowed rounded-lg text-white transition-colors 
                           font-medium text-xs xs:text-sm"
                >
                  {remainingQuantity === 0
                    ? "Request Filled"
                    : `Donate ${selectedQuantity}`}
                </button>
              )}
            </div>
          </div>

          {showFloatingNumber && rewardedXp > 0 && (
            <FloatingNumber
              number={rewardedXp}
              x={window.innerWidth / 2}
              y={window.innerHeight / 2}
              type="xp"
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
