import { useUserItems, UserItem } from "./use-user-items";
import { useUser } from "./use-user";
import { useEffect, useState, useCallback } from "react";
import { useGridCells } from "./use-grid-cells";
import { DbGridCell, DbItem } from "@/supabase/types";
import { useItems } from "./use-items";
import { getCurrentLevelAndProgress } from "@/lib/utils";

export interface GameState {
  coins: number;
  level: number;
  experience: number;
  seeds: UserItem[];
  crops: UserItem[];
  grid: DbGridCell[];
  gridSize: {
    width: number;
    height: number;
  };
  perks: UserItem[];
  expansionLevel: number;
  items: DbItem[];
}

export const useGameState = () => {
  const [state, setState] = useState<GameState>();
  const {
    userItems,
    isLoading: userItemsLoading,
    refetch: refetchUserItems,
  } = useUserItems();
  const { user, isLoading: userLoading, refetch: refetchUser } = useUser();
  const {
    gridCells,
    isLoading: gridCellsLoading,
    refetch: refetchGrid,
  } = useGridCells();
  const { items, isLoading: itemsLoading, refetch: refetchItems } = useItems();

  const updateState = useCallback(() => {
    if (userItems && items && user && gridCells) {
      const { currentLevel } = getCurrentLevelAndProgress(user?.xp);
      setState({
        coins: user.coins,
        level: currentLevel,
        experience: user.xp,
        seeds: userItems
          .filter((ui) => ui.item.category === "seed")
          .map((ui) => ui),
        crops: userItems
          .filter((ui) => ui.item.category === "crop")
          .map((ui) => ui),
        grid: gridCells,
        gridSize: {
          width: Math.max(...gridCells.map((cell) => cell.x)),
          height: Math.max(...gridCells.map((cell) => cell.y)),
        },
        perks: userItems.filter((item) => item.item.category === "perk"),
        expansionLevel: user.expansions,
        items: items,
      });
    }
  }, [userItems, items, user, gridCells]);

  useEffect(() => {
    updateState();
  }, [updateState]);

  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchUserItems(),
      refetchUser(),
      refetchGrid(),
      refetchItems(),
    ]);
    updateState();
  }, [refetchUserItems, refetchUser, refetchGrid, refetchItems, updateState]);

  return {
    state,
    loading:
      userItemsLoading || itemsLoading || userLoading || gridCellsLoading,
    refetch: {
      all: refetchAll,
      userItems: async () => {
        await refetchUserItems();
        updateState();
      },
      items: async () => {
        await refetchItems();
        updateState();
      },
      user: async () => {
        await refetchUser();
        updateState();
      },
      grid: async () => {
        await refetchGrid();
        updateState();
      },
    },
  };
};
