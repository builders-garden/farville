import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PowerStats } from "./power-status";
import { PowerStages } from "./power-stages";
import { PowerContribution } from "./power-contribution";
import Confetti from "@/components/animations/Confetti";
import { useAccount, useBalance, useSwitchChain } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getWalletBalance } from "@/lib/lifi";
import { base } from "viem/chains";
import { useGame } from "@/context/GameContext";
import { toast } from "react-hot-toast";
import { PowerTimer } from "./power-timer";
import { LastContributionTable } from "./last-contribution-table";
import { useCommunityBoosterManagement } from "@/hooks/use-community-booster";

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

export const PowerTab = () => {
  const { state, refetchUserItems, mode } = useGame();
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  // State for power mechanics
  const [currentFP, setCurrentFP] = useState<number>(
    state.communityBoosterStatus?.points || 0
  );
  const [fpChangeAnimation, setFpChangeAnimation] = useState<
    "increase" | "decrease" | null
  >(null);
  const previousFP = useRef(currentFP);
  const [powerCombo, setPowerCombo] = useState<number>(6);
  const [lastDonationTime, setLastDonationTime] = useState<Date | null>(
    new Date(Date.now() - 9.5 * 60 * 1000)
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [showContributeDialog, setShowContributeDialog] = useState(false);

  // Calculate current stage based on FP
  const currentPowerStage =
    POWER_STAGES.findIndex((stage) => stage.fpRequired > currentFP) ||
    POWER_STAGES.length;

  // Calculate next stage requirements
  const currentStageInfo = POWER_STAGES[currentPowerStage - 1];
  const nextStageInfo = POWER_STAGES[currentPowerStage];

  // Effect to detect FP changes and trigger animations
  useEffect(() => {
    if (currentFP !== previousFP.current) {
      setFpChangeAnimation(
        currentFP > previousFP.current ? "increase" : "decrease"
      );
      previousFP.current = currentFP;

      // Reset animation state after animation completes
      const timer = setTimeout(() => {
        setFpChangeAnimation(null);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentFP]);

  // Auto-switch to Base chain
  useEffect(() => {
    if (chainId !== base.id) {
      switchChain({ chainId: base.id });
    }
  }, [chainId, switchChain]);

  // Effect to handle power decay
  useEffect(() => {
    const decayInterval = setInterval(() => {
      if (currentPowerStage > 1) {
        // Calculate FP needed for previous stage
        const previousStageInfo = POWER_STAGES[currentPowerStage - 2];
        setCurrentFP(previousStageInfo.fpRequired);
      }
    }, DECAY_INTERVAL * 60 * 1000);

    return () => clearInterval(decayInterval);
  }, [currentPowerStage]);

  const { data: balance } = useBalance({
    address,
    chainId: base.id,
  });

  const { data: tokenBalancesData, isLoading: tokenBalancesIsLoading } =
    useQuery({
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

  const { mutate: updateFP } = useCommunityBoosterManagement();

  const handleContributionSuccess = (amount: number) => {
    try {
      // Update combo and FP
      const newCombo = Math.min(powerCombo + 1, MAX_COMBO);
      setPowerCombo(newCombo);
      setLastDonationTime(new Date());

      // Add FP with combo multiplier
      const fpToAdd = amount * newCombo;
      const newFP = currentFP + fpToAdd;
      setCurrentFP(newFP);

      const newStage =
        POWER_STAGES.findIndex((stage) => stage.fpRequired > newFP) ||
        POWER_STAGES.length;
      if (newStage > currentPowerStage) {
        setShowConfetti(true);
      }

      updateFP({
        points: fpToAdd,
        operation: "increment",
      });
      refetchUserItems();
    } catch (error) {
      console.error("Error distributing power boost:", error);
      toast.error("Failed to distribute power boost. Please try again.");
    }
  };

  return (
    <>
      {showConfetti && <Confetti title="POWER STAGE UP!" />}
      {/* Current Status Section */}
      <div className="w-full bg-[#5C4121]/50 rounded-xl p-6 border border-yellow-400/20">
        <div className="flex flex-col gap-4">
          <PowerStats
            currentPowerStage={currentPowerStage}
            currentFP={currentFP}
            fpChangeAnimation={fpChangeAnimation}
            nextStageInfo={nextStageInfo}
            currentStageInfo={currentStageInfo}
          />

          {currentFP > 0 && (
            <PowerTimer
              powerCombo={powerCombo}
              lastDonationTime={lastDonationTime}
              COMBO_WINDOW={COMBO_WINDOW}
              setPowerCombo={setPowerCombo}
              setLastDonationTime={setLastDonationTime}
              setCurrentFP={setCurrentFP}
            />
          )}

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

      <PowerContribution
        showDialog={showContributeDialog}
        onClose={() => setShowContributeDialog(false)}
        powerCombo={powerCombo}
        currentStageInfo={currentStageInfo}
        hasEnoughEthBalance={hasEnoughEthBalance}
        hasEnoughUSDBalance={hasEnoughUSDBalance}
        walletBalance={tokenBalancesData?.totalBalanceUSD ?? 0}
        userId={state.user.fid.toString()}
        onContributionSuccess={handleContributionSuccess}
        mode={mode}
        address={address}
        username={state.user.username}
        tokenBalancesIsLoading={tokenBalancesIsLoading}
      />

      <LastContributionTable />

      {/* Info Footer */}
      <div className="text-center text-white/60 text-xs mt-4">
        <p>Farmers Power boosts growth speed for ALL farmers.</p>
        <p>Higher stages provide bigger boosts!</p>
      </div>
    </>
  );
};
