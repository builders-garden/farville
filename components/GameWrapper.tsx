"use client";

import { useAudio } from "@/context/AudioContext";
import { AnimatePresence } from "framer-motion";
import { useNextStep } from "nextstepjs";
import { useEffect } from "react";
import { useFrameContext } from "../context/FrameContext";
import { useGame } from "../context/GameContext";
// import PatchNotesModal from "./PatchNotesModal";
import RequestModal from "./RequestModal";
import { Mode } from "@/lib/types/game";
import VoucherModal from "./VoucherModal";
import { MODE_DEFINITIONS } from "@/lib/modes/constants";
import { useSocket } from "@/hooks/use-socket";
import { toast as sonnerToast, Toaster } from "sonner";
import Image from "next/image";
import { FP_DECREASE_DELAY_MS } from "@/lib/game-constants";
import ClanOverlay from "./ClanOverlay";
import RiseOfFarmsModal from "./modals/RiseOfFarmsModal";

// const WelcomeOverlay = dynamic(() => import("./../components/WelcomeOverlay"), {
//   ssr: false,
// });

// // Load GameGrid component dynamically (client-side only)
// const GameGrid = dynamic(() => import("./GameGrid"), {
//   ssr: false,
//   loading: () => <div className="w-full h-full animate-pulse" />,
// });

// // Separate component for the inventory modal
// function InventoryModalContainer() {
//   const { showInventory, setShowInventory } = useGame();

//   return (
//     <AnimatePresence>
//       {showInventory && (
//         <InventoryModal onClose={() => setShowInventory(false)} />
//       )}
//     </AnimatePresence>
//   );
// }

// function StreaksModalContainer() {
//   const { showStreaks, setShowStreaks } = useGame();

//   return (
//     <AnimatePresence>
//       {showStreaks && <StreaksModal onClose={() => setShowStreaks(false)} />}
//     </AnimatePresence>
//   );
// }

// // Wrapper component for the donations modal
// function FarmersPowerModalContainer() {
//   const { showFarmersPower, setShowFarmersPower } = useGame();

//   return (
//     <AnimatePresence>
//       {showFarmersPower && (
//         <FarmersPowerModal onClose={() => setShowFarmersPower(false)} />
//       )}
//     </AnimatePresence>
//   );
// }

// // Wrapper component for the marketplace modal
// function MarketplaceModalContainer() {
//   const { showMarket, setShowMarket } = useGame();
//   const { safeAreaInsets } = useFrameContext();

//   return (
//     <AnimatePresence>
//       {showMarket && (
//         <MarketplaceModal
//           onClose={() => setShowMarket(false)}
//           safeAreaInsets={safeAreaInsets}
//         />
//       )}
//     </AnimatePresence>
//   );
// }

// function HelpModalContainer() {
//   const { showHelp, setShowHelp } = useGame();

//   return (
//     <AnimatePresence>
//       {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
//     </AnimatePresence>
//   );
// }

// function ClansContainer() {
//   const { showClans, setShowClans } = useGame();

//   return (
//     <AnimatePresence>
//       {showClans && <ClansModal onClose={() => setShowClans(false)} />}
//     </AnimatePresence>
//   );
// }

// function ProfileModalContainer() {
//   const { showProfile, setShowProfile } = useGame();

//   return (
//     <AnimatePresence>
//       {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
//     </AnimatePresence>
//   );
// }

// // New container component for the leaderboard modal
// function LeaderboardModalContainer() {
//   const { showLeaderboard, setShowLeaderboard } = useGame();

//   return (
//     <AnimatePresence>
//       {showLeaderboard && (
//         <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
//       )}
//     </AnimatePresence>
//   );
// }

// function SeedMenuContainer() {
//   const { showSeedsMenu } = useGame();

//   return <AnimatePresence>{showSeedsMenu && <SeedMenu />}</AnimatePresence>;
// }

// // Add new container component
// function QuestsModalContainer() {
//   const {
//     mode,
//     state,
//     showQuests,
//     setShowQuests,
//     refetchClaimableQuests,
//     refetchUser,
//   } = useGame();

