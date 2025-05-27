"use client";

import { useAudio } from "@/context/AudioContext";
import { useUserQuests } from "@/hooks/use-quests";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useNextStep } from "nextstepjs";
import { useEffect } from "react";
import { useFrameContext } from "../context/FrameContext";
import { useGame } from "../context/GameContext";
import Header from "./Header";
import InventoryModal from "./InventoryModal";
// import PatchNotesModal from "./PatchNotesModal";
import PerkIndicator from "./PerkIndicator";
import PlantingIndicator from "./PlantingIndicator";
import ProfileModal from "./ProfileModal";
import QuestsModal from "./QuestsModal";
import RequestModal from "./RequestModal";
import SeedMenu from "./SeedMenu";
import HelpModal from "./help";
import StreaksModal from "./StreaksModal";
import TimelineModal from "./TimelineModal";
import Toolbar from "./Toolbar";
import { Mode } from "@/lib/types/game";
import VoucherModal from "./VoucherModal";
import MarketplaceModal from "./marketplace";
import LeaderboardModal from "./leaderboard";
import { MODE_DEFINITIONS } from "@/lib/modes/constants";
import FarmersPowerModal from "./farmers-power";
import { useSocket } from "@/hooks/use-socket";
// import toast from "react-hot-toast";
import { toast as sonnerToast, Toaster } from "sonner";
import Image from "next/image";

// const WelcomeOverlay = dynamic(() => import("./../components/WelcomeOverlay"), {
//   ssr: false,
// });

// Load GameGrid component dynamically (client-side only)
const GameGrid = dynamic(() => import("./GameGrid"), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse" />,
});

// Separate component for the inventory modal
function InventoryModalContainer() {
  const { showInventory, setShowInventory } = useGame();

  return (
    <AnimatePresence>
      {showInventory && (
        <InventoryModal onClose={() => setShowInventory(false)} />
      )}
    </AnimatePresence>
  );
}

function StreaksModalContainer() {
  const { showStreaks, setShowStreaks } = useGame();

  return (
    <AnimatePresence>
      {showStreaks && <StreaksModal onClose={() => setShowStreaks(false)} />}
    </AnimatePresence>
  );
}

// Wrapper component for the donations modal
function FarmersPowerModalContainer() {
  const { showFarmersPower, setShowFarmersPower } = useGame();

  return (
    <AnimatePresence>
      {showFarmersPower && (
        <FarmersPowerModal onClose={() => setShowFarmersPower(false)} />
      )}
    </AnimatePresence>
  );
}

// Wrapper component for the marketplace modal
function MarketplaceModalContainer() {
  const { showMarket, setShowMarket } = useGame();
  const { safeAreaInsets } = useFrameContext();

  return (
    <AnimatePresence>
      {showMarket && (
        <MarketplaceModal
          onClose={() => setShowMarket(false)}
          safeAreaInsets={safeAreaInsets}
        />
      )}
    </AnimatePresence>
  );
}

function HelpModalContainer() {
  const { showHelp, setShowHelp } = useGame();

  return (
    <AnimatePresence>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </AnimatePresence>
  );
}

function ProfileModalContainer() {
  const { showProfile, setShowProfile } = useGame();

  return (
    <AnimatePresence>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </AnimatePresence>
  );
}

// New container component for the leaderboard modal
function LeaderboardModalContainer() {
  const { showLeaderboard, setShowLeaderboard } = useGame();

  return (
    <AnimatePresence>
      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}
    </AnimatePresence>
  );
}

function SeedMenuContainer() {
  const { showSeedsMenu } = useGame();

  return <AnimatePresence>{showSeedsMenu && <SeedMenu />}</AnimatePresence>;
}

// Add new container component
function QuestsModalContainer() {
  const {
    mode,
    state,
    showQuests,
    setShowQuests,
    refetchClaimableQuests,
    refetchUser,
  } = useGame();

  const {
    quests: incompleteQuests,
    isLoading: isLoadingIncompleteQuests,
    refetch: refetchIncompleteQuests,
  } = useUserQuests(state?.user?.fid, "incomplete", mode);

  useEffect(() => {
    if (showQuests) {
      refetchClaimableQuests();
      refetchIncompleteQuests();
      refetchUser();
    }
  }, [
    showQuests,
    refetchClaimableQuests,
    refetchIncompleteQuests,
    refetchUser,
  ]);

  return (
    <AnimatePresence>
      {showQuests && (
        <QuestsModal
          incompleteQuests={incompleteQuests}
          completedQuests={state.completedQuests}
          isLoadingUserQuests={isLoadingIncompleteQuests}
          refetchUser={refetchUser}
          refetchClaimableQuests={refetchClaimableQuests}
          refetchIncompleteQuests={refetchIncompleteQuests}
          onClose={() => setShowQuests(false)}
        />
      )}
    </AnimatePresence>
  );
}

function TimelineModalContainer() {
  const { showTimeline, setShowTimeline } = useGame();

  return (
    <AnimatePresence>
      {showTimeline && <TimelineModal onClose={() => setShowTimeline(false)} />}
    </AnimatePresence>
  );
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
    });

    socket.on("harvest-all", (data) => {
      console.log(`${JSON.stringify(data)}`);
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
    });

    socket.on("new-decrement", (data) => {
      console.log(`${JSON.stringify(data)}`);
      updateUserCommunityBoosterStatus({
        pointsToAdd: 0, // TODO: WE ALREADY SHOW THIS THROGH THE TIMER - TO BE CHECKED
        stage: data.stage,
        combo: data.combo,
      });
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
          <Header />
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
          <MarketplaceModalContainer />
          <HelpModalContainer />
          <ProfileModalContainer />
          <LeaderboardModalContainer />
          <SeedMenuContainer />
          <QuestsModalContainer />
          <TimelineModalContainer />
        </div>
      ) : null}
    </div>
  );
}
