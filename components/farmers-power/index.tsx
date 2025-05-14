import { useGame } from "@/context/GameContext";
import { motion } from "framer-motion";
import { useAccount, useBalance, useSwitchChain } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getWalletBalance } from "@/lib/lifi";
import Confetti from "@/components/animations/Confetti";
import { X } from "lucide-react";
import { base } from "viem/chains";
import { useEffect, useState, useRef } from "react";
import { PowerStatus } from "./PowerStatus";
import { ComboTimer } from "./ComboTimer";
import { PowerStages } from "./PowerStages";
import { DecayInfo } from "./DecayInfo";
import { ContributeDialog } from "./ContributeDialog";
import { Button } from "../ui/button";
import { DaimoPayCompletedEvent } from "@daimo/pay";

interface FarmersPowerModalProps {
  onClose: () => void;
}

const POWER_STAGES = [
  { stage: 1, fpRequired: 0, boost: 1 },
  { stage: 2, fpRequired: 50, boost: 2 },
  { stage: 3, fpRequired: 150, boost: 3 },
  { stage: 4, fpRequired: 300, boost: 4 },
  { stage: 5, fpRequired: 500, boost: 5 },
  { stage: 6, fpRequired: 800, boost: 6 },
  { stage: 7, fpRequired: 1200, boost: 7 },
  { stage: 8, fpRequired: 1700, boost: 8 },
  { stage: 9, fpRequired: 2300, boost: 9 },
  { stage: 10, fpRequired: 3050, boost: 10 },
  { stage: 11, fpRequired: 3950, boost: 11 },
  { stage: 12, fpRequired: 5050, boost: 12 },
  { stage: 13, fpRequired: 6350, boost: 13 },
  { stage: 14, fpRequired: 7850, boost: 14 },
  { stage: 15, fpRequired: 9550, boost: 15 },
  { stage: 16, fpRequired: 11550, boost: 16 },
  { stage: 17, fpRequired: 13850, boost: 17 },
  { stage: 18, fpRequired: 16450, boost: 18 },
  { stage: 19, fpRequired: 19350, boost: 19 },
  { stage: 20, fpRequired: 22550, boost: 20 },
  { stage: 21, fpRequired: 26050, boost: 21 },
  { stage: 22, fpRequired: 29850, boost: 22 },
  { stage: 23, fpRequired: 33950, boost: 23 },
  { stage: 24, fpRequired: 38350, boost: 24 },
];

const MAX_COMBO = 10;
const COMBO_WINDOW = 10 * 60 * 1000; // 10 minutes in milliseconds
const DECAY_INTERVAL = 600; // 600 minutes (10 hours) for power stage decay

