"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  Dispatch,
} from "react";
import type {
  GameState,
  CropType,
  ExpansionCost,
  GridCell,
} from "../types/game";
import type { Perk } from "../types/perks";
import { useAudio } from "./AudioContext";
import { FrameContext } from "@farcaster/frame-sdk";
import { useFrameContext } from "./FrameContext";
import { trackEvent } from "../lib/posthog";

// Add EXPANSION_COSTS to the context file
export const EXPANSION_COSTS: ExpansionCost[] = [
  { coins: 40, level: 1, nextSize: { width: 3, height: 3 } },
  { coins: 500, level: 2, nextSize: { width: 4, height: 4 } },
  { coins: 1000, level: 4, nextSize: { width: 5, height: 5 } },
  { coins: 2500, level: 7, nextSize: { width: 6, height: 6 } },
];

// Define action types
type GameAction =
  | { type: "TILL_SOIL"; x: number; y: number }
  | { type: "PLANT_CROP"; x: number; y: number; cropType: CropType }
  | {
      type: "HARVEST_CROP";
      x: number;
      y: number;
      rewards: { exp: number; amount: number };
    }
  | { type: "UPDATE_GROWTH" }
  | { type: "ACTIVATE_PERK"; perk: Perk; x?: number; y?: number }
  | { type: "PURCHASE_PERK"; perk: Perk }
  | { type: "BUY_SEEDS"; cropType: CropType; amount: number }
  | { type: "SELL_CROPS"; cropType: CropType; amount: number }
  | { type: "EXPAND_LAND" }
  | { type: "TOGGLE_INVENTORY" }
  | { type: "TOGGLE_MARKETPLACE" }
  | { type: "TOGGLE_SETTINGS" }
  | { type: "TOGGLE_LEADERBOARD" }
  | { type: "SELECT_FERTILIZER"; perk: Perk };

// Define context type
interface GameContextType {
  state: GameState;
  selectedCrop: CropType | null;
  setSelectedCrop: (crop: CropType | null) => void;
  selectedFertilizer: Perk | null;
  setSelectedFertilizer: (perk: Perk | null) => void;
  tillSoil: (x: number, y: number) => void;
  plantCrop: (x: number, y: number, cropType: CropType) => void;
  harvestCrop: (
    x: number,
    y: number,
    rewards: { exp: number; amount: number }
  ) => void;
  activatePerk: (perk: Perk) => void;
  purchasePerk: (perk: Perk) => void;
  getActivePerks: () => Perk[];
  dispatch: Dispatch<GameAction>;
  toggleInventory: () => void;
  toggleMarketplace: () => void;
  toggleSettings: () => void;
  toggleLeaderboard: () => void;
}

type GrowthTimes = {
  [K in CropType]: number;
};

