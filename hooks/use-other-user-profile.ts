import { UserItem, useUserItems } from "./use-user-items";
import { useUser } from "./use-user";
import { useUserHarvestedCrops } from "./use-user-harvested-crops";
import { getCurrentDayStreak, getCurrentLevelAndProgress } from "@/lib/utils";
import { useUserStreaks } from "./use-user-streaks";
import { useUserFrosts } from "./use-user-frosts";
import { useEffect, useState } from "react";
import { useUserCollectibles } from "./use-user-collectibles";
import { UserHarvestedCrop } from "@prisma/client";
import { UserCompleteCollectible, UserWithStatistic } from "@/lib/prisma/types";
import { Mode } from "@/lib/types/game";

interface OtherUserProfileData {
  user: UserWithStatistic | undefined;
  specialCrops: UserItem[] | undefined;
  harvestedCropsSummary: UserHarvestedCrop[] | undefined;
  level: number;
  currentStreakDays: number;
  collectibles: UserCompleteCollectible[] | undefined;
}

export function useOtherUserProfile(
  mode: Mode = Mode.Classic,
  fid?: number
): {
  userData: OtherUserProfileData;
  isLoading: boolean;
} {
  const { user, isLoading: userLoading } = useUser({ fid });
  const { userItems, isLoading: userItemsLoading } = useUserItems(mode, fid);
  const { userHarvestedCrops, isLoading: isUserHarvestedCropsLoading } =
    useUserHarvestedCrops(fid);
  const { userStreaks, isLoading: streaksLoading } = useUserStreaks(fid);
  const { userFrosts, isLoading: frostsLoading } = useUserFrosts(fid);
  const { userCollectibles, isLoading: userCollectiblesLoading } =
    useUserCollectibles(fid);

  const [userData, setUserData] = useState<OtherUserProfileData>({
    user: undefined,
    specialCrops: undefined,
    harvestedCropsSummary: undefined,
    level: 0,
    currentStreakDays: 0,
    collectibles: undefined,
  });

  const isLoading =
    userLoading ||
    userItemsLoading ||
    isUserHarvestedCropsLoading ||
    streaksLoading ||
    frostsLoading ||
    userCollectiblesLoading;

  useEffect(() => {
    if (user) {
      const { currentLevel } = getCurrentLevelAndProgress(user.xp || 0);
      setUserData((prev) => ({
        ...prev,
        user,
        level: currentLevel,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (userItems) {
      setUserData((prev) => ({
        ...prev,
        specialCrops: userItems.filter(
          (item) => item.item.category === "special-crop"
        ),
      }));
    }
  }, [userItems]);

  useEffect(() => {
    if (userHarvestedCrops) {
      setUserData((prev) => ({
        ...prev,
        harvestedCropsSummary: userHarvestedCrops,
      }));
    }
  }, [userHarvestedCrops]);

  useEffect(() => {
    if (userCollectibles) {
      setUserData((prev) => ({
        ...prev,
        collectibles: userCollectibles,
      }));
    }
  }, [userCollectibles]);

  useEffect(() => {
    if (userStreaks && userStreaks[0]) {
      const currentDayStreak = getCurrentDayStreak(
        userStreaks[0],
        userFrosts?.lastStreakDates
      );

      setUserData((prev) => ({
        ...prev,
        currentStreakDays: currentDayStreak,
      }));
    }
  }, [userStreaks, userFrosts?.lastStreakDates]);

  return {
    userData,
    isLoading,
  };
}
