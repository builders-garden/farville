import { useGame } from "@/context/GameContext";
import { motion } from "framer-motion";
import { useAccount, useBalance, useSwitchChain } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getWalletBalance } from "@/lib/lifi";
import { Button } from "@/components/ui/button";
import Confetti from "@/components/animations/Confetti";
import { X } from "lucide-react";
import { PaymentCompletedEvent } from "@daimo/common";
import { DaimoPayButton } from "@daimo/pay";
import { base } from "viem/chains";
import {
  BASE_SCAN_BASE_URL,
  BASE_USDC_ADDRESS,
  BG_MULTISIG_ADDRESS,
} from "@/lib/contracts/constants";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";
import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import { toast } from "react-hot-toast";
import { useFrameContext } from "@/context/FrameContext";
import { Progress } from "@/components/ui/progress";

interface FarmersPowerModalProps {
  onClose: () => void;
}

const POWER_STAGES = Array.from({ length: 24 }, (_, i) => ({
  stage: i + 1,
  fpRequired: Math.floor(1000 * Math.pow(1.2, i)),
  boost: (i + 1) * 0.5,
}));

const MAX_COMBO = 10;
const COMBO_WINDOW = 10 * 60 * 1000; // 10 minutes in milliseconds
const DECAY_INTERVAL = 600; // 600 minutes (10 hours) for power stage decay