//   const {
//     quests: incompleteQuests,
//     isLoading: isLoadingIncompleteQuests,
//     refetch: refetchIncompleteQuests,
//   } = useUserQuests(state?.user?.fid, "incomplete", mode);

//   useEffect(() => {
//     if (showQuests) {
//       refetchClaimableQuests();
//       refetchIncompleteQuests();
//       refetchUser();
//     }
//   }, [
//     showQuests,
//     refetchClaimableQuests,
//     refetchIncompleteQuests,
//     refetchUser,
//   ]);

//   return (
//     <AnimatePresence>
//       {showQuests && (
//         <QuestsModal
//           incompleteQuests={incompleteQuests}
//           completedQuests={state.completedQuests}
//           isLoadingUserQuests={isLoadingIncompleteQuests}
//           refetchUser={refetchUser}
//           refetchClaimableQuests={refetchClaimableQuests}
//           refetchIncompleteQuests={refetchIncompleteQuests}
//           onClose={() => setShowQuests(false)}
//         />
//       )}
//     </AnimatePresence>
//   );
// }

// function TimelineModalContainer() {
//   const { showTimeline, setShowTimeline } = useGame();

//   return (
//     <AnimatePresence>
//       {showTimeline && <TimelineModal onClose={() => setShowTimeline(false)} />}
//     </AnimatePresence>
//   );
// }

function RiseOfFarmsModalContainer() {
  // Game is shut down - always show the Rise of Farms modal
  return <RiseOfFarmsModal />;
}

