import { useGame } from "@/context/GameContext";
import { motion } from "framer-motion";
import { useAccount, useBalance, useSwitchChain } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getWalletBalance } from "@/lib/lifi";
import { Button } from "@/components/ui/button";
import Confetti from "@/components/animations/Confetti";
import { X } from "lucide-react";
import Image from "next/image";

// Daimo Pay
import {
  PaymentBouncedEvent,
  PaymentCompletedEvent,
  PaymentStartedEvent,
} from "@daimo/common";
import { DaimoPayButton } from "@daimo/pay";
import { base, mainnet } from "viem/chains";

import {
  BASE_SCAN_BASE_URL,
  BASE_USDC_ADDRESS,
  BASE_DEGEN_ADDRESS,
} from "@/lib/contracts/constants";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";
import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import { useGiftFertilizers } from "@/hooks/game-actions/use-gift-fertilizers";
import { toast } from "react-hot-toast";
import { useFrameContext } from "@/context/FrameContext";

interface DonationsModalProps {
  onClose: () => void;
}

export default function DonationsModal({ onClose }: DonationsModalProps) {
  const { state, refetchUserItems } = useGame();
  const { address } = useAccount();
  const { chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { safeAreaInsets } = useFrameContext();

  // if user is not on base, switch to base
  useEffect(() => {
    if (chainId !== base.id) {
      switchChain({
        chainId: base.id,
      });
    }
  }, [chainId, switchChain]);

  const [paymentStarted, setPaymentStarted] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [finalTxHash, setFinalTxHash] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // ETH balance on base to send tx
  const { data: balance } = useBalance({
    address,
    chainId: base.id,
  });

  // USD balance of wallet
  const { data: tokenBalancesData } = useQuery({
    queryKey: ["tokenBalances", address],
    queryFn: async () => {
      if (address) {
        const x = await getWalletBalance(address);
        return x;
      }
      return {
        totalBalanceUSD: 0,
        tokenBalances: {},
      };
    },
    enabled: !!address,
  });

  // Check if user has enough ETH balance to gift
  const hasEnoughEthBalance = !!balance && BigInt(balance.value) > BigInt(0);

  // Check if user has enough USD balance to gift
  const hasEnoughUSDBalance =
    !!tokenBalancesData?.totalBalanceUSD &&
    tokenBalancesData.totalBalanceUSD >= 1;

  // Hook for gifting fertilizers
  const { giftFertilizers } = useGiftFertilizers();

  // Handle Daimo events
  const handlePaymentStarted = (e: PaymentStartedEvent) => {
    console.log("Payment started", e);
    setPaymentStarted(true);
  };

  const handlePaymentCompleted = async (e: PaymentCompletedEvent) => {
    console.log("[handlePaymentCompleted] txHash", e.txHash);
    setPaymentCompleted(true);
    setPaymentStarted(false);
    setFinalTxHash(e.txHash);

    try {
      const loadingToast = toast.loading(
        "Distributing fertilizers to all farmers..."
      );
      await giftFertilizers({ mode: state.user.mode });
      toast.success("Fertilizers distributed successfully!", {
        id: loadingToast,
      });
      setShowConfetti(true);
      refetchUserItems();
    } catch (error) {
      console.error("Error gifting fertilizers:", error);
      toast.error("Failed to distribute fertilizers. Please try again.");
      setErrorMessage("Failed to distribute fertilizers. Please try again.");
    }
  };

  const handlePaymentBounced = (e: PaymentBouncedEvent) => {
    console.error("Payment bounced", e);
    setPaymentStarted(false);
    setPaymentCompleted(false);
    setShowConfetti(false);
    setErrorMessage(
      "There was an error processing your payment. You received back your amount in $USDC on your wallet address. Try again."
    );
  };

  const handleShareGift = async () => {
    await sdk.actions.openUrl(
      `https://warpcast.com/~/compose?text=I just gifted fertilizers to all Farville farmers! 🌱%0A%0APlay Farville: https://farville.farm`
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50">
      {showConfetti && <Confetti title="GIFTED!" />}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        style={{
          marginTop: safeAreaInsets.top,
          marginBottom: safeAreaInsets.bottom,
          marginLeft: safeAreaInsets.left,
          marginRight: safeAreaInsets.right,
        }}
        className="bg-[#7e4e31] w-full h-full flex flex-col overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-4 p-3 xs:p-4 mt-2 border-b border-[#8B5c3C]">
          <div className="flex flex-col gap-1">
            <motion.h2
              className="text-white/90 font-bold text-xl xs:text-2xl mb-1 flex items-center gap-2"
              animate={{ rotate: [0, -3, 3, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
            >
              <Image
                src="/images/special/gift.png"
                alt="gift"
                width={30}
                height={30}
                className="w-7 h-7 xs:w-9 xs:h-9 mr-2"
              />
              Donations
            </motion.h2>
            <p className="text-white/60 text-[9px] xs:text-[10px]">
              Help us keep the farm alive! 🌱
            </p>
            <motion.p
              className="text-amber-500/90 text-[8px] drop-shadow-[0_0_3px_rgba(251,191,36,0.7)]"
              animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              5 USDC = 1 Fertilizer for all farmers
            </motion.p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full 
                      bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center gap-8 max-w-md mx-auto w-full px-4 pb-8">
          {/* Gift container with fixed aspect ratio */}
          <div className="relative w-[280px] aspect-square">
            {/* Golden gradient background */}
            <motion.div
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full 
                bg-gradient-radial from-yellow-300 via-yellow-500/30 to-transparent blur-xl"
            />

            {/* Main gift container */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-full h-full rounded-3xl border-8 border-yellow-400/40 
                         bg-gradient-to-br from-yellow-400/20 to-yellow-500/10 shadow-2xl shadow-yellow-400/20
                         flex items-center justify-center overflow-hidden"
            >
              <div className="relative w-3/4 h-3/4">
                <img
                  src="/images/special/gift.png"
                  alt="Gift Fertilizers"
                  className="w-full h-full object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                             [filter:drop-shadow(0_0_15px_rgba(234,179,8,0.5))]"
                />
              </div>
            </motion.div>
          </div>

          {/* Content section */}
          <div className="flex flex-col gap-6 w-full">
            {/* Description card */}
            <div className="bg-[#5C4121]/50 rounded-xl p-6 shadow-lg border border-yellow-400/20">
              <p className="text-yellow-300/90 text-sm text-center font-medium mb-2">
                Gift all farmers a fertilizer!
              </p>
              <p className="text-white/70 text-sm text-center">
                For the price of 5 USDC, a fertilizer will be sent to all
                players (including you). The donor will be displayed in the
                Donators Leaderboard.
              </p>
            </div>

            {errorMessage && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-sm p-3 rounded">
                {errorMessage}
              </div>
            )}

            {!paymentCompleted &&
              address !== undefined &&
              !!tokenBalancesData &&
              (!hasEnoughEthBalance || !hasEnoughUSDBalance) && (
                <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-sm p-3 rounded">
                  Insufficient {!hasEnoughEthBalance ? "ETH" : "USD"} balance to
                  gift. Please add some {hasEnoughEthBalance ? "USD" : "ETH"} to
                  your wallet.
                </div>
              )}

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-lg">Pay</span>
                <span className="text-white/70 text-sm">
                  Balance:{" "}
                  {tokenBalancesData?.totalBalanceUSD
                    ? tokenBalancesData.totalBalanceUSD.toFixed(2)
                    : "0"}{" "}
                  USD
                </span>
              </div>

              <DaimoPayButton.Custom
                appId={env.NEXT_PUBLIC_DAIMO_PAY_ID}
                metadata={{
                  userId: state.user.fid.toString(),
                }}
                preferredChains={[base.id, mainnet.id]}
                preferredTokens={[
                  { chain: base.id, address: BASE_USDC_ADDRESS },
                  { chain: base.id, address: BASE_DEGEN_ADDRESS },
                ]}
                toAddress={address!}
                toChain={base.id}
                toUnits="5"
                toToken={BASE_USDC_ADDRESS}
                closeOnSuccess
                onPaymentStarted={handlePaymentStarted}
                onPaymentCompleted={handlePaymentCompleted}
                onPaymentBounced={handlePaymentBounced}
              >
                {({ show }) => (
                  <Button
                    variant="default"
                    className={cn(
                      "w-full py-3 text-base font-medium",
                      !hasEnoughEthBalance || !hasEnoughUSDBalance
                        ? "text-yellow-400/50 cursor-not-allowed bg-yellow-500/10"
                        : "text-[#5C4121] bg-yellow-500 hover:bg-yellow-500/80 hover:text-[#5C4121]",
                      paymentCompleted &&
                        "bg-green-500 text-green-200 cursor-not-allowed"
                    )}
                    onClick={show}
                    disabled={
                      !hasEnoughEthBalance ||
                      !hasEnoughUSDBalance ||
                      paymentStarted ||
                      paymentCompleted
                    }
                  >
                    {paymentStarted
                      ? "Gifting..."
                      : paymentCompleted
                      ? "Gifted Successfully!"
                      : "Gift Fertilizers"}
                  </Button>
                )}
              </DaimoPayButton.Custom>
            </div>

            {!address && !paymentCompleted && !finalTxHash && (
              <p className="text-center text-sm text-white/70 border border-white/20 rounded-lg px-4 py-2">
                Please connect a wallet to gift fertilizers.
              </p>
            )}

            {paymentCompleted && finalTxHash && (
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleShareGift}
                  className="w-full py-3 text-base font-medium text-[#5C4121] bg-yellow-500 hover:bg-yellow-500/80 hover:text-[#5C4121]"
                >
                  Share Gift 🎁
                </Button>
                <p
                  className="text-white/70 text-sm text-center underline cursor-pointer"
                  onClick={async () => {
                    await sdk.actions.openUrl(
                      BASE_SCAN_BASE_URL + `/tx/${finalTxHash}`
                    );
                  }}
                >
                  View transaction on BaseScan
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
