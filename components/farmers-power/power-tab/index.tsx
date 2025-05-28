import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PowerStats } from "./power-status";
import { PowerStages } from "./power-stages";
import { PowerContribution } from "./power-contribution";
import { useAccount, useBalance, useSwitchChain } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getWalletBalance } from "@/lib/lifi";
import { base } from "viem/chains";
import { useGame } from "@/context/GameContext";
import { toast } from "react-hot-toast";
import { PowerTimer } from "./power-timer";
import { ContributionTableSection } from "./contribution-table-section";
import { useCommunityBoosterIncrement } from "@/hooks/use-community-booster";
import {
  COMBO_WINDOW,
  DECAY_INTERVAL,
  POWER_STAGES,
} from "@/lib/game-constants";
import { useCommunityDonation } from "@/hooks/use-community-donation";

export const PowerTab = () => {
  const { state, mode } = useGame();
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [donationId, setDonationId] = useState<string | null>(null);

  const { isFarcasterManiaOn } = state;

  // State for power mechanics
  const [currentFP, setCurrentFP] = useState<number>(
    state.communityBoosterStatus?.points || 0
  );

  const { data: userContributions } = useCommunityDonation(
    mode,
    true,
    state.user.fid
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

  // Use communityDonations from GameState instead of direct API call
  const lastContributions = state.communityDonations;

  const [lastDonationTime, setLastDonationTime] = useState<Date | null>(
    state.communityBoosterStatus?.lastDonation || null
  );

  useEffect(() => {
    if (lastContributions && lastContributions.length > 0) {
      const lastDonation = lastContributions[0];
      setLastDonationTime(new Date(lastDonation.createdAt));
    } else if (state.communityBoosterStatus?.lastDonation) {
      // Use lastDonation from communityBoosterStatus as fallback
      setLastDonationTime(state.communityBoosterStatus.lastDonation);
    }
  }, [lastContributions, state.communityBoosterStatus?.lastDonation]);

  useEffect(() => {
    // Update powerCombo from state when it changes
    if (state.communityBoosterStatus?.combo !== undefined) {
      setPowerCombo(state.communityBoosterStatus.combo);
    }
  }, [state.communityBoosterStatus?.combo]);

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

  const userPfp = state.user.selectedAvatarUrl || state.user.avatarUrl || "";

  const { mutateAsync: updateFP } = useCommunityBoosterIncrement();

  const handleContributionSuccess = async (paymentId: string) => {
    try {
      if (!address) {
        throw new Error("No address found");
      }

      const result = await updateFP({
        paymentId,
        message: undefined,
        username: state.user.username,
        mode: mode,
        pfp: userPfp,
      });
      setDonationId(result.data.donationId);
    } catch (error) {
      console.error("Error distributing power boost:", error);
      toast.error("Failed to distribute power boost. Please try again.");
    }
  };

  return (
    <>
      {/* if isFarcasterManiaOn, let's add a label saying "Farcaster Mania"
"for the next 12 hours, every donation counts twice"*/}
      <div className="flex flex-col gap-3 w-full">
        {isFarcasterManiaOn && (
          <div className="flex flex-col gap-1 w-full bg-[#593A62] rounded-lg p-2 px-4">
            <div className="text-center text-white font-semibold text-[10px]">
              It&apos;s Farcaster Mania!
            </div>
            <div className="text-center text-[#d7caff] text-[9px]">
              Every donation counts twice for the next 24 hours!
            </div>
          </div>
        )}
        {/* Current Status Section */}
        <div className="w-full bg-[#5C4121]/50 rounded-xl p-4 border border-yellow-400/20">
          <div className="flex flex-col gap-4">
            <PowerStats
              currentFP={currentFP}
              fpChangeAnimation={fpChangeAnimation}
              nextStageInfo={nextStageInfo}
              currentStageInfo={currentStageInfo}
              isFarcasterManiaOn={isFarcasterManiaOn}
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
                isFarcasterManiaOn={isFarcasterManiaOn}
              />
            )}

            <PowerStages
              currentPowerStage={currentPowerStage}
              stages={POWER_STAGES}
              isFarcasterManiaOn={isFarcasterManiaOn}
            />
          </div>
        </div>
      </div>

      <Button
        variant="default"
        className={`w-full py-3 text-base font-medium ${
          isFarcasterManiaOn
            ? "text-white bg-[#a590e3] hover:bg-[#a590e3]/80 hover:text-white/80"
            : "text-[#5C4121] bg-yellow-500 hover:bg-yellow-500/80 hover:text-[#5C4121]"
        }`}
        onClick={() => setShowContributeDialog(true)}
      >
        Contribute Power {true ? "⚡" : "🌟"}
      </Button>

      <PowerContribution
        showDialog={showContributeDialog}
        onClose={() => setShowContributeDialog(false)}
        powerCombo={powerCombo}
        hasEnoughEthBalance={hasEnoughEthBalance}
        hasEnoughUSDBalance={hasEnoughUSDBalance}
        walletBalance={tokenBalancesData?.totalBalanceUSD ?? 0}
        userId={state.user.fid.toString()}
        onContributionSuccess={handleContributionSuccess}
        address={address}
        tokenBalancesIsLoading={tokenBalancesIsLoading}
        returnedDonationId={donationId}
        isFarcasterManiaOn={isFarcasterManiaOn}
      />

      <ContributionTableSection
        lastContributions={lastContributions}
        yourContributions={userContributions}
        isFarcasterManiaOn={isFarcasterManiaOn}
      />

      {/* Info Footer */}
      <div className="text-center text-white/60 text-xs mt-4">
        <p>Farmers Power boosts growth speed for ALL farmers.</p>
        <p>Higher stages provide bigger boosts!</p>
      </div>
    </>
  );
};
