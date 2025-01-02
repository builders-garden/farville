import { useItems, UserItem } from "./use-items";
import { useUser } from "./use-user";
import { useEffect, useState, useCallback } from "react";
import { useGridCells } from "./use-grid-cells";
import { DbGridCell } from "@/supabase/types";

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
}

export const useGameState = () => {
  const [state, setState] = useState<GameState>();
  const { items, isLoading: itemsLoading, refetch: refetchItems } = useItems();
  const { user, isLoading: userLoading, refetch: refetchUser } = useUser();
  const {
    gridCells,
    isLoading: gridCellsLoading,
    refetch: refetchGrid,
  } = useGridCells();

  const updateState = useCallback(() => {
    if (items && user && gridCells) {
      setState({
        coins: user.coins,
        level: Math.floor(Math.sqrt(user.xp / 100)) + 1,
        experience: user.xp,
        seeds: items.filter((item) => item.item.name === "seed"),
        crops: items.filter((item) => item.item.name === "crop"),
        grid: gridCells,
        gridSize: {
          width: Math.max(...gridCells.map((cell) => cell.x)),
          height: Math.max(...gridCells.map((cell) => cell.y)),
        },
        perks: items.filter((item) => item.item.name === "perk"),
        expansionLevel: user.expansions,
      });
    }
  }, [items, user, gridCells]);

  useEffect(() => {
    updateState();
  }, [updateState]);

  const refetchAll = useCallback(async () => {
    await Promise.all([refetchItems(), refetchUser(), refetchGrid()]);
    updateState();
  }, [refetchItems, refetchUser, refetchGrid, updateState]);

  return {
    state,
    loading: itemsLoading || userLoading || gridCellsLoading,
    refetch: {
      all: refetchAll,
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