export default function FarmersPowerModal({ onClose }: FarmersPowerModalProps) {
  const { state, refetchUserItems } = useGame();
  const { address } = useAccount();
  const { chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  // State management
  const [currentFP, setCurrentFP] = useState<number>(3250);
  const [fpChangeAnimation, setFpChangeAnimation] = useState<
    "increase" | "decrease" | null
  >(null);
  const previousFP = useRef(currentFP);
  const [powerCombo, setPowerCombo] = useState<number>(6);
  const [lastDonationTime, setLastDonationTime] = useState<Date>(
    new Date(Date.now() - 9.5 * 60 * 1000)
  );
  const [nextDecayTime, setNextDecayTime] = useState<Date>(
    new Date(Date.now() + DECAY_INTERVAL * 60 * 1000)
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [contributionAmount, setContributionAmount] = useState(1);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [finalTxHash, setFinalTxHash] = useState<string>("");
  const [showContributeDialog, setShowContributeDialog] = useState(false);
  const [nextUpdate, setNextUpdate] = useState(Date.now());

  // Calculate current stage and next stage info
  const currentPowerStage =
    POWER_STAGES.findIndex((stage) => stage.fpRequired > currentFP) ||
    POWER_STAGES.length;
  const currentStageInfo = POWER_STAGES[currentPowerStage - 1];
  const nextStageInfo = POWER_STAGES[currentPowerStage];

  // Calculate decay timings using the nextUpdate state
  const timeUntilDecay = Math.max(0, nextDecayTime.getTime() - nextUpdate);
  const minutesUntilDecay = Math.floor(timeUntilDecay / (1000 * 60));

  // Effect to detect FP changes and trigger animations
  useEffect(() => {
    if (currentFP !== previousFP.current) {
      setFpChangeAnimation(
        currentFP > previousFP.current ? "increase" : "decrease"
      );
      previousFP.current = currentFP;

      const timer = setTimeout(() => {
        setFpChangeAnimation(null);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentFP]);

  // Effect for rapid timer updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNextUpdate(Date.now());
    }, 16); // ~60fps update rate

    return () => clearInterval(interval);
  }, []);

  // Effect for power decay
  useEffect(() => {
    const interval = setInterval(() => {
      setNextDecayTime(new Date(Date.now() + DECAY_INTERVAL * 60 * 1000));
      if (currentPowerStage > 1) {
        const previousStageInfo = POWER_STAGES[currentPowerStage - 2];
        setCurrentFP(previousStageInfo.fpRequired);
      }
    }, DECAY_INTERVAL * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentPowerStage]);

  // Effect to handle combo decay
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const timeElapsed = Date.now() - lastDonationTime.getTime();
      if (timeElapsed >= COMBO_WINDOW) {
        setPowerCombo(1);
        setLastDonationTime(new Date());
        setCurrentFP((prevFP) => Math.max(0, prevFP - 1));
      }
    }, 16); // Check frequently to ensure precise timing

    return () => clearInterval(checkInterval);
  }, [lastDonationTime]);

  // Chain management
  useEffect(() => {
    if (chainId !== base.id) {
      switchChain({ chainId: base.id });
    }
  }, [chainId, switchChain]);

  // Fetch balances
  const { data: balance } = useBalance({
    address,
    chainId: base.id,
  });

  const { data: tokenBalancesData } = useQuery({
    queryKey: ["tokenBalances", address],
    queryFn: async () => {
      if (address) {
        return await getWalletBalance(address);
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

  // Payment handlers
  const handlePaymentStarted = () => {
    setPaymentStarted(true);
  };

  const handlePaymentCompleted = async (e: DaimoPayCompletedEvent) => {
    setPaymentCompleted(true);
    setPaymentStarted(false);
    setFinalTxHash(e.txHash);

    try {
      const newCombo = Math.min(powerCombo + 1, MAX_COMBO);
      setPowerCombo(newCombo);
      setLastDonationTime(new Date());

      const fpToAdd = contributionAmount * newCombo;
      const newFP = currentFP + fpToAdd;
      setCurrentFP(newFP);

      const newStage =
        POWER_STAGES.findIndex((stage) => stage.fpRequired > newFP) ||
        POWER_STAGES.length;
      if (newStage > currentPowerStage) {
        setShowConfetti(true);
      }

      refetchUserItems();
    } catch (error) {
      console.error("Error distributing power boost:", error);
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50">
      {showConfetti && <Confetti title="POWER STAGE UP!" />}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-[#7e4e31] w-full h-full flex flex-col overflow-y-auto"
      >
        {/* Header */}
        <div className="flex flex-col items-start justify-between p-3 xs:p-4 mt-2 border-b border-[#8B5c3C] gap-1">
          <div className="flex w-full items-center justify-between">
            <motion.h2
              className="text-white/90 font-bold text-base xs:text-lg mb-1 flex items-center gap-2"
              animate={{ rotate: [0, -3, 3, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
            >
              <span className="text-xl">⚡</span>
              Farmers Power
            </motion.h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full 
                  bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-white/70 text-xs">
              Let&apos;s play Farville faster!
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center gap-6 max-w-md mx-auto w-full px-4 pb-8 overflow-y-auto no-scrollbar pt-4">
          {/* Status Section */}
          <div className="w-full bg-[#5C4121]/50 rounded-xl p-6 border border-yellow-400/20">
            <div className="flex flex-col gap-4">
              <PowerStatus
                currentFP={currentFP}
                currentStageInfo={currentStageInfo}
                nextStageInfo={nextStageInfo}
                fpChangeAnimation={fpChangeAnimation}
              />

              <ComboTimer
                lastDonationTime={lastDonationTime}
                powerCombo={powerCombo}
                COMBO_WINDOW={COMBO_WINDOW}
              />

              <PowerStages
                currentPowerStage={currentPowerStage}
                stages={POWER_STAGES}
              />
            </div>
          </div>

          <Button
            variant="default"
            className="w-full py-3 text-base font-medium text-[#5C4121] bg-yellow-500 hover:bg-yellow-500/80 hover:text-[#5C4121]"
            onClick={() => setShowContributeDialog(true)}
          >
            Contribute Power 🌟
          </Button>

          <ContributeDialog
            isOpen={showContributeDialog}
            onClose={() => setShowContributeDialog(false)}
            contributionAmount={contributionAmount}
            setContributionAmount={setContributionAmount}
            powerCombo={powerCombo}
            hasEnoughEthBalance={hasEnoughEthBalance}
            hasEnoughUSDBalance={hasEnoughUSDBalance}
            totalBalanceUSD={tokenBalancesData?.totalBalanceUSD || 0}
            onPaymentCompleted={handlePaymentCompleted}
            onPaymentStarted={handlePaymentStarted}
            onPaymentBounced={handlePaymentBounced}
            errorMessage={errorMessage}
            paymentStarted={paymentStarted}
            paymentCompleted={paymentCompleted}
            finalTxHash={finalTxHash}
            state={state}
          />

          <DecayInfo
            minutesUntilDecay={minutesUntilDecay}
            timeUntilDecay={timeUntilDecay}
            DECAY_INTERVAL={DECAY_INTERVAL}
          />

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
