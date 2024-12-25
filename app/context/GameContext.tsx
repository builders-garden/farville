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

// Add EXPANSION_COSTS to the context file
export const EXPANSION_COSTS: ExpansionCost[] = [
  { coins: 500, level: 2, nextSize: { width: 6, height: 6 } },
  { coins: 1000, level: 4, nextSize: { width: 8, height: 8 } },
  { coins: 2500, level: 7, nextSize: { width: 10, height: 10 } },
  { coins: 5000, level: 10, nextSize: { width: 12, height: 12 } },
  { coins: 10000, level: 15, nextSize: { width: 14, height: 14 } },
  { coins: 20000, level: 20, nextSize: { width: 16, height: 16 } },
];

// Define action types
type GameAction =
  | { type: "TILL_SOIL"; x: number; y: number }
  | { type: "PLANT_CROP"; x: number; y: number; cropType: CropType }
  | { type: "HARVEST_CROP"; x: number; y: number }
  | { type: "UPDATE_GROWTH" }
  | { type: "ACTIVATE_PERK"; perk: Perk }
  | { type: "PURCHASE_PERK"; perk: Perk }
  | { type: "BUY_SEEDS"; cropType: CropType; amount: number }
  | { type: "SELL_CROPS"; cropType: CropType; amount: number }
  | { type: "EXPAND_LAND" }
  | { type: "TOGGLE_INVENTORY" }
  | { type: "TOGGLE_MARKETPLACE" }
  | { type: "TOGGLE_SETTINGS" };

// Define context type
interface GameContextType {
  state: GameState;
  selectedCrop: CropType | null;
  setSelectedCrop: (crop: CropType | null) => void;
  tillSoil: (x: number, y: number) => void;
  plantCrop: (x: number, y: number, cropType: CropType) => void;
  harvestCrop: (x: number, y: number) => void;
  activatePerk: (perk: Perk) => void;
  purchasePerk: (perk: Perk) => void;
  getActivePerks: () => Perk[];
  dispatch: Dispatch<GameAction>;
  toggleInventory: () => void;
  toggleMarketplace: () => void;
  toggleSettings: () => void;
}

type GrowthTimes = {
  [K in CropType]: number;
};

// Game reducer function
function gameReducer(
  state: GameState,
  action: GameAction,
  playSound?: (sound: string) => void
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
      const rewards: { [key in CropType]: { exp: number; yield: number } } = {
        wheat: { exp: 5, yield: 2 },
        corn: { exp: 8, yield: 2 },
        tomato: { exp: 10, yield: 3 },
        potato: { exp: 12, yield: 4 },
      };
      const reward = rewards[harvestedType];

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
      const harvestedAmount = Math.floor(reward.yield * yieldMultiplier);

      const newCrops = {
        ...state.crops,
        [harvestedType]: Math.min(
          state.crops[harvestedType] + harvestedAmount,
          state.inventoryCapacity
        ),
      };

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
            wheat: 30000,
            corn: 45000,
            tomato: 60000,
            potato: 90000,
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

      const now = Date.now();
      const activePerks = state.perks.active.filter((perk) => {
        if (!perk.duration || !perk.activatedAt) return true;
        return (
          now - perk.activatedAt < perk.duration &&
          perk.type !== action.perk.type
        );
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

      const totalCost = seedPrices[action.cropType] * action.amount;

      if (state.coins < totalCost) {
        return state;
      }

      playSound?.("coins");
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
        wheat: 10,
        corn: 15,
        tomato: 20,
        potato: 25,
      };

      if (state.crops[action.cropType] < action.amount) {
        return state;
      }

      const totalEarnings = cropPrices[action.cropType] * action.amount;

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

      return {
        ...state,
        coins: state.coins - expansion.coins,
        grid: newGrid,
        gridSize: expansion.nextSize,
        expansionLevel: state.expansionLevel + 1,
      };
    }

    case "TOGGLE_INVENTORY":
      return {
        ...state,
        showInventory: !state.showInventory,
      };

    case "TOGGLE_MARKETPLACE":
      return {
        ...state,
        showMarketplace: !state.showMarketplace,
      };

    case "TOGGLE_SETTINGS":
      return {
        ...state,
        showSettings: !state.showSettings,
      };

    case "PURCHASE_PERK": {
      if (state.coins < action.perk.cost) {
        return state;
      }

      playSound?.("coins");
      return {
        ...state,
        coins: state.coins - action.perk.cost,
        perks: {
          ...state.perks,
          owned: [...state.perks.owned, action.perk],
        },
      };
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
  coins: 100,
  level: 1,
  experience: 0,
  seeds: {
    wheat: 5,
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
  grid: createInitialGrid(4, 4),
  perks: {
    active: [],
    owned: [],
  },
  gridSize: { width: 4, height: 4 },
  expansionLevel: 0,
  showInventory: false,
  showMarketplace: false,
  showSettings: false,
};

// Create the context with initial null value
export const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { playSound } = useAudio();
  const [state, dispatch] = useReducer(
    (state: GameState, action: GameAction) =>
      gameReducer(state, action, playSound),
    initialState
  );
  const [selectedCrop, setSelectedCrop] = useState<CropType | null>(null);

  // Add debug logging for state changes
  useEffect(() => {
    console.log("State updated:", {
      inventory: state.inventoryCapacity,
      experience: state.experience,
      level: state.level,
    });
  }, [state]);

  // Debug experience changes
  useEffect(() => {
    console.log("Experience updated:", {
      previous: state.experience - (state.level - 1) * 100,
      current: state.experience,
      level: state.level,
      nextLevel: state.level * 100,
    });
  }, [state.experience, state.level]);

  // Debug inventory changes
  useEffect(() => {
    console.log("Inventory updated:", state.inventoryCapacity);
  }, [state.inventoryCapacity]);

  // Implement game actions
  const tillSoil = (x: number, y: number) => {
    dispatch({ type: "TILL_SOIL", x, y });
  };

  const plantCrop = (x: number, y: number, cropType: CropType) => {
    dispatch({ type: "PLANT_CROP", x, y, cropType });
  };

  const harvestCrop = (x: number, y: number) => {
    dispatch({ type: "HARVEST_CROP", x, y });
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

  return (
    <GameContext.Provider
      value={{
        state,
        selectedCrop,
        setSelectedCrop,
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
