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
import { toast } from "sonner";
import { PowerTimer } from "./power-timer";
import { MilestoneCard } from "./milestone-card";
import { ContributionTableSection } from "./contribution-table-section";
import { useCommunityBoosterIncrement } from "@/hooks/use-community-booster";
import {
  FP_DECREASE_DELAY_MS,
  DECAY_INTERVAL,
  POWER_STAGES,
  FP_TIME,
} from "@/lib/game-constants";
import { useCommunityDonation } from "@/hooks/use-community-donation";
import { TopDonors } from "./top-donors";
import { Countdown } from "@/components/Countdown";
import {
  formatEndTimeDisplay,
  getDayName,
  getNextFarmersPowerStartDate,
} from "./utils";

interface PowerTabProps {
  setActiveTab: (tab: "power" | "leaderboard") => void;
  topDonors?: {
    fid: number;
    username: string;
    selectedAvatarUrl?: string;
    avatarUrl?: string;
    mintedOG?: boolean;
  }[];
  isLoadingDonors: boolean;
  onSelectUser: (fid: number) => void;
}

export const PowerTab = ({
  setActiveTab,
  topDonors = [],
  onSelectUser,
  isLoadingDonors,
}: PowerTabProps) => {
  const { state, mode } = useGame();
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [donationId, setDonationId] = useState<string | null>(null);

  const { isFarcasterManiaOn, isFarmersPowerOn } = state;

  // State for power mechanics - use 0 for points if Farmers Power is not active
  const [currentFP, setCurrentFP] = useState<number>(
    isFarmersPowerOn ? state.communityBoosterStatus?.points || 0 : 0
  );

  const { data: userContributions } = useCommunityDonation(
    mode,
    true,
    state.user.fid
  );

  // Effect to update currentFP when communityBoosterStatus changes or farmers power state changes
  useEffect(() => {
    if (!isFarmersPowerOn) {
      // Reset to 0 when Farmers Power is inactive
      setCurrentFP(0);
    } else if (state.communityBoosterStatus?.points !== undefined) {
      setCurrentFP(state.communityBoosterStatus.points);
    }
  }, [state.communityBoosterStatus?.points, isFarmersPowerOn]);

  const [fpChangeAnimation, setFpChangeAnimation] = useState<
    "increase" | "decrease" | null
  >(null);
  const previousFP = useRef(currentFP);
  const [powerCombo, setPowerCombo] = useState<number>(
    isFarmersPowerOn ? state.communityBoosterStatus?.combo || 1 : 1
  );

  // Use communityDonations from GameState instead of direct API call
  const lastContributions = state.communityDonations;

  const [lastDonationTime, setLastDonationTime] = useState<Date | null>(
    isFarmersPowerOn ? state.communityBoosterStatus?.lastDonation || null : null
  );

  useEffect(() => {
    if (!isFarmersPowerOn) {
      // Clear last donation time when Farmers Power is inactive
      setLastDonationTime(null);
    } else if (lastContributions && lastContributions.length > 0) {
      const lastDonation = lastContributions[0];
      setLastDonationTime(new Date(lastDonation.createdAt));
    } else if (state.communityBoosterStatus?.lastDonation) {
      // Use lastDonation from communityBoosterStatus as fallback
      setLastDonationTime(state.communityBoosterStatus.lastDonation);
    }
  }, [
    lastContributions,
    state.communityBoosterStatus?.lastDonation,
    isFarmersPowerOn,
  ]);

  useEffect(() => {
    // Update powerCombo from state when it changes
    if (state.communityBoosterStatus?.combo !== undefined) {
      setPowerCombo(state.communityBoosterStatus.combo);
    }
  }, [state.communityBoosterStatus?.combo]);

  const [lastTimerReset, setLastTimerReset] = useState<Date>(() => {
    if (!lastDonationTime) return new Date(); // Default to now if no donations yet
    const timeSinceLastDonation = Date.now() - lastDonationTime.getTime();

    if (timeSinceLastDonation < FP_DECREASE_DELAY_MS) {
      // If the last donation was within the combo window, use that as the reset time
      return lastDonationTime;
    } else {
      // Calculate proper reset time using modulo logic
      const elapsedCycles = Math.floor(
        timeSinceLastDonation / FP_DECREASE_DELAY_MS
      );
      // This returns the start time of the current cycle we're in
      return new Date(
        lastDonationTime.getTime() + elapsedCycles * FP_DECREASE_DELAY_MS
      );
    }
  });

  useEffect(() => {
    if (!lastDonationTime) return;

    const timeSinceLastDonation = Date.now() - lastDonationTime.getTime();

    if (timeSinceLastDonation < FP_DECREASE_DELAY_MS) {
      // If the last donation was within the combo window, reset timer to that point
      setLastTimerReset(lastDonationTime);
    } else {
      // Calculate proper reset time using modulo logic
      // This keeps track of where we are within the current cycle
      const elapsedCycles = Math.floor(
        timeSinceLastDonation / FP_DECREASE_DELAY_MS
      );
      const currentWindowStart = new Date(
        lastDonationTime.getTime() + elapsedCycles * FP_DECREASE_DELAY_MS
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

  // Helper function to check if FP is at a checkpoint (no decrease will happen)
  const isAtCheckpoint = (currentFP: number) => {
    // If FP is 0, it's at the base checkpoint
    if (currentFP === 0) return true;

    // Check if FP matches any stage's fpRequired (checkpoint)
    return POWER_STAGES.some((stage) => stage.fpRequired === currentFP);
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

        <TopDonors
          setActiveTab={setActiveTab}
          topDonors={topDonors}
          isLoadingDonors={isLoadingDonors}
          onSelectUser={onSelectUser}
          viewerData={{ fid: state.user.fid }}
        />

        {/* Current Status Section */}
        <div className="w-full bg-[#5C4121]/50 rounded-xl p-4 border border-yellow-400/20">
          <div className="flex flex-col gap-4">
            {!isFarmersPowerOn ? (
              <div className="text-center mb-2">
                <h3 className="text-yellow-500 font-medium mb-2">
                  Farmers Power is currently inactive
                </h3>
                <p className="text-white/70 text-xs mb-4">
                  Come back between{" "}
                  {new Date(
                    0,
                    0,
                    0,
                    FP_TIME.START_HOUR,
                    FP_TIME.START_MINUTE
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  on {getDayName(FP_TIME.START_DAY)} and{" "}
                  {new Date(
                    0,
                    0,
                    0,
                    FP_TIME.END_HOUR,
                    FP_TIME.END_MINUTE
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  on {getDayName(FP_TIME.END_DAY)} UTC.
                </p>

                {/* Countdown to next Farmers Power start */}
                <div className="mt-2">
                  <Countdown
                    date={getNextFarmersPowerStartDate()}
                    text="Starts in:"
                    border={true}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Active until label */}
                <div className="bg-[#4A341A] rounded-lg p-2 mb-3 flex items-center justify-center">
                  <span className="text-yellow-400/90 text-[9px] font-medium">
                    Active until {formatEndTimeDisplay()}
                  </span>
                </div>

                <PowerStats
                  currentFP={currentFP}
                  fpChangeAnimation={fpChangeAnimation}
                  nextStageInfo={nextStageInfo}
                  currentStageInfo={currentStageInfo}
                  isFarcasterManiaOn={isFarcasterManiaOn}
                />

                {currentFP > 0 && !isAtCheckpoint(currentFP) && (
                  <PowerTimer
                    powerCombo={powerCombo}
                    lastDonationTime={lastDonationTime}
                    COMBO_WINDOW={FP_DECREASE_DELAY_MS}
                    setPowerCombo={setPowerCombo}
                    setCurrentFP={setCurrentFP}
                    lastTimerReset={lastTimerReset}
                    setLastTimerReset={setLastTimerReset}
                    isFarcasterManiaOn={isFarcasterManiaOn}
                  />
                )}

                {currentFP > 0 && isAtCheckpoint(currentFP) && (
                  <MilestoneCard
                    currentFP={currentFP}
                    isFarcasterManiaOn={isFarcasterManiaOn}
                  />
                )}
              </>
            )}

            <Button
              variant="default"
              className={`w-full py-3 text-sm font-medium ${
                isFarcasterManiaOn
                  ? "text-white bg-[#a590e3] hover:bg-[#a590e3]/80 hover:text-white/80"
                  : "text-[#5C4121] bg-yellow-500 hover:bg-yellow-500/80 hover:text-[#5C4121]"
              } ${!isFarmersPowerOn ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => isFarmersPowerOn && setShowContributeDialog(true)}
              disabled={!isFarmersPowerOn}
            >
              Contribute Power {true ? "⚡" : "🌟"}
            </Button>

            <PowerStages
              currentPowerStage={currentPowerStage}
              stages={POWER_STAGES}
              isFarcasterManiaOn={isFarcasterManiaOn}
            />
          </div>
        </div>
      </div>

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