export default function GameWrapper() {
  const { startBackgroundMusic, playSound } = useAudio();
  const {
    mode,
    state,
    activeOverlay,
    setActiveOverlay,
    updateUserCommunityBoosterStatus,
    makeAllGridCellsHarvestable,
    setShowFarmersPower,
    refetch,
  } = useGame();

  const { isFarcasterManiaOn } = state;

  const { socket } = useSocket();

  const { safeAreaInsets } = useFrameContext();
  // const [showPatchNotes, setShowPatchNotes] = useState(false);
  // const toastShownRef = useRef(false);

  const handleOverlayComplete = () => {
    setActiveOverlay(null);
    startBackgroundMusic();
  };

  const { startNextStep } = useNextStep();

  useEffect(() => {
    if (!activeOverlay && state.showGridCellsTutorial) {
      startNextStep("mainTour");
    }
  }, [startNextStep, state.showGridCellsTutorial, activeOverlay]);

  // useEffect to check if the other players made a donation
  useEffect(() => {
    if (!socket) return;

    socket.on("new-donation", (data) => {
      console.log(`${JSON.stringify(data)} 🎉`);
      console.log("AMOUNT TO ADD", data.ptAmount);

      // Only update the status and show notifications if Farmers Power is active
      if (state.isFarmersPowerOn) {
        updateUserCommunityBoosterStatus({
          pointsToAdd: data.ptAmount,
          stage: data.stage,
          combo: data.combo,
          lastDonation: new Date(data.createdAt),
        });

        // Also refresh community donations to ensure they're up to date
        refetch.communityDonations();

        if (data.fid !== state.user.fid) {
          const pfpSize = 28;
          sonnerToast.custom(
            (t) => (
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  sonnerToast.dismiss(t);
                  setShowFarmersPower(true);
                }}
              >
                {data.pfp && (
                  <Image
                    src={data.pfp}
                    alt={data.username}
                    width={pfpSize}
                    height={pfpSize}
                    className={`rounded-full object-cover w-[${pfpSize}px] h-[${pfpSize}px] border-2 border-[#ffdc68]`}
                  />
                )}
                <span>{data.username}</span>
                <span className="text-[#ffdc68]">+{data.ptAmount} FP</span>
              </div>
            ),
            {
              duration: 10000,
              position: "top-right",
            }
          );
          playSound("newDonation");
        }
      } else {
        console.log("Farmers Power is not active, ignoring donation event");
      }
    });

    socket.on("harvest-all", (data) => {
      console.log(`${JSON.stringify(data)}`);

      if (state.isFarmersPowerOn) {
        updateUserCommunityBoosterStatus({
          pointsToAdd: 0, // We already add the points on "new-donation"
          stage: data.newStage,
          combo: data.combo,
        });
        makeAllGridCellsHarvestable();
        sonnerToast(`x${data.newStage} boost reached!`, {
          description: `It's harvest time!`,
          duration: 10000,
          position: "top-right",
        });
      } else {
        console.log("Farmers Power is not active, ignoring harvest-all event");
      }
    });

    socket.on("new-decrement", (data) => {
      console.log(`${JSON.stringify(data)}`);

      if (state.isFarmersPowerOn) {
        updateUserCommunityBoosterStatus({
          pointsToAdd: 0, // TODO: WE ALREADY SHOW THIS THROGH THE TIMER - TO BE CHECKED
          stage: data.stage,
          combo: data.combo,
        });
      } else {
        console.log(
          "Farmers Power is not active, ignoring new-decrement event"
        );
      }
    });

    return () => {
      socket.off("new-donation");
      socket.off("harvest-all");
      socket.off("new-decrement");
    };
  }, [
    socket,
    updateUserCommunityBoosterStatus,
    makeAllGridCellsHarvestable,
    state.user.fid,
    refetch,
    playSound,
    setShowFarmersPower,
    state.isFarmersPowerOn,
  ]);

  useEffect(() => {
    // Don't show notifications if Farmers Power is not active
    if (!state.communityBoosterStatus?.lastDonation || !state.isFarmersPowerOn)
      return;

    // Create a ref to track if notification has been shown for this cycle
    const notificationShownRef = { current: false };

    const lastDonation = new Date(state.communityBoosterStatus.lastDonation);
    const now = Date.now();
    const timeSinceLastDonation = now - lastDonation.getTime();

    // if last donation was more than 24 hours ago, we don't show the notification
    if (timeSinceLastDonation > 24 * 60 * 60 * 1000) {
      return;
    }

    // Calculate time elapsed since the last donation in the current cycle
    const timeElapsedInCurrentCycle =
      timeSinceLastDonation % FP_DECREASE_DELAY_MS;

    // Calculate time remaining until next FP decrease
    const timeUntilNextDecrease =
      FP_DECREASE_DELAY_MS - timeElapsedInCurrentCycle;

    // Show notification 3 minutes before FP decrease
    const notificationDelay = timeUntilNextDecrease - 3 * 60 * 1000; // 3 minutes = 180000ms

    const showNotification = async () => {
      // Check if notification has already been shown for this cycle or if Farmers Power is no longer active
      if (notificationShownRef.current || !state.isFarmersPowerOn) return;

      notificationShownRef.current = true;

      const combo = state.communityBoosterStatus?.combo;
      const message =
        combo && combo > 1
          ? `🚨 FPs are decreasing soon, keep the ${combo}x combo alive!`
          : "🚨 FPs are decreasing soon!";

      // wait 10 seconds before showing the notification - this is to avoid issue with loading
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // Check again that Farmers Power is still active before showing notification
      if (!state.isFarmersPowerOn) return;

      sonnerToast.custom(
        (t) => (
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              sonnerToast.dismiss(t);
              setShowFarmersPower(true);
            }}
          >
            <span>{message}</span>
          </div>
        ),
        {
          duration: 10000,
          position: "top-right",
          id: `fp-decrease-${lastDonation.getTime()}`, // Unique ID based on last donation timestamp
        }
      );
    };

    // If notification delay is zero or negative, show notification immediately
    if (notificationDelay <= 0 && timeUntilNextDecrease >= 30 * 1000) {
      showNotification();
      return;
    }

    const timeout = setTimeout(showNotification, notificationDelay);

    return () => clearTimeout(timeout);
  }, [
    state.communityBoosterStatus?.lastDonation,
    state.communityBoosterStatus?.combo,
    setShowFarmersPower,
    state.isFarmersPowerOn,
  ]);

  // useEffect(() => {
  //   if (!toastShownRef.current) {
  //     toastShownRef.current = true;
  //     toast(
  //       (t) => (
  //         <span
  //           onClick={() => {
  //             toast.dismiss(t.id);
  //             setShowPatchNotes(true);
  //           }}
  //           className="cursor-pointer"
  //         >
  //           Important announcement, click to learn more
  //         </span>
  //       ),
  //       {
  //         duration: 5000,
  //         icon: "⚠️",
  //         style: {
  //           backgroundColor: "white",
  //           color: "black",
  //         },
  //         position: "top-center",
  //       }
  //     );
  //   }
  // }, []);

  let BACKGROUND_PATTERN: string;
  let BACKGROUND_COLOR: string;
  switch (mode) {
    case Mode.Farcon:
      BACKGROUND_COLOR = MODE_DEFINITIONS[Mode.Farcon].background.color;
      BACKGROUND_PATTERN = MODE_DEFINITIONS[Mode.Farcon].background.pattern;
      break;
    case Mode.Sonic:
      BACKGROUND_COLOR = MODE_DEFINITIONS[Mode.Sonic].background.color;
      BACKGROUND_PATTERN = MODE_DEFINITIONS[Mode.Sonic].background.pattern;
      break;
    default:
      BACKGROUND_COLOR = MODE_DEFINITIONS[Mode.Classic].background.color;
      BACKGROUND_PATTERN = MODE_DEFINITIONS[Mode.Classic].background.pattern;
      break;
  }

  return (
    <div className="relative z-10">
      <Toaster
        // offset={{ bottom: "20rem" }}
        offset={{ bottom: "4.5rem" }}
        toastOptions={{
          style: {
            padding: "0.375rem 0.75rem",
            fontSize: "0.7rem",
            filter: "drop-shadow(0 4px 4px rgb(0 0 0 / 0.15))",
            backgroundColor: isFarcasterManiaOn ? "#8d76d4" : "#148435",
            color: "white",
            marginBottom: "4.5rem",
            width: "fit-content",
            marginLeft: "auto",
            marginRight: "30px",
            fontFamily: '"Press Start 2P"',
            border: "none",
            borderRadius: "1rem",
          },
          classNames: {
            description: "text-white/80",
          },
        }}
      />
      {/* {showPatchNotes && (
        <PatchNotesModal onClose={() => setShowPatchNotes(false)} />
      )} */}

      {activeOverlay?.type === "requests" ? (
        <AnimatePresence>
          <RequestModal
            onClose={handleOverlayComplete}
            id={activeOverlay.id}
          />
        </AnimatePresence>
      ) : activeOverlay?.type === "voucher" ? (
        <AnimatePresence>
          <VoucherModal
            onClose={handleOverlayComplete}
            slug={activeOverlay.slug}
          />
        </AnimatePresence>
      ) : activeOverlay?.type === "clan" ? (
        <AnimatePresence>
          <ClanOverlay
            onClose={handleOverlayComplete}
            clanId={activeOverlay.clanId}
          />
        </AnimatePresence>
      ) : !activeOverlay ? (
        <div
          style={{
            backgroundColor: BACKGROUND_COLOR,
            backgroundImage: BACKGROUND_PATTERN,
            backgroundSize: "160px 160px",
            backgroundPosition: "0 0, 0 80px, 80px -80px, -80px 0px",
            marginTop: safeAreaInsets.top,
            marginBottom: safeAreaInsets.bottom,
            marginLeft: safeAreaInsets.left,
            marginRight: safeAreaInsets.right,
          }}
          className="flex flex-col h-[100dvh] w-full max-w-md mx-auto overflow-hidden"
        >
          {/* <Header />
          <div
            className="flex-1 relative min-h-0"
            id="game-grid"
          >
            <GameGrid />
          </div>
          <Toolbar safeAreaInsets={safeAreaInsets} />
          <PerkIndicator />
          <PlantingIndicator />
          <InventoryModalContainer />
          <StreaksModalContainer />
          <FarmersPowerModalContainer />
          <ClansContainer />
          <MarketplaceModalContainer />
          <HelpModalContainer />
          <ProfileModalContainer />
          <LeaderboardModalContainer />
          <SeedMenuContainer />
          <QuestsModalContainer />
          <TimelineModalContainer /> */}
          <RiseOfFarmsModalContainer />
        </div>
      ) : null}
    </div>
  );
}
