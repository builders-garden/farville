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

// Load GameGrid component dynamically (client-side only)
const GameGrid = dynamic(() => import("./GameGrid"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[var(--grass)] animate-pulse" />
  ),
});

// Separate component for the inventory modal
function InventoryModalContainer({
  safeAreaInsets,
}: {
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
}) {
  const { state, toggleInventory } = useGame();

  return (
    <AnimatePresence>
      {state.showInventory && (
        <InventoryModal
          onClose={toggleInventory}
          safeAreaInsets={safeAreaInsets}
        />
      )}
    </AnimatePresence>
  );
}

// Wrapper component for the marketplace modal
function MarketplaceModalContainer({
  safeAreaInsets,
}: {
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
}) {
  const { state, toggleMarketplace } = useGame();

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

export default function GameWrapper({
  safeAreaInsets,
}: {
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
}) {
  const { state } = useGame();

  return (
    <div
      className="flex flex-col h-[100dvh] overflow-hidden"
      style={{
        marginTop: safeAreaInsets.top,
        marginBottom: safeAreaInsets.bottom,
        marginLeft: safeAreaInsets.left,
        marginRight: safeAreaInsets.right,
      }}
    >
      <Header />
      <div className="flex-1 relative min-h-0">
        <GameGrid />
      </div>
      <Toolbar safeAreaInsets={safeAreaInsets} />
      <FertilizerIndicator />
      <InventoryModalContainer safeAreaInsets={safeAreaInsets} />
      <MarketplaceModalContainer safeAreaInsets={safeAreaInsets} />
      <AnimatePresence>
        {state.showSettings && <SettingsModal />}
        {state.showLeaderboard && (
          <LeaderboardModal safeAreaInsets={safeAreaInsets} />
        )}
      </AnimatePresence>
    </div>
  );
}
