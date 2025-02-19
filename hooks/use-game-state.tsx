import { useUserItems, UserItem } from "./use-user-items";
import { useEffect, useState, useCallback } from "react";
import { useGridCells } from "./use-grid-cells";
import { DbGridCell, DbItem, DbStreak, DbUser } from "@/supabase/types";
import { useItems } from "./use-items";
import { getCurrentLevelAndProgress } from "@/lib/utils";
import { useUserMe } from "./use-user-me";
import { useUserQuests } from "./use-quests";
import { useUserStreaks } from "./use-user-streaks";
import { useUserFrosts } from "./use-user-frosts";

export interface RefetchType {
  all: () => Promise<void>;
  userItems: () => Promise<void>;
  items: () => Promise<void>;
  user: () => Promise<void>;
  grid: () => Promise<void>;
  claimableQuests: () => Promise<void>;
  streaks: () => Promise<void>;
  frosts: () => Promise<void>;
}

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
  claimableQuests: boolean;
  streakUpdated: boolean;
  streaks: DbStreak[];
  specialItems: UserItem[];
  frosts: Date[];
}

export const useGameState = () => {
  const [state, setState] = useState<GameState>({
    coins: 0,
    level: 0,
    experience: 0,
    seeds: [],
    crops: [],
    grid: [],
    gridSize: {
      width: 0,
      height: 0,
    },
    perks: [],
    expansionLevel: 0,
    items: [],
    inventory: [],
    user: {} as DbUser,
    claimableQuests: false,
    streakUpdated: false,
    streaks: [],
    specialItems: [],
    frosts: [],
  });
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
  const {
    userStreaks,
    isLoading: streaksLoading,
    refetch: refetchStreaks,
  } = useUserStreaks();
  const {
    userFrosts,
    isLoading: frostsLoading,
    refetch: refetchFrosts,
  } = useUserFrosts();

  const updateUserState = useCallback(() => {
    if (user) {
      const { currentLevel } = getCurrentLevelAndProgress(user.xp);
      setState((prevState) => ({
        ...prevState!,
        coins: user.coins,
        level: currentLevel,
        experience: user.xp,
        expansionLevel: user.expansions - 1,
        user: user,
      }));
    }
  }, [user]);

  const updateUserItemsState = useCallback(() => {
    if (userItems) {
      setState((prevState) => ({
        ...prevState!,
        seeds: userItems.filter((ui) => ui.item.category === "seed"),
        crops: userItems.filter((ui) => ui.item.category === "crop"),
        perks: userItems.filter((item) => item.item.category === "perk"),
        inventory: userItems,
        specialItems: userItems.filter(
          (item) => item.item.category === "special"
        ),
      }));
    }
  }, [userItems]);

  const updateGridState = useCallback(() => {
    if (gridCells) {
      setState((prevState) => ({
        ...prevState!,
        grid: gridCells,
        gridSize: {
          width: Math.max(...gridCells.map((cell) => cell.x)),
          height: Math.max(...gridCells.map((cell) => cell.y)),
        },
      }));
    }
  }, [gridCells]);

  const updateItemsState = useCallback(() => {
    if (items) {
      setState((prevState) => ({
        ...prevState!,
        items: items.filter((item) => item.category !== "special"),
      }));
    }
  }, [items]);

  const updateClaimableQuestsState = useCallback(() => {
    if (claimableQuests) {
      setState((prevState) => ({
        ...prevState!,
        claimableQuests:
          (claimableQuests?.daily?.length ?? 0) > 0 ||
          (claimableQuests?.weekly?.length ?? 0) > 0 ||
          (claimableQuests?.monthly?.length ?? 0) > 0 ||
          (claimableQuests?.farmer?.length ?? 0) > 0,
      }));
    }
  }, [claimableQuests]);

  const updateStreaksState = useCallback(() => {
    if (userStreaks) {
      setState((prevState) => ({
        ...prevState!,
        streaks: userStreaks,
      }));
    }
  }, [userStreaks]);

  const updateUserFrostsState = useCallback(() => {
    if (userFrosts) {
      setState((prevState) => ({
        ...prevState!,
        frosts: userFrosts,
      }));
    }
  }, [userFrosts]);

  useEffect(() => {
    updateUserState();
  }, [user, updateUserState]);

  useEffect(() => {
    updateUserItemsState();
  }, [userItems, updateUserItemsState]);

  useEffect(() => {
    updateGridState();
  }, [gridCells, updateGridState]);

  useEffect(() => {
    updateItemsState();
  }, [items, updateItemsState]);

  useEffect(() => {
    updateClaimableQuestsState();
  }, [claimableQuests, updateClaimableQuestsState]);

  useEffect(() => {
    updateStreaksState();
    const latestStreak = userStreaks?.[0];
    if (latestStreak) {
      const lastActionAt = new Date(latestStreak.lastActionAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (lastActionAt >= today) {
        setState((prevState) => ({
          ...prevState!,
          streakUpdated: true,
        }));
      }
    }
  }, [userStreaks, updateStreaksState]);

  useEffect(() => {
    updateUserFrostsState();
  }, [userFrosts, updateUserFrostsState]);

  const refetchAll = useCallback(async () => {
    await Promise.all([
      refetchUserItems(),
      refetchUser(),
      refetchGrid(),
      refetchItems(),
      refetchClaimableQuests(),
      refetchStreaks(),
    ]);
  }, [
    refetchUserItems,
    refetchUser,
    refetchGrid,
    refetchItems,
    refetchClaimableQuests,
    refetchStreaks,
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
      const newSpecialItems = [...prevState.specialItems];

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
          } else {
            newCrops.push(updatedItem as UserItem);
          }
        } else if (
          updatedItem.item &&
          updatedItem.item.category === "special"
        ) {
          const index = newSpecialItems.findIndex(
            (item) => item.item?.id === updatedItem.item?.id
          );
          if (index !== -1) {
            newSpecialItems[index] = {
              ...newSpecialItems[index],
              ...updatedItem,
            };
          } else {
            newSpecialItems.push(updatedItem as UserItem);
          }
        }
      });

      return {
        ...prevState,
        seeds: newSeeds,
        perks: newPerks,
        crops: newCrops,
        specialItems: newSpecialItems,
      };
    });
  }, []);

  const updateUser = useCallback(
    (newParams: {
      xp?: number;
      level?: number;
      coins?: number;
      streaks?: DbStreak[];
      streakUpdated?: boolean;
    }) => {
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
      claimableQuestsLoading ||
      streaksLoading ||
      frostsLoading,
    refetch: {
      all: refetchAll,
      userItems: async () => {
        await refetchUserItems();
      },
      items: async () => {
        await refetchItems();
      },
      user: async () => {
        await refetchUser();
      },
      grid: async () => {
        await refetchGrid();
      },
      claimableQuests: async () => {
        await refetchClaimableQuests();
      },
      streaks: async () => {
        await refetchStreaks();
      },
      frosts: async () => {
        await refetchFrosts();
      },
    } as RefetchType,
    updateGridCells,
    updateUserItems,
    updateUser,
  };
};
