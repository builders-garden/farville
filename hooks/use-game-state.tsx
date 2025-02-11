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
  claimableQuests?: boolean;
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
    const newState: GameState = {
      coins: 0,
      level: 0,
      experience: 0,
      seeds: [],
      crops: [],
      grid: [],
      gridSize: { width: 0, height: 0 },
      perks: [],
      expansionLevel: 0,
      items: [],
      inventory: [],
      user: {} as DbUser,
      claimableQuests: false,
    };

    if (user) {
      const { currentLevel } = getCurrentLevelAndProgress(user.xp);
      newState.coins = user.coins;
      newState.level = currentLevel;
      newState.experience = user.xp;
      newState.expansionLevel = user.expansions - 1;
      newState.user = user;
    }

    if (userItems) {
      newState.seeds = userItems.filter((ui) => ui.item.category === "seed");
      newState.crops = userItems.filter((ui) => ui.item.category === "crop");
      newState.perks = userItems.filter(
        (item) => item.item.category === "perk"
      );
      newState.inventory = userItems;
    }

    if (gridCells) {
      newState.grid = gridCells;
      newState.gridSize = {
        width: Math.max(...gridCells.map((cell) => cell.x)),
        height: Math.max(...gridCells.map((cell) => cell.y)),
      };
    }

    if (items) {
      newState.items = items;
    }

    if (claimableQuests) {
      newState.claimableQuests =
        (claimableQuests?.daily?.length ?? 0) > 0 ||
        (claimableQuests?.weekly?.length ?? 0) > 0 ||
        (claimableQuests?.monthly?.length ?? 0) > 0 ||
        (claimableQuests?.farmer?.length ?? 0) > 0;
    }

    setState((prevState) => ({
      ...prevState,
      ...newState,
    }));
  }, [userItems, items, user, gridCells, claimableQuests]);

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
  }, [
    refetchUserItems,
    refetchUser,
    refetchGrid,
    refetchItems,
    refetchClaimableQuests,
    updateState,
  ]);

  // Add new method to update grid cells directly
  const updateGridCells = useCallback((updatedCells: Partial<DbGridCell>[]) => {
    setState((prevState) => {
      if (!prevState) return prevState;

      const newGrid = [...prevState.grid];

      updatedCells.forEach((updatedCell) => {
        const index = newGrid.findIndex(
          (cell) => cell.x === updatedCell.x && cell.y === updatedCell.y
        );
        if (index !== -1) {
          newGrid[index] = { ...newGrid[index], ...updatedCell };
        }
      });

      return {
        ...prevState,
        grid: newGrid,
      };
    });
  }, []);

  // Add new method to update user items directly
  const updateUserItems = useCallback((updatedItems: Partial<UserItem>[]) => {
    setState((prevState) => {
      if (!prevState) return prevState;

      const newSeeds = [...prevState.seeds];
      const newPerks = [...prevState.perks];
      const newCrops = [...prevState.crops];

      updatedItems.forEach((updatedItem) => {
        if (updatedItem.item && updatedItem.item.category === "seed") {
          const index = newSeeds.findIndex(
            (item) => item.item?.id === updatedItem.item?.id
          );
          if (index !== -1) {
            newSeeds[index] = { ...newSeeds[index], ...updatedItem };
          }
        } else if (updatedItem.item && updatedItem.item.category === "perk") {
          const index = newPerks.findIndex(
            (item) => item.item?.id === updatedItem.item?.id
          );
          if (index !== -1) {
            newPerks[index] = { ...newPerks[index], ...updatedItem };
          }
        } else if (updatedItem.item && updatedItem.item.category === "crop") {
          const index = newCrops.findIndex(
            (item) => item.item?.id === updatedItem.item?.id
          );
          if (index !== -1) {
            newCrops[index] = { ...newCrops[index], ...updatedItem };
          }
        }
      });

      return {
        ...prevState,
        seeds: newSeeds,
        perks: newPerks,
      };
    });
  }, []);

  const updateUser = useCallback(
    (newParams: { xp?: number; level?: number; coins?: number }) => {
      setState((prevState) => {
        if (!prevState) return prevState;

        return {
          ...prevState,
          experience: newParams.xp ?? prevState.experience,
          level: newParams.level ?? prevState.level,
          user: {
            ...prevState.user,
            xp: newParams.xp ?? prevState.experience,
          },
          coins: newParams.coins ?? prevState.coins,
        };
      });
    },
    []
  );

  return {
    state,
    loading:
      userItemsLoading ||
      itemsLoading ||
      userLoading ||
      gridCellsLoading ||
      claimableQuestsLoading,
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
    updateGridCells,
    updateUserItems,
    updateUser,
  };
};
