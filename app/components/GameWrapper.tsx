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
import FertilizerIndicator from "./FertilizerIndicator";
import { useFrameContext } from "../context/FrameContext";

// Load GameGrid component dynamically (client-side only)
const GameGrid = dynamic(() => import("./GameGrid"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[var(--grass)] animate-pulse" />
  ),
});

// Separate component for the inventory modal
function InventoryModalContainer() {
  const { state, toggleInventory } = useGame();

  return (
    <AnimatePresence>
      {state.showInventory && <InventoryModal onClose={toggleInventory} />}
    </AnimatePresence>
  );
}

// Wrapper component for the marketplace modal
function MarketplaceModalContainer() {
  const { state, toggleMarketplace } = useGame();
  const { safeAreaInsets } = useFrameContext();

  return (
    <AnimatePresence>
      {state.showMarketplace && (
        <MarketplaceModal
          onClose={toggleMarketplace}
          safeAreaInsets={safeAreaInsets}
        />
      )}
    </AnimatePresence>
  );
}

// Add this constant at the top of the file after imports
const BACKGROUND_PATTERN = `
  linear-gradient(45deg, #386A48 25%, transparent 25%),
  linear-gradient(-45deg, #386A48 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, #386A48 75%),
  linear-gradient(-45deg, transparent 75%, #386A48 75%)
`;

export default function GameWrapper() {
  const { state } = useGame();
  const { safeAreaInsets } = useFrameContext();
  return (
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
      <FertilizerIndicator />
      <InventoryModalContainer />
      <MarketplaceModalContainer />
      <AnimatePresence>
        {state.showSettings && <SettingsModal />}
        {state.showLeaderboard && <LeaderboardModal />}
      </AnimatePresence>
    </div>
  );
}
