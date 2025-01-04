"use client";

import { createContext, useContext, useState } from "react";
import type {
  CropType,
  ExpansionCost,
  HarvestResponse,
  SeedType,
} from "../types/game";
//import { useAudio } from "./AudioContext";
import { GameState, useGameState } from "@/hooks/use-game-state";
import { usePlantSeed } from "@/hooks/game-actions/use-plant-seed";
import { useHarvestCrop } from "@/hooks/game-actions/use-harvest-crop";
import { useFertilize } from "@/hooks/game-actions/use-fertilize";
import { useBuyItem } from "@/hooks/game-actions/use-buy-item";
import { useExpandGrid } from "@/hooks/game-actions/use-expand-grid";
import { useSellItem } from "@/hooks/game-actions/use-sell-item";
import { UserItem } from "@/hooks/use-user-items";
import { useSignIn } from "@/hooks/use-sign-in";

export const CROPS: {
  name: string;
  type: CropType;
  icon: string;
  seedIcon: string;
  sellPrice: number;
  buyPrice: number;
  levelRequirement: number;
  xp: number;
  imageUrl: string;
}[] = [
  {
    name: "Carrot",
    type: "carrot",
    sellPrice: 8,
    buyPrice: 5,
    icon: "/images/crop/carrot.png",
    seedIcon: "/images/seed/seed_carrot.png",
    levelRequirement: 1,
    xp: 2,
    imageUrl: "/images/crops/carrot.png",
  },
  {
    name: "Pumpkin",
    type: "pumpkin",
    sellPrice: 25,
    buyPrice: 15,
    icon: "/images/crop/pumpkin.png",
    seedIcon: "/images/seed/seed_pumpkin.png",
    levelRequirement: 3,
    xp: 6,
    imageUrl: "/images/crops/pumpkin.png",
  },
  {
    name: "Tomato",
    type: "tomato",
    sellPrice: 50,
    buyPrice: 30,
    icon: "/images/crop/tomato.png",
    seedIcon: "/images/seed/seed_tomato.png",
    levelRequirement: 5,
    xp: 12,
    imageUrl: "/images/crops/tomato.png",
  },
  {
    name: "Potato",
    type: "potato",
    sellPrice: 100,
    buyPrice: 60,
    icon: "/images/crop/potato.png",
    seedIcon: "/images/seed/seed_potato.png",
    levelRequirement: 8,
    xp: 25,
    imageUrl: "/images/crops/potato.png",
  },
];

export const GROWTH_TIMES = {
  carrot: 1800000,
  pumpkin: 3600000,
  tomato: 7200000,
  potato: 21600000,
};

// Add EXPANSION_COSTS to the context file
export const EXPANSION_COSTS: ExpansionCost[] = [
  { coins: 40, level: 1, nextSize: { width: 3, height: 3 } },
  { coins: 500, level: 3, nextSize: { width: 4, height: 4 } },
  { coins: 1000, level: 5, nextSize: { width: 5, height: 5 } },
  { coins: 2500, level: 10, nextSize: { width: 6, height: 6 } },
];

// Update context type to match actual implementation
interface GameContextType {
  state: GameState;
  selectedSeed: SeedType | null;
  setSelectedSeed: (seed: SeedType | null) => void;
  selectedFertilizer: UserItem | null;
  setSelectedFertilizer: (perk: UserItem | null) => void;
  plantSeed: (params: { x: number; y: number; seedType: SeedType }) => void;
  harvestCrop: (params: {
    x: number;
    y: number;
  }) => Promise<HarvestResponse | undefined>;
  fertilize: (params: { x: number; y: number }) => void;
  buyItem: (params: { itemId: number; quantity: number }) => void;
  sellItem: (params: { itemId: number; quantity: number }) => void;
  expandGrid: () => void;
  refetchState: () => Promise<void>;
  showInventory: boolean;
  showMarket: boolean;
  showLeaderboard: boolean;
  showSettings: boolean;
  setShowInventory: (show: boolean) => void;
  setShowMarket: (show: boolean) => void;
  setShowLeaderboard: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
}

export const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoading } = useSignIn();
  const [showInventory, setShowInventory] = useState(false);
  const [showMarket, setShowMarket] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // const { playSound } = useAudio();
  const { state, refetch } = useGameState();
  const [selectedSeed, setSelectedSeed] = useState<SeedType | null>(null);
  const [selectedFertilizer, setSelectedFertilizer] = useState<UserItem | null>(
    null
  );

  const { mutate: plantSeed } = usePlantSeed({ refetchGridCells: refetch.grid });
  const { mutate: harvestCropMutation } = useHarvestCrop();
  const { mutate: fertilize } = useFertilize();
  const { mutate: buyItem } = useBuyItem();
  const { mutate: sellItem } = useSellItem();
  const { mutate: expandGrid } = useExpandGrid();

  const harvestCrop = (params: { x: number; y: number }) => {
    return new Promise<HarvestResponse | undefined>((resolve) => {
      harvestCropMutation(params, {
        onSuccess: (data) => resolve(data),
        onError: () => resolve(undefined),
      });
    });
  };

  if (!isSignedIn && !isLoading) {
    return <div>You must sign in to play FarVille!</div>;
  }

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <GameContext.Provider
      value={{
        state,
        selectedSeed,
        setSelectedSeed,
        selectedFertilizer,
        setSelectedFertilizer,
        plantSeed,
        harvestCrop,
        fertilize,
        buyItem,
        sellItem,
        expandGrid,
        refetchState: refetch.all,
        showInventory,
        showMarket,
        showLeaderboard,
        showSettings,
        setShowInventory,
        setShowMarket,
        setShowLeaderboard,
        setShowSettings,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};
