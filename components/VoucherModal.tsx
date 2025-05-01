"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { useFrameContext } from "@/context/FrameContext";
import { useUserModes } from "@/hooks/use-user-modes";
import { useVoucher } from "@/hooks/use-voucer";
import { useRedeemVoucher } from "@/hooks/game-actions/use-redeem-voucher";
import { useGame } from "@/context/GameContext";
import { useUserVouchers } from "@/hooks/use-user-vouchers";
import { useUserXp } from "@/hooks/use-user-xp";

import { Skeleton } from "@/components/ui/skeleton";
import FloatingNumber from "./animations/FloatingNumber";

import { XP_PER_DONATED_ITEM } from "@/lib/game-constants";
import { FARCON_ATTENDEES_FIDS } from "@/lib/modes/farcon";
import { MODE_DEFINITIONS } from "@/lib/modes/constants";
import { Mode } from "@/lib/types/game";

export default function VoucherModal({
  onClose,
  slug,
}: {
  onClose: () => void;
  slug: string;
}) {
  const { safeAreaInsets } = useFrameContext();
  const {
    state,
    updateUserItems,
    mode,
    setMode,
    initializeMode,
    isActionInProgress,
    setIsActionInProgress,
  } = useGame();
  const [userNotInMode, setUserNotInMode] = useState(false);
  const [isInitializingMode, setIsInitializingMode] = useState(false);
  const {
    userModes,
    isLoading: userModesIsLoading,
    refetch: refetchUserModes,
  } = useUserModes(state.user.fid);

  const { voucher, isLoading: isVoucherLoading } = useVoucher(slug);
  const {
    userVouchers,
    isLoading: isUserVouchersLoading,
    error: errorUserVouchers,
  } = useUserVouchers(state.user?.fid, true, Mode.Farcon);
  const { mutate: redeemVoucher } = useRedeemVoucher({
    isActionInProgress,
    setIsActionInProgress,
  });
  const [showFloatingNumber, setShowFloatingNumber] = useState(false);
  const [rewardedXp, setRewardedXp] = useState(0);
  const { addUserXpsAndCheckLevelUp } = useUserXp();

  useEffect(() => {
    if (!voucher || !userModes || userModesIsLoading) return;
    if (!userModes.includes(voucher.mode as Mode)) {
      setUserNotInMode(true);
    } else if (
      userModes.includes(voucher.mode as Mode) &&
      voucher.mode &&
      mode !== voucher.mode
    ) {
      setMode(voucher.mode as Mode);
      setUserNotInMode(false);
    }
  }, [voucher, setMode, mode, state.user.fid, userModes, userModesIsLoading]);

  useEffect(() => {
    if (isActionInProgress) {
      setIsInitializingMode(true);
    } else if (!isActionInProgress && isInitializingMode) {
      setIsInitializingMode(false);
      refetchUserModes();
    }
  }, [isActionInProgress, isInitializingMode, refetchUserModes]);

  // Calculate remaining quantity needed
  const userVoucher = userVouchers
    ? userVouchers.find((v) => v.voucher.slug === slug)
    : null;
  const remainingQuantity =
    userVoucher && userVoucher.voucher.quantity
      ? userVoucher.voucher.quantity - (userVoucher.claimedAmount || 0)
      : voucher?.quantity || 0;

  const userCanRedeem =
    !userVoucher ||
    (userVoucher && userVoucher.claimedAmount <= userVoucher.voucher.quantity);

  const handleRedeemVoucher = (slug: string) => {
    const rewardedXp = 1 * XP_PER_DONATED_ITEM;
    setRewardedXp(rewardedXp);
    redeemVoucher({
      voucherSlug: slug,
      mode: Mode.Farcon,
    });
    if (voucher?.itemId && voucher.item) {
      updateUserItems([
        {
          itemId: voucher.itemId,
          quantity: voucher.quantity,
          item: voucher.item,
        },
      ]);
    }
    setShowFloatingNumber(true);
    addUserXpsAndCheckLevelUp(rewardedXp);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  if (
    (!voucher && isVoucherLoading) ||
    (!userVoucher && isUserVouchersLoading)
  ) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-fit bg-white/90 text-emerald-500 rounded-xl text-center p-4 transform shadow-lg border border-emerald-100"
        >
          <div className="flex items-center gap-4 font-medium">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 aspect-square border-[3px] border-emerald-500 border-t-transparent rounded-full text-sm"
            />
            Loading Voucher
          </div>
        </motion.div>
      </div>
    );
  }

  if (errorUserVouchers) {
    // user is not attending farcon
    console.log("user is not attending farcon", errorUserVouchers);
    return null;
  }

  // voucher not found
  if (!voucher && !isVoucherLoading) {
    return (
      <div className="bg-white text-red-500 rounded-lg text-center p-4 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        Error: Voucher not found
      </div>
    );
  }
  if (!voucher) {
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
              className="w-7 h-7 xs:w-8 xs:h-8 text-white/90 flex items-center justify-center text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Content area */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3 xs:gap-4 min-h-0">
            {isVoucherLoading || isUserVouchersLoading ? (
              <div className="flex flex-col items-center gap-3 xs:gap-4">
                <Skeleton className="w-20 h-20 xs:w-24 xs:h-24 rounded-full bg-white/10" />
                <div className="space-y-2">
                  <Skeleton className="w-40 xs:w-48 h-5 xs:h-6 bg-white/10" />
                  <Skeleton className="w-28 xs:w-32 h-5 xs:h-6 bg-white/10" />
                </div>
              </div>
            ) : (
              <>
                {/* Updated Request Text */}
                <div className="flex flex-col items-center text-center text-white/90 gap-3 xs:gap-4">
                  <Image
                    src={`/images/vouchers/${
                      voucher?.slug || "farcon-nyc"
                    }.png`}
                    alt={`${voucher?.item?.name} ${voucher?.item?.category} image`}
                    className="w-[75%] object-contain rounded-lg"
                    width={128}
                    height={128}
                  />

                  <div className="flex flex-col gap-1.5 xs:gap-2 items-center">
                    <div className="flex flex-col gap-1 items-center">
                      <p className="text-lg xs:text-xl font-bold text-white">
                        {voucher?.name}
                      </p>
                      <p className="text-md xs:text-lg font-bold text-white">
                        voucher
                      </p>
                    </div>
                    {userVoucher?.claimedAmount &&
                      userVoucher?.claimedAmount > 0 && (
                        <p className="text-xs xs:text-sm text-white/60">
                          ({userVoucher?.claimedAmount} of{" "}
                          {userVoucher?.voucher.quantity} claimed)
                        </p>
                      )}
                  </div>
                </div>

                {!userCanRedeem ? (
                  <div className="flex flex-col items-center gap-1.5 xs:gap-3 mt-1.5 xs:mt-2">
                    {remainingQuantity === 0 && (
                      <p className="text-green-400/90 text-xs xs:text-sm text-center">
                        You already redeemed the voucher {voucher?.name} x
                        {voucher?.quantity}!
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 xs:gap-2 mt-1.5 xs:mt-2">
                    {remainingQuantity > 0 ? (
                      <>
                        <p className="text-white text-[18px] xs:text-xs flex items-center gap-1.5">
                          Redeem
                          <span className="text-amber-500 font-medium">
                            {remainingQuantity}x
                          </span>
                          {voucher?.item?.name}
                          {"s "}
                          {voucher?.item?.icon ? (
                            <motion.img
                              src={`/images${voucher.item.icon}`}
                              alt={`${voucher.item.name} ${voucher.item.category} image`}
                              className="w-8 h-8 object-contain"
                              animate={{ y: [0, -2, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          ) : null}
                        </p>
                        <p className="text-white/60 text-xs font-small break-words max-w-xs text-center mt-2">
                          {voucher?.item?.description}
                        </p>
                        {remainingQuantity === 0 ? (
                          <p className="text-green-400/90 text-xs xs:text-sm text-center">
                            This request has been fully filled!
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <p className="text-amber-500/90 text-xs xs:text-sm text-center">
                        You already claimed this voucher x{voucher?.quantity}!
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          {userNotInMode && FARCON_ATTENDEES_FIDS.includes(state.user.fid) ? (
            <button
              onClick={() => {
                initializeMode({
                  mode: voucher.mode as Mode,
                });
              }}
              disabled={isActionInProgress}
              className="px-4 xs:px-6 py-2 xs:py-2.5 bg-green-600/80 hover:bg-green-600 rounded-lg text-white/90 
                   transition-colors font-medium text-xs xs:text-sm disabled:bg-green-600/20"
            >
              {!isInitializingMode
                ? `Join the ${MODE_DEFINITIONS[voucher.mode as Mode].name} mode`
                : "Joining..."}
            </button>
          ) : userCanRedeem ? (
            <div className="flex-none p-3 xs:p-4">
              <div className="flex flex-col-reverse justify-center gap-2 xs:gap-3">
                <button
                  onClick={onClose}
                  className="px-4 xs:px-6 py-2 xs:py-2.5 bg-black/10 hover:bg-black/30 rounded-lg text-white/90 
                         transition-colors font-medium text-xs xs:text-sm"
                >
                  Cancel
                </button>

                <button
                  disabled={remainingQuantity === 0 || isUserVouchersLoading}
                  onClick={() => handleRedeemVoucher(slug)}
                  className="px-4 xs:px-6 py-2 group flex items-center gap-2 bg-gradient-to-r from-[#FFB938] to-[#FFA000] text-[#7E4E31] 
                    rounded-lg font-bold hover:from-[#ffc661] hover:to-[#FFB938] transition-all duration-300 disabled:bg-[#FFB938]/20 disabled:cursor-not-allowed
                    transform hover:scale-105 hover:shadow-lg text-xs xs:text-sm justify-center"
                >
                  Redeem
                </button>
              </div>
            </div>
          ) : null}

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
