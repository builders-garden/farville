import { useGame } from "@/context/GameContext";
import { motion } from "framer-motion";
import { useAccount, useBalance, useSwitchChain } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getWalletBalance } from "@/lib/lifi";
import { Button } from "@/components/ui/button";
import Confetti from "@/components/animations/Confetti";
import { X } from "lucide-react";
import { base } from "viem/chains";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useFrameContext } from "@/context/FrameContext";
import { useDonationLeaderboard } from "@/hooks/use-donation-leadeboard";
import ProfileModal from "../ProfileModal";
import { LeaderboardUserAvatar } from "../leaderboard/LeaderboardUserAvatar";
import { FloatingShareButton } from "../FloatingShareButton";
import { PowerStats } from "./PowerStats";
import { ComboTimer } from "./ComboTimer";
import { PowerStages } from "./PowerStages";
import { PowerContribution } from "./PowerContribution";

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
  const { state, refetchUserItems, mode } = useGame();
  const { address } = useAccount();
  const { chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { safeAreaInsets } = useFrameContext();

  // New state for power mechanics
  const [currentFP, setCurrentFP] = useState<number>(3250);
  const [fpChangeAnimation, setFpChangeAnimation] = useState<
    "increase" | "decrease" | null
  >(null);
  const previousFP = useRef(currentFP);
  const [powerCombo, setPowerCombo] = useState<number>(6);
  const [lastDonationTime, setLastDonationTime] = useState<Date | null>(
    new Date(Date.now() - 9.5 * 60 * 1000)
  );

  const [timerNow, setTimerNow] = useState(Date.now());

  // Effect for rapid timer updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerNow(Date.now());

      // Check if timer reached 0 (10 minutes elapsed)
      if (lastDonationTime) {
        const timeElapsed = Date.now() - lastDonationTime.getTime();
        if (timeElapsed >= COMBO_WINDOW) {
          // Reset combo and last donation time
          setPowerCombo(1);
          setLastDonationTime(new Date());

          // Decrease FP by 1
          setCurrentFP((prevFP) => Math.max(0, prevFP - 1));
        }
      }
    }, 16); // ~60fps update rate

    return () => clearInterval(interval);
  }, [lastDonationTime]);

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

  // UI state
  const [showConfetti, setShowConfetti] = useState(false);
  const [showContributeDialog, setShowContributeDialog] = useState(false);

  // User Donations Leaderboard
  const { data: leaderboardData } = useDonationLeaderboard(
    mode,
    state.user.fid,
    true
  );

  // Calculate current stage based on FP
  const currentPowerStage =
    POWER_STAGES.findIndex((stage) => stage.fpRequired > currentFP) ||
    POWER_STAGES.length;

  // Calculate next stage requirements
  const currentStageInfo = POWER_STAGES[currentPowerStage - 1];
  const nextStageInfo = POWER_STAGES[currentPowerStage];

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

  const handleShareLeaderboard = async () => {
    // const { castUrl } = leaderboardFlexCardComposeCastUrl(
    //   state.user.fid,
    //   mode,
    // );
    // await sdk.actions.openUrl(castUrl);
  };

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

  const [activeTab, setActiveTab] = useState<"power" | "leaderboard">("power");
  const [selectedUserFid, setSelectedUserFid] = useState<number | undefined>(
    undefined
  );

  const handleCloseProfile = () => {
    setSelectedUserFid(undefined);
  };

  const handleShare = () => {
    if (activeTab === "leaderboard") {
      handleShareLeaderboard();
    } else {
      console.warn("No share action defined for this tab");
    }
  };

  console.log("leaderboardData", leaderboardData);

  const handleContributionSuccess = (amount: number) => {
    try {
      const loadingToast = toast.loading(
        "Distributing power boost to all farmers..."
      );

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

      toast.success("Power boost distributed successfully!", {
        id: loadingToast,
      });

      refetchUserItems();
    } catch (error) {
      console.error("Error distributing power boost:", error);
      toast.error("Failed to distribute power boost. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50">
      {selectedUserFid ? (
        <ProfileModal
          onClose={handleCloseProfile}
          userFid={selectedUserFid}
        />
      ) : (
        <>
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
            <div className="flex flex-col items-start justify-between p-3 xs:p-4 mt-2 border-b border-[#8B5c3C] gap-1">
              <div className="flex w-full items-center justify-between">
                <motion.h2
                  className="text-white/90 font-bold text-base xs:text-lg mb-1 flex items-center gap-2"
                  animate={{ rotate: [0, -3, 3, 0] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 5,
                  }}
                >
                  <span className="text-xl">⚡</span>
                  Farmers Power
                </motion.h2>

                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full 
                      bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex flex-col gap-0.5">
                {/* <p className="text-amber-500 text-xs font-bold drop-shadow-[0_0_2px_rgba(251,191,36,0.7)]">
              {currentStageInfo.boost}× Game Speed Boost
            </p> */}
                <p className="text-white/70 text-xs">
                  Let&apos;s play Farville faster!
                </p>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center gap-6 max-w-md mx-auto w-full px-4 pb-8 overflow-y-auto no-scrollbar pt-4">
              {/* Tabs */}
              <div className="grid grid-cols-2 gap-1 xs:gap-2">
                {[
                  { id: "power", icon: "⚡️", label: "Farmers Power" },
                  { id: "leaderboard", icon: "🏆", label: "Leaderboard" },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() =>
                      setActiveTab(tab.id as "power" | "leaderboard")
                    }
                    className={`px-2 xs:px-3 py-1 xs:py-1 rounded-lg flex items-center justify-center gap-1 xs:gap-1.5 transition-all duration-200
              ${
                activeTab === tab.id
                  ? "bg-[#6d4c2c] text-white scale-105 shadow-lg"
                  : "text-white/70 hover:bg-[#6d4c2c]/50"
              }`}
                    whileHover={{ scale: activeTab === tab.id ? 1.05 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.span
                      animate={{
                        rotate: activeTab === tab.id ? [0, -5, 5, 0] : 0,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                      className="mb-1"
                    >
                      {tab.icon}
                    </motion.span>
                    <span className="text-[10px] xs:text-xs font-medium">
                      {tab.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              {activeTab === "power" && (
                <>
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

                      <ComboTimer
                        powerCombo={powerCombo}
                        lastDonationTime={lastDonationTime}
                        timerNow={timerNow}
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
                  />
                </>
              )}

              {activeTab === "leaderboard" && (
                <>
                  {leaderboardData?.targetData && (
                    <motion.div
                      key={state.user.fid}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.02 }}
                      className="w-full bg-gradient-to-r from-[#8B5E3C] to-[#6d4c2c] px-3 xs:px-4 py-2 xs:py-3 rounded-lg flex items-center gap-2 xs:gap-3
                                   border-2 border-[#FFB938] shadow-lg relative overflow-hidden
                                   hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
                      onClick={() => setSelectedUserFid(state.user.fid)}
                    >
                      <div className="flex-none text-center px-1.5 xs:px-2 py-0.5 xs:py-1 bg-[#5c4121] rounded-lg text-white/90 text-[10px] xs:text-xs font-medium">
                        #{leaderboardData?.targetData.position}
                      </div>
                      {state.user.selectedAvatarUrl || state.user.avatarUrl ? (
                        <LeaderboardUserAvatar
                          pfpUrl={
                            state.user.selectedAvatarUrl ||
                            state.user.avatarUrl ||
                            ""
                          }
                          username={state.user.username}
                          isOgUser={state.user.mintedOG}
                        />
                      ) : (
                        <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-full bg-[#5c4121] flex items-center justify-center text-white/90 flex-none">
                          👤
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5 xs:gap-1 w-full">
                        <p className="text-white/90 font-medium truncate text-xs xs:text-sm">
                          {state.user.username}
                        </p>
                        <div className="flex flex-row items-center justify-between w-full">
                          <div className="text-[#FFB938] rounded-full font-medium text-[10px] xs:text-xs">
                            FP:
                            {leaderboardData?.targetData.totalPtAmount.toLocaleString()}
                          </div>
                          <div className="text-white/60 text-[10px] xs:text-xs">
                            Donations:
                            {leaderboardData?.targetData.donationCount}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div className="space-y-1.5 xs:space-y-2 w-full">
                    {leaderboardData?.leaderboard.map((entry, index) => (
                      <motion.div
                        key={entry.fid}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedUserFid(entry.fid)}
                        className={`px-3 xs:px-4 py-2 xs:py-3 rounded-lg flex items-center gap-2 xs:gap-3 shadow-md cursor-pointer
                                    ${
                                      entry.fid === state.user.fid
                                        ? "bg-gradient-to-r from-[#8B5E3C] to-[#6d4c2c] border-2 border-[#FFB938]"
                                        : "bg-[#6d4c2c] border border-[#8B5E3C]/50"
                                    }`}
                      >
                        <div className="flex-none text-center px-1.5 xs:px-2 py-0.5 xs:py-1 bg-[#5c4121] rounded-lg text-white/90 text-[10px] xs:text-xs font-medium">
                          #{index + 1}
                        </div>
                        {entry.selectedAvatarUrl || entry.avatarUrl ? (
                          <LeaderboardUserAvatar
                            pfpUrl={
                              entry.selectedAvatarUrl || entry.avatarUrl || ""
                            }
                            username={entry.username}
                          />
                        ) : (
                          <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-full bg-[#5c4121] flex items-center justify-center text-white/90 flex-none">
                            👤
                          </div>
                        )}
                        <div className="flex-1 flex items-center justify-between gap-2 xs:gap-4">
                          <div className="flex flex-col gap-0.5 xs:gap-1 w-full">
                            <p className="text-white/90 font-medium truncate text-xs xs:text-sm">
                              {entry.username}
                            </p>
                            <div className="flex flex-row justify-between w-full">
                              <div className="text-[#FFB938] rounded-full font-medium text-[10px] xs:text-xs">
                                FP:{entry.totalPtAmount.toLocaleString()}
                              </div>
                              <div className="text-white/60 text-[10px] xs:text-xs">
                                Donations:{entry.donationCount}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {activeTab === "leaderboard" && (
                <FloatingShareButton onClick={handleShare} />
              )}

              {/* Info Footer */}
              <div className="text-center text-white/60 text-xs mt-4">
                <p>Farmers Power boosts growth speed for ALL farmers.</p>
                <p>Higher stages provide bigger boosts!</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