export default function FarmersPowerModal({ onClose }: FarmersPowerModalProps) {
  const { state, refetchUserItems } = useGame();
  const { address } = useAccount();
  const { chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { safeAreaInsets } = useFrameContext();

  // New state for power mechanics
  const [currentPowerStage, setCurrentPowerStage] = useState(8);
  const [currentFP, setCurrentFP] = useState(3250);
  const [powerCombo, setPowerCombo] = useState(6);
  const [lastDonationTime, setLastDonationTime] = useState<Date | null>(null);
  const [nextDecayTime, setNextDecayTime] = useState<Date>(
    new Date(Date.now() + DECAY_INTERVAL * 60 * 1000)
  );

  const [paymentStarted, setPaymentStarted] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [finalTxHash, setFinalTxHash] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [contributionAmount, setContributionAmount] = useState(1);

  // Calculate next stage requirements
  const currentStageInfo = POWER_STAGES[currentPowerStage - 1];
  const nextStageInfo = POWER_STAGES[currentPowerStage];
  const fpProgress = nextStageInfo
    ? ((currentFP - currentStageInfo.fpRequired) /
        (nextStageInfo.fpRequired - currentStageInfo.fpRequired)) *
      100
    : 100;

  // Calculate time until next decay
  const timeUntilDecay = Math.max(0, nextDecayTime.getTime() - Date.now());
  const minutesUntilDecay = Math.floor(timeUntilDecay / (1000 * 60));

  // Effect to handle combo decay
  useEffect(() => {
    if (lastDonationTime) {
      const checkCombo = setInterval(() => {
        const timeSinceLastDonation = Date.now() - lastDonationTime.getTime();
        if (timeSinceLastDonation > COMBO_WINDOW) {
          setPowerCombo(1);
        }
      }, 1000);
      return () => clearInterval(checkCombo);
    }
  }, [lastDonationTime]);

  // Auto-switch to Base chain
  useEffect(() => {
    if (chainId !== base.id) {
      switchChain({ chainId: base.id });
    }
  }, [chainId, switchChain]);

  const { data: balance } = useBalance({
    address,
    chainId: base.id,
  });

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

  const hasEnoughEthBalance = !!balance && BigInt(balance.value) > BigInt(0);
  const hasEnoughUSDBalance =
    !!tokenBalancesData?.totalBalanceUSD &&
    tokenBalancesData.totalBalanceUSD >= 1;

  const handlePaymentStarted = () => {
    setPaymentStarted(true);
  };

  const handlePaymentCompleted = async (e: PaymentCompletedEvent) => {
    setPaymentCompleted(true);
    setPaymentStarted(false);
    setFinalTxHash(e.txHash);

    try {
      const loadingToast = toast.loading(
        "Distributing power boost to all farmers..."
      );

      // Update combo and FP
      const newCombo = Math.min(powerCombo + 1, MAX_COMBO);
      setPowerCombo(newCombo);
      setLastDonationTime(new Date());

      // Add FP with combo multiplier
      const fpToAdd = contributionAmount * newCombo;
      const newFP = currentFP + fpToAdd;
      setCurrentFP(newFP);

      // Check for stage up
      const newStage =
        POWER_STAGES.findIndex((stage) => stage.fpRequired > newFP) + 1;
      if (newStage > currentPowerStage) {
        setCurrentPowerStage(newStage);
        setShowConfetti(true);
      }

      toast.success("Power boost distributed successfully!", {
        id: loadingToast,
      });

      refetchUserItems();
    } catch (error) {
      console.error("Error distributing power boost:", error);
      toast.error("Failed to distribute power boost. Please try again.");
      setErrorMessage("Failed to distribute power boost. Please try again.");
    }
  };

  const handlePaymentBounced = () => {
    setPaymentStarted(false);
    setPaymentCompleted(false);
    setShowConfetti(false);
    setErrorMessage(
      "There was an error processing your payment. You received back your amount in $USDC on your wallet address. Try again."
    );
  };

  const handleSharePower = async () => {
    await sdk.actions.openUrl(
      `https://warpcast.com/~/compose?text=I just boosted all Farville farmers' growth speed by ${currentStageInfo.boost}x! ⚡%0A%0APlay Farville: https://farville.farm`
    );
  };

  // Effect to handle power decay
  useEffect(() => {
    const decayInterval = setInterval(() => {
      setNextDecayTime(new Date(Date.now() + DECAY_INTERVAL * 60 * 1000));
      if (currentPowerStage > 1) {
        setCurrentPowerStage((prev) => prev - 1);
      }
    }, DECAY_INTERVAL * 60 * 1000);

    return () => clearInterval(decayInterval);
  }, [currentPowerStage]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50">
      {showConfetti && <Confetti title="POWER STAGE UP!" />}
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
        {/* Header with Stage Info */}
        <div className="flex items-start justify-between p-3 xs:p-4 mt-2 border-b border-[#8B5c3C]">
          <div className="flex flex-col gap-1">
            <motion.h2
              className="text-white/90 font-bold text-lg xs:text-xl mb-1 flex items-center gap-2"
              animate={{ rotate: [0, -3, 3, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
            >
              <span className="text-2xl">⚡</span>
              Farmers Power
            </motion.h2>
            <div className="flex flex-col gap-0.5">
              <motion.p
                className="text-amber-500 text-sm font-bold drop-shadow-[0_0_3px_rgba(251,191,36,0.7)]"
                animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {currentStageInfo.boost}× Game Speed Boost
              </motion.p>
              <p className="text-white/70 text-xs">
                Affects: Growth Time, Perks & More
              </p>
            </div>
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

        <div className="flex-1 flex flex-col items-center gap-6 max-w-md mx-auto w-full px-4 pb-8 overflow-y-auto no-scrollbar pt-4">
          {/* Current Status Section */}
          <div className="w-full bg-[#5C4121]/50 rounded-xl p-6 border border-yellow-400/20">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">⚡</span>
                  <span className="text-2xl text-yellow-400">
                    {currentFP} FP
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-white/90 text-sm">Next Stage</p>
                  <p className="text-yellow-400 text-xs">
                    {nextStageInfo
                      ? `${nextStageInfo.fpRequired - currentFP} FP needed`
                      : "Max Stage"}
                  </p>
                </div>
              </div>
              <div className="w-full">
                <Progress
                  value={fpProgress}
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-white/70 mt-1">
                  <span>Stage {currentPowerStage}</span>
                  <span>
                    {nextStageInfo ? `Stage ${nextStageInfo.stage}` : "MAX"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Power Combo Section */}
          <div className="bg-[#5C4121]/50 rounded-xl p-4 w-full border border-yellow-400/20">
            <div className="flex justify-between items-center mb-3">
              <span className="text-white/90 text-base font-semibold">
                Power Combo
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">Current</span>
                <span className="text-yellow-400 font-bold text-lg">
                  ×{powerCombo}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="w-full h-1 bg-white/10 rounded overflow-hidden">
                <motion.div
                  className="h-full bg-yellow-400"
                  initial={{ width: "100%" }}
                  animate={{
                    width: lastDonationTime
                      ? `${Math.max(
                          0,
                          ((COMBO_WINDOW -
                            (Date.now() - lastDonationTime.getTime())) /
                            COMBO_WINDOW) *
                            100
                        )}%`
                      : "100%",
                  }}
                />
              </div>
              <p className="text-white/60 text-xs mt-1">
                {lastDonationTime
                  ? `${Math.max(
                      0,
                      Math.ceil(
                        (COMBO_WINDOW -
                          (Date.now() - lastDonationTime.getTime())) /
                          1000
                      )
                    )}s until combo reset`
                  : "Donate to start combo multiplier"}
              </p>
            </div>
          </div>

          {/* Decay Info */}
          <div className="bg-[#5C4121]/50 rounded-xl p-4 w-full border border-red-400/20">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-white/90 text-base font-semibold">
                  Power Decay
                </span>
                <p className="text-red-400/90 text-xs mt-1">
                  -1 point every 10 minutes
                </p>
              </div>
              <div className="text-right">
                <span className="text-red-400 text-lg font-bold">
                  {minutesUntilDecay}m
                </span>
                <p className="text-xs text-white/60">until next decay</p>
              </div>
            </div>
            <div className="w-full h-1 bg-white/10 rounded overflow-hidden mt-2">
              <motion.div
                className="h-full bg-red-400"
                initial={{ width: "100%" }}
                animate={{
                  width: `${
                    (timeUntilDecay / (DECAY_INTERVAL * 60 * 1000)) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Contribution Section */}
          <div className="w-full bg-[#5C4121]/50 rounded-xl p-6 border border-yellow-400/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/90 text-lg font-semibold">
                Contribute Power
              </span>
              <span className="text-white/70 text-sm">
                Balance: ${tokenBalancesData?.totalBalanceUSD.toFixed(2) ?? "0"}
              </span>
            </div>

            <div className="flex gap-4 items-center mb-4 bg-[#4A341A] p-4 rounded-lg border border-yellow-400/10">
              <input
                type="number"
                min="1"
                value={contributionAmount}
                onChange={(e) =>
                  setContributionAmount(
                    Math.max(1, parseInt(e.target.value) || 1)
                  )
                }
                className="bg-[#5C4121] text-white rounded px-3 py-2 w-24 border border-yellow-400/20 text-center text-lg"
              />
              <div className="flex flex-col">
                <span className="text-white/90 text-sm">
                  Current Combo: ×{powerCombo}
                </span>
                <span className="text-yellow-400 text-lg font-bold">
                  = {contributionAmount * powerCombo} FP
                </span>
              </div>
            </div>

            <DaimoPayButton.Custom
              appId={env.NEXT_PUBLIC_DAIMO_PAY_ID}
              metadata={{
                userId: state.user.fid.toString(),
              }}
              preferredChains={[base.id]}
              preferredTokens={[{ chain: base.id, address: BASE_USDC_ADDRESS }]}
              toAddress={BG_MULTISIG_ADDRESS}
              toUnits={contributionAmount.toString()}
              toToken={BASE_USDC_ADDRESS}
              toChain={base.id}
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
                    ? "Contributing..."
                    : paymentCompleted
                    ? "Contributed Successfully!"
                    : "Contribute Power"}
                </Button>
              )}
            </DaimoPayButton.Custom>
          </div>

          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-sm p-3 rounded">
              {errorMessage}
            </div>
          )}

          {paymentCompleted && finalTxHash && (
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleSharePower}
                className="w-full py-3 text-base font-medium text-[#5C4121] bg-yellow-500 hover:bg-yellow-500/80 hover:text-[#5C4121]"
              >
                Share Power Boost 🎁
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

          {/* Info Footer */}
          <div className="text-center text-white/60 text-xs mt-4">
            <p>Farmers Power boosts growth speed for ALL farmers.</p>
            <p>Higher stages provide bigger boosts!</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
