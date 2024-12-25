"use client";

import dynamic from "next/dynamic";
import { GameProvider, useGame } from "./context/GameContext";
import Header from "./components/Header";
import Toolbar from "./components/Toolbar";
import { AnimatePresence } from "framer-motion";
import InventoryModal from "./components/InventoryModal";
import MarketplaceModal from "./components/MarketplaceModal";
import { AudioProvider } from "./context/AudioContext";
import SettingsModal from "./components/SettingsModal";
import LeaderboardModal from "./components/LeaderboardModal";

// These components are loaded only on the client side
const GameGrid = dynamic(() => import("./components/GameGrid"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[var(--grass)] animate-pulse" />
  ),
});

// Create a wrapper component that uses the context
function GameWrapper() {
  const { state } = useGame();

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 relative">
        <GameGrid />
      </div>
      <Toolbar />
      <InventoryModalContainer />
      <MarketplaceModalContainer />
      <AnimatePresence>
        {state.showSettings && <SettingsModal />}
        {state.showLeaderboard && <LeaderboardModal />}
      </AnimatePresence>
    </div>
  );
}

// Separate component for the modal to use context
function InventoryModalContainer() {
  const { state, toggleInventory } = useGame();

  return (
    <AnimatePresence>
      {state.showInventory && <InventoryModal onClose={toggleInventory} />}
    </AnimatePresence>
  );
}

// Create a wrapper component for the marketplace modal
function MarketplaceModalContainer() {
  const { state, toggleMarketplace } = useGame();

  return (
    <AnimatePresence>
      {state.showMarketplace && (
        <MarketplaceModal onClose={toggleMarketplace} />
      )}
    </AnimatePresence>
  );
}

// Main component that provides the context
export default function Home() {
  return (
    <main className="min-h-screen bg-green-800">
      <AudioProvider>
        <GameProvider>
          <GameWrapper />
        </GameProvider>
      </AudioProvider>
    </main>
  );
}
