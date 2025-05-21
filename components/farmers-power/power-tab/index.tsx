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
import { useCommunityBoosterIncrement } from "@/hooks/use-community-booster";
import {
  COMBO_WINDOW,
  DECAY_INTERVAL,
  MAX_COMBO,
  POWER_STAGES,
} from "@/lib/game-constants";
import { v4 as uuid } from "uuid";
import { useCommunityDonation } from "@/hooks/use-community-donation";

export const PowerTab = () => {
  const { state, refetchUserItems, mode } = useGame();
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  // State for power mechanics
  const [currentFP, setCurrentFP] = useState<number>(
    state.communityBoosterStatus?.points || 0
  );

  // Effect to update currentFP when communityBoosterStatus changes
  useEffect(() => {
    if (state.communityBoosterStatus?.points !== undefined) {
      setCurrentFP(state.communityBoosterStatus.points);
    }
  }, [state.communityBoosterStatus?.points]);

  const [fpChangeAnimation, setFpChangeAnimation] = useState<
    "increase" | "decrease" | null
  >(null);
  const previousFP = useRef(currentFP);
  const [powerCombo, setPowerCombo] = useState<number>(
    state.communityBoosterStatus?.combo || 0
  );

  const { data: lastContributions } = useCommunityDonation(mode, true);

  const [lastDonationTime, setLastDonationTime] = useState<Date | null>(
    lastContributions?.[0]?.createdAt
      ? new Date(lastContributions[0].createdAt)
      : null
  );

  useEffect(() => {
    if (lastContributions && lastContributions.length > 0) {
      const lastDonation = lastContributions[0];
      setLastDonationTime(new Date(lastDonation.createdAt));
    }
  }, [lastContributions]);

  const [lastTimerReset, setLastTimerReset] = useState<Date>(() => {
    if (!lastDonationTime) return new Date(); // Default to now if no donations yet

    const timeSinceLastDonation = Date.now() - lastDonationTime.getTime();

    if (timeSinceLastDonation < COMBO_WINDOW) {
      // If the last donation was within the combo window, use that as the reset time
      return lastDonationTime;
    } else {
      // Calculate proper reset time using modulo logic
      const elapsedCycles = Math.floor(timeSinceLastDonation / COMBO_WINDOW);
      // This returns the start time of the current cycle we're in
      return new Date(
        lastDonationTime.getTime() + elapsedCycles * COMBO_WINDOW
      );
    }
  });

  useEffect(() => {
    if (!lastDonationTime) return;

    const timeSinceLastDonation = Date.now() - lastDonationTime.getTime();

    if (timeSinceLastDonation < COMBO_WINDOW) {
      // If the last donation was within the combo window, reset timer to that point
      setLastTimerReset(lastDonationTime);
    } else {
      // Calculate proper reset time using modulo logic
      // This keeps track of where we are within the current cycle
      const elapsedCycles = Math.floor(timeSinceLastDonation / COMBO_WINDOW);
      const currentWindowStart = new Date(
        lastDonationTime.getTime() + elapsedCycles * COMBO_WINDOW
      );
      setLastTimerReset(currentWindowStart);
    }
  }, [lastDonationTime]);

  // Removed debug console logs

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

  const { mutate: updateFP } = useCommunityBoosterIncrement();

  const handleContributionSuccess = (dollarAmount: number) => {
    try {
      if (!address) {
        throw new Error("No address found");
      }
      // Update combo and FP
      const newCombo = Math.min(powerCombo + 1, MAX_COMBO);
      setPowerCombo(newCombo);
      setLastDonationTime(new Date());

      // Add FP with combo multiplier
      const fpToAdd = dollarAmount * newCombo;
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
        txHash: uuid(),
        walletAddress: address,
        dollarAmount: dollarAmount,
        message: undefined,
        username: state.user.username,
        mode: mode,
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
              setCurrentFP={setCurrentFP}
              lastTimerReset={lastTimerReset}
              setLastTimerReset={setLastTimerReset}
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
        address={address}
        tokenBalancesIsLoading={tokenBalancesIsLoading}
      />

      <LastContributionTable lastContributions={lastContributions} />

      {/* Info Footer */}
      <div className="text-center text-white/60 text-xs mt-4">
        <p>Farmers Power boosts growth speed for ALL farmers.</p>
        <p>Higher stages provide bigger boosts!</p>
      </div>
    </>
  );
};
