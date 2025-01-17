import { useUserItems, UserItem } from "./use-user-items";
import { useEffect, useState, useCallback } from "react";
import { useGridCells } from "./use-grid-cells";
import { DbGridCell, DbItem, DbUser } from "@/supabase/types";
import { useItems } from "./use-items";
import { getCurrentLevelAndProgress } from "@/lib/utils";
import { useUserMe } from "./use-user-me";
import { useUserQuests } from "./use-quests";

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
  inventory: UserItem[];
  user: DbUser;
  claimableQuests?: boolean
}

export const useGameState = () => {
  const [state, setState] = useState<GameState>();
  const {
    userItems,
    isLoading: userItemsLoading,
    refetch: refetchUserItems,
  } = useUserItems();
  const { user, isLoading: userLoading, refetch: refetchUser } = useUserMe();
  const {
    gridCells,
    isLoading: gridCellsLoading,
    refetch: refetchGrid,
  } = useGridCells();
  const { items, isLoading: itemsLoading, refetch: refetchItems } = useItems();
  const {
    quests: claimableQuests,
    isLoading: claimableQuestsLoading,
    refetch: refetchClaimableQuests,
  } = useUserQuests(state?.user?.fid, "completed");

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
        expansionLevel: user.expansions - 1,
        items: items,
        inventory: userItems,
        user: user,
        claimableQuests:
          (claimableQuests?.daily?.length ?? 0) > 0 ||
          (claimableQuests?.weekly?.length ?? 0) > 0 ||
          (claimableQuests?.monthly?.length ?? 0) > 0 ||
          (claimableQuests?.farmer?.length ?? 0) > 0,
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
      refetchClaimableQuests(),
    ]);
    updateState();
  }, [refetchUserItems, refetchUser, refetchGrid, refetchItems, refetchClaimableQuests, updateState]);

  return {
    state,
    loading:
      userItemsLoading || itemsLoading || userLoading || gridCellsLoading || claimableQuestsLoading,
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
      claimableQuests: async () => {
        await refetchClaimableQuests();
        updateState();
      },
    },
  };
};
