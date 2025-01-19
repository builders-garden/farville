"use client";

import dynamic from "next/dynamic";
import { useGame } from "../context/GameContext";
import Header from "./Header";
import Toolbar from "./Toolbar";
import { AnimatePresence } from "framer-motion";
import InventoryModal from "./InventoryModal";
import MarketplaceModal from "./MarketplaceModal";
import SettingsModal from "./SettingsModal";
import LeaderboardModal from "./LeaderboardModal";
import PerkIndicator from "./PerkIndicator";
import { useFrameContext } from "../context/FrameContext";
import SeedMenu from "./SeedMenu";
import PlantingIndicator from "./PlantingIndicator";
import QuestsModal from "./QuestsModal";
import { useAudio } from "@/context/AudioContext";
import RequestModal from "./RequestModal";

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

// New container component for the settings modal
function SettingsModalContainer() {
  const { showSettings, setShowSettings } = useGame();

  return (
    <AnimatePresence>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
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

// Add this constant at the top of the file after imports
const BACKGROUND_PATTERN = `
  linear-gradient(45deg, #386A48 25%, transparent 25%),
  linear-gradient(-45deg, #386A48 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, #386A48 75%),
  linear-gradient(-45deg, transparent 75%, #386A48 75%)
`;

// Add new container component
function QuestsModalContainer() {
  const { showQuests, setShowQuests } = useGame();

  return (
    <AnimatePresence>
      {showQuests && <QuestsModal onClose={() => setShowQuests(false)} />}
    </AnimatePresence>
  );
}

export default function GameWrapper() {
  const { startBackgroundMusic } = useAudio();
  const { activeOverlay, setActiveOverlay } = useGame();
  const { safeAreaInsets } = useFrameContext();

  const handleOverlayComplete = () => {
    setActiveOverlay(null);
    startBackgroundMusic();
  };

  return (
    <div className="relative z-10">
      {/* Render active overlay with parameters */}
      {/* {activeOverlay?.type === "welcome" && (
        <AnimatePresence>
          <WelcomeOverlay onComplete={handleOverlayComplete} />
        </AnimatePresence>
      )} */}

      {activeOverlay?.type === "requests" && (
        <AnimatePresence>
          <RequestModal onClose={handleOverlayComplete} id={activeOverlay.id} />
        </AnimatePresence>
      )}

      {/* Main game content */}
      {!activeOverlay && (
        <div
          style={{
            backgroundColor: "#255F37",
            backgroundImage: BACKGROUND_PATTERN,
            backgroundSize: "160px 160px",
            backgroundPosition: "0 0, 0 80px, 80px -80px, -80px 0px",
            marginTop: safeAreaInsets.top,
            marginBottom: safeAreaInsets.bottom,
            marginLeft: safeAreaInsets.left,
            marginRight: safeAreaInsets.right,
          }}
          className="flex flex-col h-[100dvh] w-full overflow-hidden"
        >
          <Header />
          <div className="flex-1 relative min-h-0">
            <GameGrid />
          </div>
          <Toolbar safeAreaInsets={safeAreaInsets} />
          <PerkIndicator />
          <PlantingIndicator />
          <InventoryModalContainer />
          <MarketplaceModalContainer />
          <SettingsModalContainer />
          <LeaderboardModalContainer />
          <SeedMenuContainer />
          <QuestsModalContainer />
        </div>
      )}
    </div>
  );
}