// Game reducer function
function gameReducer(
  state: GameState,
  action: GameAction,
  playSound?: (sound: string) => void,
  context?: FrameContext
): GameState {
  switch (action.type) {
    case "TILL_SOIL": {
      const newGrid = [...state.grid];
      const cell = newGrid[action.y][action.x];

      if (cell.tilled) return state;

      newGrid[action.y][action.x] = {
        ...cell,
        tilled: true,
      };

      trackEvent("till_soil", {
        x: action.x,
        y: action.y,
        gridSize: state.gridSize,
        fid: context?.user?.fid,
        xp: state.experience,
        level: state.level,
      });

      return {
        ...state,
        grid: newGrid,
      };
    }

    case "PLANT_CROP": {
      playSound?.("plant");
      const newGrid = structuredClone(state.grid);
      const cell = newGrid[action.y][action.x];

      if (!cell.tilled || cell.crop || state.seeds[action.cropType] <= 0) {
        return state;
      }

      newGrid[action.y][action.x] = {
        ...cell,
        crop: {
          type: action.cropType,
          plantedAt: Date.now(),
          growthStage: 0,
          readyToHarvest: false,
        },
      };

      const newSeeds = {
        ...state.seeds,
        [action.cropType]: state.seeds[action.cropType] - 1,
      };

      trackEvent("plant_crop", {
        cropType: action.cropType,
        x: action.x,
        y: action.y,
        gridSize: state.gridSize,
        fid: context?.user?.fid,
        xp: state.experience,
        level: state.level,
      });

      return {
        ...state,
        seeds: newSeeds,
        grid: newGrid,
      };
    }

    case "HARVEST_CROP": {
      playSound?.("harvest");
      const newGrid = structuredClone(state.grid);
      const cell = newGrid[action.y][action.x];

      if (!cell.crop?.readyToHarvest) return state;

      const harvestedType = cell.crop.type;
      const reward = action.rewards;

      newGrid[action.y][action.x] = {
        ...cell,
        crop: undefined,
        tilled: true,
      };

      const newExperience = state.experience + reward.exp;
      const newLevel = Math.floor(newExperience / 100) + 1;

      if (newLevel > state.level) {
        playSound?.("levelUp");
      }

      const yieldMultiplier = calculateYieldMultiplier(state, harvestedType);
      const harvestedAmount = Math.floor(reward.amount * yieldMultiplier);

      const newCrops = {
        ...state.crops,
        [harvestedType]: Math.min(
          state.crops[harvestedType] + harvestedAmount,
          state.inventoryCapacity
        ),
      };

      trackEvent("harvest_crop", {
        cropType: harvestedType,
        x: action.x,
        y: action.y,
        gridSize: state.gridSize,
        amount: harvestedAmount,
        rewardXp: reward.exp,
        fid: context?.user?.fid,
        xp: state.experience,
        level: state.level,
      });

      return {
        ...state,
        grid: newGrid,
        experience: newExperience,
        level: newLevel,
        crops: newCrops,
      };
    }

    case "UPDATE_GROWTH": {
      const newGrid = state.grid.map((row) =>
        row.map((cell) => {
          if (!cell.crop || cell.crop.readyToHarvest) return cell;

          const growthTimes: GrowthTimes = {
            wheat: 1800000, // 30 min = 30 * 60 * 1000
            corn: 3600000, // 1 hour = 60 * 60 * 1000
            tomato: 7200000, // 2 hours = 2 * 60 * 60 * 1000
            potato: 21600000, // 6 hours = 6 * 60 * 60 * 1000
          };
          const baseGrowthTime = growthTimes[cell.crop.type];

          const growthMultiplier = calculateGrowthMultiplier(
            state,
            cell.crop.type
          );
          const adjustedGrowthTime = baseGrowthTime / growthMultiplier;

          const elapsed = Date.now() - cell.crop.plantedAt;
          const growthStage = Math.min(
            Math.floor((elapsed / adjustedGrowthTime) * 4),
            4
          );

          return {
            ...cell,
            crop: {
              ...cell.crop,
              growthStage,
              readyToHarvest: elapsed >= adjustedGrowthTime,
            },
          };
        })
      );

      return {
        ...state,
        grid: newGrid,
      };
    }

    case "ACTIVATE_PERK": {
      if (!state.perks.owned.find((p: Perk) => p.id === action.perk.id)) {
        return state;
      }

      // Handle instant growth fertilizer
      if (
        action.perk.type === "INSTANT_GROWTH" &&
        action.x !== undefined &&
        action.y !== undefined
      ) {
        const newGrid = structuredClone(state.grid);
        const cell = newGrid[action.y][action.x];

        if (!cell.crop || cell.crop.readyToHarvest) return state;

        // Instantly grow the crop
        cell.crop.growthStage = 4;
        cell.crop.readyToHarvest = true;

        // Remove one fertilizer from owned perks
        const newOwnedPerks = state.perks.owned
          .map((perk) =>
            perk.id === action.perk.id && perk.quantity
              ? { ...perk, quantity: perk.quantity - 1 }
              : perk
          )
          .filter((perk) => perk.quantity !== 0); // Remove if quantity reaches 0

        return {
          ...state,
          grid: newGrid,
          perks: {
            ...state.perks,
            owned: newOwnedPerks,
          },
        };
      }

      // Original perk activation logic for non-fertilizer perks
      const now = Date.now();
      const activePerks = state.perks.active.filter((perk) => {
        if (!perk.duration || !perk.activatedAt) return true;
        return (
          now - perk.activatedAt < perk.duration &&
          perk.type !== action.perk.type
        );
      });

      trackEvent("activate_perk", {
        perk: action.perk,
        fid: context?.user?.fid,
        xp: state.experience,
        level: state.level,
      });

      return {
        ...state,
        perks: {
          ...state.perks,
          active: [...activePerks, { ...action.perk, activatedAt: now }],
        },
      };
    }

    case "BUY_SEEDS": {
      const seedPrices = {
        wheat: 5,
        corn: 8,
        tomato: 12,
        potato: 15,
      };

      const levelRequirements = {
        wheat: 1,
        corn: 3,
        tomato: 5,
        potato: 8,
      };

      // Check level requirement
      if (state.level < levelRequirements[action.cropType]) {
        return state;
      }

      const totalCost = seedPrices[action.cropType] * action.amount;

      if (state.coins < totalCost) {
        return state;
      }

      playSound?.("coins");
      trackEvent("buy_seeds", {
        cropType: action.cropType,
        amount: action.amount,
        fid: context?.user?.fid,
        xp: state.experience,
        level: state.level,
        cost: totalCost,
        coins: state.coins,
      });
      return {
        ...state,
        coins: state.coins - totalCost,
        seeds: {
          ...state.seeds,
          [action.cropType]: state.seeds[action.cropType] + action.amount,
        },
      };
    }

    case "SELL_CROPS": {
      playSound?.("coins");
      const cropPrices = {
        wheat: 8,
        corn: 25,
        tomato: 50,
        potato: 100,
      };

      if (state.crops[action.cropType] < action.amount) {
        return state;
      }

      const totalEarnings = cropPrices[action.cropType] * action.amount;

      trackEvent("sell_crops", {
        cropType: action.cropType,
        amount: action.amount,
        fid: context?.user?.fid,
        xp: state.experience,
        level: state.level,
        earnings: totalEarnings,
        coins: state.coins,
      });

      return {
        ...state,
        coins: state.coins + totalEarnings,
        crops: {
          ...state.crops,
          [action.cropType]: state.crops[action.cropType] - action.amount,
        },
      };
    }

    case "EXPAND_LAND": {
      const expansion = EXPANSION_COSTS[state.expansionLevel];
      if (!expansion || state.coins < expansion.coins) return state;

      const newGrid = Array(expansion.nextSize.height)
        .fill(null)
        .map((_, y) =>
          Array(expansion.nextSize.width)
            .fill(null)
            .map((_, x) => {
              // Keep existing cells if they exist
              if (y < state.gridSize.height && x < state.gridSize.width) {
                return state.grid[y][x];
              }
              // Create new tilled cells
              return {
                id: `${x}-${y}`,
                x,
                y,
                tilled: true, // New cells are also tilled
                crop: undefined,
              };
            })
        );

      trackEvent("expand_land", {
        fid: context?.user?.fid,
        previousSize: state.gridSize,
        newSize: expansion.nextSize,
        xp: state.experience,
        level: state.level,
        cost: expansion.coins,
        coins: state.coins,
      });

      return {
        ...state,
        coins: state.coins - expansion.coins,
        grid: newGrid,
        gridSize: expansion.nextSize,
        expansionLevel: state.expansionLevel + 1,
      };
    }

    case "TOGGLE_INVENTORY": {
      trackEvent("toggle_inventory", {
        fid: context?.user?.fid,
        xp: state.experience,
        level: state.level,
      });
      return {
        ...state,
        showInventory: !state.showInventory,
      };
    }

    case "TOGGLE_MARKETPLACE": {
      trackEvent("toggle_marketplace", {
        fid: context?.user?.fid,
        xp: state.experience,
        level: state.level,
      });
      return {
        ...state,
        showMarketplace: !state.showMarketplace,
      };
    }

    case "TOGGLE_SETTINGS": {
      trackEvent("toggle_settings", {
        fid: context?.user?.fid,
        xp: state.experience,
        level: state.level,
      });
      return {
        ...state,
        showSettings: !state.showSettings,
      };
    }

    case "TOGGLE_LEADERBOARD": {
      trackEvent("toggle_leaderboard", {
        fid: context?.user?.fid,
        xp: state.experience,
        level: state.level,
      });
      return {
        ...state,
        showLeaderboard: !state.showLeaderboard,
      };
    }

    case "PURCHASE_PERK": {
      if (state.coins < action.perk.cost) {
        return state;
      }

      // For instant growth perks, check inventory capacity
      if (action.perk.type === "INSTANT_GROWTH") {
        const currentFertilizers = state.perks.owned
          .filter((p) => p.type === "INSTANT_GROWTH")
          .reduce((sum, p) => sum + (p.quantity || 0), 0);
        const totalItems =
          Object.values(state.seeds).reduce((a, b) => a + b, 0) +
          Object.values(state.crops).reduce((a, b) => a + b, 0) +
          currentFertilizers;

        if (
          totalItems + (action.perk.quantity || 1) >
          state.inventoryCapacity
        ) {
          return state;
        }
      }

      playSound?.("coins");
      trackEvent("purchase_perk", {
        perk: action.perk,
        fid: context?.user?.fid,
        xp: state.experience,
        level: state.level,
        cost: action.perk.cost,
        coins: state.coins,
      });
      return {
        ...state,
        coins: state.coins - action.perk.cost,
        perks: {
          ...state.perks,
          owned: [...state.perks.owned, action.perk],
        },
      };
    }

    case "SELECT_FERTILIZER": {
      trackEvent("select_fertilizer", {
        perk: action.perk,
        fid: context?.user?.fid,
        xp: state.experience,
        level: state.level,
      });
      return state;
    }

    default:
      return state;
  }
}

const createInitialGrid = (width: number, height: number): GridCell[][] => {
  return Array(height)
    .fill(null)
    .map((_, y) =>
      Array(width)
        .fill(null)
        .map((_, x) => ({
          id: `${x}-${y}`,
          x,
          y,
          tilled: true,
          crop: undefined,
        }))
    );
};

// Initial state
const initialState: GameState = {
  coins: 0,
  level: 1,
  experience: 0,
  seeds: {
    wheat: 4,
    corn: 0,
    tomato: 0,
    potato: 0,
  },
  crops: {
    wheat: 0,
    corn: 0,
    tomato: 0,
    potato: 0,
  },
  inventoryCapacity: 100,
  grid: createInitialGrid(2, 2),
  perks: {
    active: [],
    owned: [
      {
        id: "instant_growth_1",
        name: "Basic Fertilizer",
        description: "Instantly grows one crop to full maturity",
        cost: 100,
        type: "INSTANT_GROWTH",
        multiplier: 1,
        icon: "🧪",
        quantity: 4,
      },
    ],
  },
  gridSize: { width: 2, height: 2 },
  expansionLevel: 0,
  showInventory: false,
  showMarketplace: false,
  showSettings: false,
  showLeaderboard: false,
};

// Create the context with initial null value
export const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { playSound } = useAudio();
  const { context } = useFrameContext();
  const [state, dispatch] = useReducer(
    (state: GameState, action: GameAction) =>
      gameReducer(state, action, playSound, context!),
    initialState
  );
  const [selectedCrop, setSelectedCrop] = useState<CropType | null>(null);
  const [selectedFertilizer, setSelectedFertilizer] = useState<Perk | null>(
    null
  );

  // Implement game actions
  const tillSoil = (x: number, y: number) => {
    dispatch({ type: "TILL_SOIL", x, y });
  };

  const plantCrop = (x: number, y: number, cropType: CropType) => {
    dispatch({ type: "PLANT_CROP", x, y, cropType });
  };

  const harvestCrop = (
    x: number,
    y: number,
    rewards: { exp: number; amount: number }
  ) => {
    dispatch({ type: "HARVEST_CROP", x, y, rewards });
  };

  // Update crop growth every second
  useEffect(() => {
    const interval: NodeJS.Timeout = setInterval(() => {
      dispatch({ type: "UPDATE_GROWTH" });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const activatePerk = (perk: Perk) => {
    dispatch({ type: "ACTIVATE_PERK", perk });
  };

  const purchasePerk = (perk: Perk) => {
    dispatch({ type: "PURCHASE_PERK", perk });
  };

  const getActivePerks = () => {
    const now = Date.now();
    return state.perks.active.filter((perk: Perk) => {
      if (!perk.duration || !perk.activatedAt) return true;
      const isActive = now - perk.activatedAt < perk.duration;

      // If perk is expired, we should remove it from active perks
      if (!isActive) {
        dispatch({
          type: "ACTIVATE_PERK",
          perk: { ...perk, activatedAt: 0 },
        });
      }
      return isActive;
    });
  };

  const toggleInventory = () => dispatch({ type: "TOGGLE_INVENTORY" });
  const toggleMarketplace = () => dispatch({ type: "TOGGLE_MARKETPLACE" });
  const toggleSettings = () => dispatch({ type: "TOGGLE_SETTINGS" });
  const toggleLeaderboard = () => dispatch({ type: "TOGGLE_LEADERBOARD" });

  return (
    <GameContext.Provider
      value={{
        state,
        selectedCrop,
        setSelectedCrop,
        selectedFertilizer,
        setSelectedFertilizer,
        tillSoil,
        plantCrop,
        harvestCrop,
        activatePerk,
        purchasePerk,
        getActivePerks,
        dispatch,
        toggleInventory,
        toggleMarketplace,
        toggleSettings,
        toggleLeaderboard,
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

function calculateGrowthMultiplier(
  state: GameState,
  cropType: CropType
): number {
  const now = Date.now();
  return state.perks.active
    .filter(
      (perk: Perk) =>
        perk.type === "GROWTH_BOOSTER" &&
        (!perk.cropType || perk.cropType === cropType) &&
        (!perk.duration ||
          !perk.activatedAt ||
          now - perk.activatedAt < perk.duration)
    )
    .reduce((mult: number, perk: Perk) => mult * perk.multiplier, 1);
}

function calculateYieldMultiplier(
  state: GameState,
  cropType: CropType
): number {
  const now = Date.now();
  return state.perks.active
    .filter(
      (perk: Perk) =>
        perk.type === "YIELD_BOOSTER" &&
        (!perk.cropType || perk.cropType === cropType) &&
        (!perk.duration ||
          !perk.activatedAt ||
          now - perk.activatedAt < perk.duration)
    )
    .reduce((mult: number, perk: Perk) => mult * perk.multiplier, 1);
}
