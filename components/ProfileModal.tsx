"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { useGame } from "@/context/GameContext";
import { Statistic } from "./profile/Statistic";
import { useEffect, useState } from "react";
import InfoModal from "./modals/InfoModal";
import { HarvestHonour } from "./profile/HarvestHonour";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { UserItem } from "@/hooks/use-user-items";
import {
  achievementBadgeFlexCardComposeCastUrl,
  calculateHarvestAchievements,
  goldCropFlexCardComposeCastUrl,
  mintedCollectibleFlexCardComposeCastUrl,
} from "@/lib/utils";
import { LeaderboardUserAvatar } from "./LeaderboardUserAvatar";
import sdk from "@farcaster/frame-sdk";
import { useOtherUserProfile } from "@/hooks/use-other-user-profile";
import AchievementBadgeModal from "./modals/AchievementBadgeModal";
import { ACHIEVEMENTS_THRESHOLDS } from "@/lib/game-constants";
import { OG_FIDS_LIST } from "@/lib/contracts/constants";
import { CollectibleStatus } from "@/lib/types/game";

export interface BadgeModalData {
  name: string;
  crop?: string;
  title: string;
  description: string;
  badgeUrl: string;
  step?: number;
  type: "special" | "gold-crop" | "honour" | "collectible";
  shareable?: boolean;
  mintable?: boolean;
  generated?: boolean;
  collectibleId?: string;
  collectibleName?: string;
}

export default function ProfileModal({
  onClose,
  userFid,
}: {
  onClose: () => void;
  userFid?: number;
}) {
  const {
    state,
    setShowMintOGBadge,
    showMintCollectible,
    setShowMintCollectible,
    newGoldCropsFound,
    setNewGoldCropsFound,
  } = useGame();
  const [isWhatIsThisOpen, setIsWhatIsThisOpen] = useState(false);
  const [isWhatIsThisCollectibleOpen, setIsWhatIsCollectibleThisOpen] =
    useState(false);
  const [showMoreCollectibles, setShowMoreCollectibles] = useState(false);
  const [showMoreGoldCropsBadges, setShowMoreGoldCropsBadges] = useState(false);
  const [selectedCrops, setSelectedCrops] = useState<UserItem[]>([]);
  const [badgeModalData, setBadgeModalData] = useState<BadgeModalData | null>(
    null
  );

  const { userData, isLoading } = useOtherUserProfile(userFid);

  const isCurrentUser = !userFid || userFid === state.user.fid;
  const user = isCurrentUser ? state.user : userData?.user;
  const isOgFarmer = user?.fid ? OG_FIDS_LIST.includes(user.fid) : false;

  const harvestHonours = calculateHarvestAchievements(
    isCurrentUser
      ? state.harvestedCropsSummary
      : userData?.harvestedCropsSummary || []
  );

  const goldCropsData = state.items.filter(
    (item) => item.category === "special-crop"
  );

  const collectiblesData = state.collectibles;

  useEffect(() => {
    if (isCurrentUser) {
      setSelectedCrops(
        (state.specialCrops || []).filter((crop) => crop.quantity > 0)
      );
    } else if (userData?.specialCrops) {
      setSelectedCrops(
        (userData.specialCrops || []).filter((crop) => crop.quantity > 0)
      );
    }
  }, [state.specialCrops, userData?.specialCrops, isCurrentUser]);

  const handleShareAchievement = async (badgeModalData: BadgeModalData) => {
    switch (badgeModalData.type) {
      case "gold-crop":
        if (badgeModalData.crop) {
          const { castUrl } = goldCropFlexCardComposeCastUrl(
            state.user.fid,
            badgeModalData.crop
          );
          await sdk.actions.openUrl(castUrl);
        }
        break;
      case "honour":
        if (badgeModalData.crop && badgeModalData.step) {
          const { castUrl } = achievementBadgeFlexCardComposeCastUrl(
            state.user.fid,
            badgeModalData.crop,
            badgeModalData.step,
            badgeModalData.title
          );
          await sdk.actions.openUrl(castUrl);
        }
        break;
      case "collectible":
        if (badgeModalData.collectibleId && badgeModalData.collectibleName) {
          const { castUrl } = mintedCollectibleFlexCardComposeCastUrl(
            state.user.fid,
            badgeModalData.collectibleId
          );
          await sdk.actions.openUrl(castUrl);
        }
        break;
      default:
        break;
    }
  };

  if (!isCurrentUser && isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#7E4E31] p-6 w-full min-h-screen"
        >
          <div className="flex flex-col items-center justify-center gap-4 min-h-screen">
            <div className="h-12 w-12 border-4 border-t-[#FFB938] border-[#5B4120] rounded-full animate-spin"></div>
            <span className="text-white/80 text-center">
              Loading farmer profile...
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-[#7E4E31] w-full min-h-screen"
      >
        <div className="max-w-4xl mx-auto p-4 mt-2">
          <div className="flex justify-between items-center mb-3 xs:mb-6">
            <div>
              <motion.h2
                className={`text-white/90 font-bold text-xl xs:text-2xl mb-1 flex items-center gap-1 xs:gap-2`}
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
              >
                <Image
                  src="/images/icons/farmer.png"
                  alt="Profile"
                  width={28}
                  height={28}
                  className="w-[28px] h-[28px] xs:w-[36px] xs:h-[36px]"
                />
                Profile
              </motion.h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 hover:bg-black/20 rounded-full transition-colors text-white/90 
                       flex items-center justify-center hover:rotate-90 transform duration-200"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 xs:space-y-4 overflow-y-auto h-[calc(100vh-80px)] xs:h-[calc(100vh-100px)] xs:pb-4 no-scrollbar">
            <div className="flex flex-col items-center gap-8">
              {/* Profile Information */}
              <Card className="bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none w-full max-w-2xl">
                <CardContent className="flex flex-col w-full gap-3 xs:gap-4 p-3 xs:p-4">
                  <div className="flex flex-row items-center gap-3 xs:gap-4">
                    <div
                      className={`relative flex-none w-fit ${
                        !isCurrentUser ? "cursor-pointer" : ""
                      }`}
                      onClick={async () => {
                        if (!isCurrentUser && user?.fid) {
                          await sdk.actions.viewProfile({
                            fid: user.fid,
                          });
                        }
                      }}
                    >
                      <LeaderboardUserAvatar
                        pfpUrl={
                          user?.selectedAvatarUrl || user?.avatarUrl || ""
                        }
                        username={user?.username}
                        isOgUser={user?.mintedOG}
                        size={{
                          width: 16,
                          height: 16,
                        }}
                        borderSize={3}
                      />
                    </div>
                    <div className="flex flex-col w-full gap-1 xs:gap-2">
                      <h3 className="text-white/90 font-bold text-xs xs:text-sm">
                        {!user?.displayName
                          ? "Farmer"
                          : user?.displayName?.length > 17
                          ? user?.displayName.slice(0, 13) + "..."
                          : user?.displayName}
                      </h3>
                      <div className="flex flex-row justify-between w-full">
                        <div className="text-[#f2a311] text-[10px] xs:text-xs">
                          Lvl{" "}
                          {isCurrentUser ? state.level : userData?.level || 1}
                        </div>
                        <div className="flex flex-row text-white/70 text-[10px] xs:text-xs gap-1">
                          <span>XP:</span>
                          <span>{user?.xp.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="w-full border-white/20" />

                  {/* Statistics */}
                  <div className="flex flex-col gap-1 xs:gap-2 text-white/80">
                    <Statistic
                      title="Farmer since"
                      image="/images/icons/farmer.png"
                      value={
                        user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "Unknown"
                      }
                    />
                    <Statistic
                      title="Streak"
                      image="/images/special/fire.png"
                      value={`${
                        isCurrentUser
                          ? state.currentStreakDays
                          : userData?.currentStreakDays || 0
                      } days`}
                    />
                  </div>

                  {/* Special Badges - profile only */}
                  {isCurrentUser && (
                    <div className="flex flex-row gap-3 mt-1 xs:mt-2 w-full">
                      {isOgFarmer ? (
                        <div className="relative w-full aspect-square flex-1">
                          <div
                            className="w-full h-full rounded-lg cursor-pointer overflow-hidden group relative border-2 border-[#179ef9] bg-[#7B5B30]"
                            onClick={() => {
                              if (isCurrentUser) {
                                setShowMintOGBadge(true);
                              }
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>
                            <Image
                              src="/images/badge/og.png"
                              alt="Farville OG Badge"
                              fill
                              sizes="(max-width: 420px) 25vw, 70px"
                              className={`${
                                user?.mintedOG ? "" : "opacity-30"
                              } rounded-lg transition-transform duration-300 group-hover:scale-110`}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-full aspect-square flex-1">
                          <div className="w-full h-full rounded-lg bg-[#7B5B30] flex items-center justify-center"></div>
                        </div>
                      )}
                      <div className="relative w-full aspect-square flex-1">
                        <div className="w-full h-full rounded-lg bg-[#7B5B30] flex items-center justify-center"></div>
                      </div>
                      <div className="relative w-full aspect-square flex-1">
                        <div className="w-full h-full rounded-lg bg-[#7B5B30] flex items-center justify-center"></div>
                      </div>
                      <div className="relative w-full aspect-square flex-1">
                        <div className="w-full h-full rounded-lg bg-[#7B5B30] flex items-center justify-center"></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {isCurrentUser ? (
                <>
                  {/* Collectibles section */}
                  <div className="w-full flex flex-col gap-3 xs:gap-4">
                    <div className="flex flex-row items-center justify-between px-2">
                      <div className="flex flex-row items-center gap-1 xs:gap-2">
                        <h3
                          className={`text-white/90 text-sm xs:text-md font-bold ${
                            showMintCollectible ? "animate-pulse" : ""
                          }`}
                          style={{
                            textShadow: showMintCollectible
                              ? "0 0 8px rgba(255, 185, 56, 0.8)"
                              : "none",
                            color: showMintCollectible ? "#FFB938" : "",
                          }}
                        >
                          Collectibles{" "}
                          {showMintCollectible && (
                            <span className="text-[#FFB938]">✨</span>
                          )}
                        </h3>
                        <p className="text-white/70 text-[9px] xs:text-xs">
                          ({state.collectibles.length || 0}/??)
                        </p>
                        <button
                          className="text-white/70 hover:text-white/90 transition-colors cursor-pointer -mt-1"
                          onClick={() => setIsWhatIsCollectibleThisOpen(true)}
                        >
                          <Info className="w-3.5 h-3.5 xs:w-5 xs:h-5" />
                        </button>
                      </div>
                      {showMoreCollectibles ? (
                        <button
                          className="text-white/70 hover:text-white/90 transition-colors cursor-pointer -mt-1"
                          onClick={() => setShowMoreCollectibles(false)}
                        >
                          <ChevronUp className="w-3.5 h-3.5 xs:w-5 xs:h-5" />
                        </button>
                      ) : (
                        <button
                          className="text-white/70 hover:text-white/90 transition-colors cursor-pointer -mt-1"
                          onClick={() => setShowMoreCollectibles(true)}
                        >
                          <ChevronDown className="w-3.5 h-3.5 xs:w-5 xs:h-5" />
                        </button>
                      )}
                      {isWhatIsThisCollectibleOpen && (
                        <InfoModal
                          title="Collectibles"
                          onCancel={() => setIsWhatIsCollectibleThisOpen(false)}
                          options={{
                            titleColor: "text-[#feb938]",
                          }}
                        >
                          <div className="flex flex-col gap-4 my-4 text-white/90 text-[10px]">
                            <p>
                              The badges below prove that you have claimed one
                              or more collectibles.
                            </p>
                          </div>
                        </InfoModal>
                      )}
                    </div>

                    <Card
                      className={`bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none w-full ${
                        showMintCollectible
                          ? "shadow-[0_0_20px_rgba(255,185,56,0.5)] transition-shadow duration-700"
                          : ""
                      }`}
                    >
                      <CardContent className="grid grid-cols-4 gap-3 p-3">
                        {(showMoreCollectibles
                          ? state.collectibles
                          : state.collectibles?.slice(0, 4)
                        )?.map((collectible, index) => {
                          const status =
                            collectible.userHasCollectibles?.status;
                          const collectibleImage =
                            collectible.userHasCollectibles
                              ? (status === CollectibleStatus.Minted ||
                                  status === CollectibleStatus.Uploaded) &&
                                collectible.userHasCollectibles.mintedImageUrl
                                ? collectible.userHasCollectibles.mintedImageUrl
                                : status === CollectibleStatus.Generated
                                ? collectible.userHasCollectibles
                                    .generatedImageUrls?.[0] ??
                                  collectible.imageUrl
                                : collectible.imageUrl
                              : collectible.imageUrl;
                          return collectible ? (
                            <div
                              key={index}
                              className={`relative aspect-square w-full rounded-lg bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] border-2 border-[#f2a311] overflow-hidden ${
                                isCurrentUser ? "cursor-pointer group" : ""
                              }`}
                              onClick={() => setShowMintCollectible(true)}
                            >
                              {showMintCollectible ? (
                                <div className="absolute inset-0 bg-gradient-to-b from-yellow/30 to-transparent z-10 animate-pulse pointer-events-none"></div>
                              ) : null}

                              <Image
                                src={collectibleImage}
                                alt={collectible.name}
                                fill
                                className={`rounded-md transition-transform duration-300 group-hover:scale-110 ${
                                  showMintCollectible ? "filter blur-[3px]" : ""
                                }`}
                                sizes="(max-width: 640px) 25vw, 20vw"
                              />
                            </div>
                          ) : (
                            <div
                              key={index}
                              className="relative aspect-square w-full bg-[#7B5B30] rounded-lg flex items-center justify-center opacity-50 overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-[#7B5B30] via-[#8a6b38] to-[#7B5B30] opacity-30"></div>
                              <Image
                                src={`/images/profile/question-mark-yellow.png`}
                                alt="Yellow question mark"
                                width={35}
                                height={35}
                                className="w-[35px] h-[35px] xs:w-[44px] xs:h-[44px]"
                              />
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Gold crops section */}
                  <div className="w-full flex flex-col gap-3 xs:gap-4">
                    <div className="flex flex-row items-center justify-between px-2">
                      <div className="flex flex-row items-center gap-1 xs:gap-2">
                        <h3
                          className={`text-white/90 text-sm xs:text-md font-bold ${
                            newGoldCropsFound.length > 0 ? "animate-pulse" : ""
                          }`}
                          style={{
                            textShadow:
                              newGoldCropsFound.length > 0
                                ? "0 0 8px rgba(255, 185, 56, 0.8)"
                                : "none",
                            color:
                              newGoldCropsFound.length > 0 ? "#FFB938" : "",
                          }}
                        >
                          Gold Crops{" "}
                          {newGoldCropsFound.length > 0 && (
                            <span className="text-[#FFB938]">✨</span>
                          )}
                        </h3>
                        <p className="text-white/70 text-[9px] xs:text-xs">
                          ({selectedCrops.length}/{goldCropsData.length})
                        </p>
                        <button
                          className="text-white/70 hover:text-white/90 transition-colors cursor-pointer -mt-1"
                          onClick={() => setIsWhatIsThisOpen(true)}
                        >
                          <Info className="w-3.5 h-3.5 xs:w-5 xs:h-5" />
                        </button>
                      </div>
                      {showMoreGoldCropsBadges ? (
                        <button
                          className="text-white/70 hover:text-white/90 transition-colors cursor-pointer -mt-1"
                          onClick={() => setShowMoreGoldCropsBadges(false)}
                        >
                          <ChevronUp className="w-3.5 h-3.5 xs:w-5 xs:h-5" />
                        </button>
                      ) : (
                        <button
                          className="text-white/70 hover:text-white/90 transition-colors cursor-pointer -mt-1"
                          onClick={() => setShowMoreGoldCropsBadges(true)}
                        >
                          <ChevronDown className="w-3.5 h-3.5 xs:w-5 xs:h-5" />
                        </button>
                      )}
                      {isWhatIsThisOpen && (
                        <InfoModal
                          title="Gold crops badges"
                          onCancel={() => setIsWhatIsThisOpen(false)}
                          options={{
                            titleColor: "text-[#feb938]",
                          }}
                        >
                          <div className="flex flex-col gap-4 my-4 text-white/90 text-[10px]">
                            <p>
                              The badges below prove that you have harvested at
                              least one gold version of the specific crop.
                            </p>
                            <p>
                              You will receive a new gold crop badge every time
                              you harvest a new gold crop type.
                            </p>
                          </div>
                        </InfoModal>
                      )}
                    </div>

                    <Card
                      className={`bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none w-full ${
                        newGoldCropsFound.length > 0
                          ? "shadow-[0_0_20px_rgba(255,185,56,0.5)] transition-shadow duration-700"
                          : ""
                      }`}
                    >
                      <CardContent className="grid grid-cols-4 gap-3 p-3">
                        {(showMoreGoldCropsBadges
                          ? goldCropsData
                          : goldCropsData?.slice(0, 4)
                        )?.map((crop, index) =>
                          selectedCrops.find(
                            (userGoldCrop) =>
                              userGoldCrop.item.slug === crop.slug
                          ) ? (
                            <div
                              key={index}
                              className={`relative aspect-square w-full rounded-lg bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] border-2 overflow-hidden
                        ${
                          newGoldCropsFound.includes(crop.slug)
                            ? "border-[#FFB938] shadow-lg shadow-[#FFB938]/40"
                            : "border-[#f2a311]"
                        } 
                        ${isCurrentUser ? "cursor-pointer group" : ""}`}
                              onClick={() => {
                                setBadgeModalData({
                                  name: crop.name,
                                  title: crop.name,
                                  description: `A rare ${crop.name} badge earned through luck and constancy in cultivating this crop in Farville.`,
                                  badgeUrl: `/images/badge/gold-crops/${crop.slug}.png`,
                                  type: "gold-crop",
                                  shareable: true,
                                  crop: crop.slug,
                                });
                                if (isCurrentUser) {
                                  setNewGoldCropsFound((prev) =>
                                    prev.filter((slug) => slug !== crop.slug)
                                  );
                                }
                              }}
                            >
                              {newGoldCropsFound.includes(crop.slug) && (
                                <div className="absolute inset-0 bg-gradient-to-b from-yellow/30 to-transparent z-10 animate-pulse pointer-events-none"></div>
                              )}
                              <Image
                                src={`/images/badge/gold-crops/${crop.slug}.png`}
                                alt={crop.name}
                                fill
                                className={`rounded-lg transition-transform duration-300 group-hover:scale-110 ${
                                  !newGoldCropsFound.includes(crop.slug)
                                    ? ""
                                    : "filter blur-[3px] brightness-[50%] animate-pulse-slow"
                                }`}
                                sizes="(max-width: 640px) 25vw, 20vw"
                              />
                            </div>
                          ) : (
                            <div
                              key={index}
                              className="relative aspect-square w-full bg-[#7B5B30] rounded-lg flex items-center justify-center opacity-50 overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-[#7B5B30] via-[#8a6b38] to-[#7B5B30] opacity-30"></div>
                              <Image
                                src={`/images/profile/question-mark-yellow.png`}
                                alt="Yellow question mark"
                                width={35}
                                height={35}
                                className="w-[35px] h-[35px] xs:w-[44px] xs:h-[44px]"
                              />
                            </div>
                          )
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Harvest Honours section */}
                  <div className="w-full flex flex-col gap-3 xs:gap-4">
                    <div className="flex flex-row items-center gap-1 xs:gap-2 px-2">
                      <h3 className="text-white/90 text-sm xs:text-md font-bold">
                        Harvest Honours
                      </h3>
                      <p className="text-white/70 text-[9px] xs:text-xs">
                        ({harvestHonours.totalAchievementsCompleted}/
                        {harvestHonours.totalAchievements})
                      </p>
                    </div>
                    {harvestHonours.harvestAchievements.map((honour, index) => (
                      <HarvestHonour
                        key={index}
                        crop={honour.crop}
                        title={honour.title}
                        totalCount={honour.totalCount}
                        currentCount={honour.currentCount}
                        currentGoal={honour.currentGoal}
                        step={honour.step}
                        setBadgeModalData={setBadgeModalData}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Collectibles section */}
                  <div className="w-full flex flex-col gap-4">
                    <div className="flex w-full justify-between text-white/90 text-xs xs:text-sm font-bold">
                      <h3>Achievements</h3>
                      <span>
                        {harvestHonours.totalAchievementsCompleted +
                          (userData.specialCrops?.length || 0) +
                          (userData.user?.mintedOG ? 1 : 0) +
                          (userData.collectibles?.length || 0)}
                        /
                        {harvestHonours.totalAchievements +
                          goldCropsData.length +
                          collectiblesData.length +
                          1}
                      </span>
                    </div>
                    <Card className="bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none">
                      <CardContent className="p-3 xs:p-4 space-y-4 xs:space-y-6">
                        {/* Special Badges */}
                        <div className="flex flex-col gap-1 xs:gap-2">
                          <div className="flex flex-row justify-between items-center">
                            <h4 className="text-white/90 text-[9px] xs:text-xs font-bold">
                              Special Badges
                            </h4>
                            <p className="text-white/70 text-[9px] xs:text-xs">
                              {userData.user?.mintedOG ? "1" : "0"}/1
                            </p>
                          </div>
                          <div className="grid grid-cols-8 gap-[0.2rem] xs:gap-1">
                            <div
                              className={`relative aspect-square w-full rounded-lg bg-[#7E4E31] ${
                                userData?.user?.mintedOG
                                  ? "border border-[#179ef9] cursor-pointer"
                                  : "opacity-50"
                              }`}
                              onClick={
                                userData?.user?.mintedOG
                                  ? () => {
                                      setBadgeModalData({
                                        name: "Special Badge",
                                        title: "Farville OG Badge",
                                        description: `A symbol of honor, proving the participation in Farville Alpha.`,
                                        badgeUrl: `/images/badge/og.png`,
                                        type: "special",
                                      });
                                    }
                                  : () => {}
                              }
                            >
                              {userData?.user?.mintedOG ? (
                                <Image
                                  src="/images/badge/og.png"
                                  alt="OG Badge"
                                  fill
                                  className="rounded-lg"
                                  sizes="(max-width: 420px) 100%, 36px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Image
                                    src="/images/profile/question-mark-yellow.png"
                                    alt="Yellow question mark"
                                    width={14}
                                    height={14}
                                    className="w-[14px] h-[14px] xs:w-[18px] xs:h-[18px]"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Collectibles */}
                        <div className="flex flex-col gap-1 xs:gap-2">
                          <div className="flex flex-row justify-between items-center">
                            <h4 className="text-white/90 text-[9px] xs:text-xs font-bold">
                              Collectibles
                            </h4>
                            <p className="text-white/70 text-[9px] xs:text-xs">
                              {userData?.collectibles?.[0].userHasCollectibles
                                ? 1
                                : 0}
                              /{collectiblesData.length}
                            </p>
                          </div>
                          <div className="grid grid-cols-8 gap-[0.2rem] xs:gap-1">
                            {userData.collectibles?.map(
                              (collectible, index) => {
                                const status =
                                  collectible.userHasCollectibles?.status;
                                const collectibleImage =
                                  collectible.userHasCollectibles
                                    ? (status === CollectibleStatus.Minted ||
                                        status ===
                                          CollectibleStatus.Uploaded) &&
                                      collectible.userHasCollectibles
                                        .mintedImageUrl
                                      ? collectible.userHasCollectibles
                                          .mintedImageUrl
                                      : status === CollectibleStatus.Generated
                                      ? collectible.userHasCollectibles
                                          .generatedImageUrls?.[0] ??
                                        collectible.imageUrl
                                      : collectible.imageUrl
                                    : collectible.imageUrl;
                                return status &&
                                  status === CollectibleStatus.Minted ? (
                                  <div
                                    key={index}
                                    className={`relative aspect-square w-full rounded-lg bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] border border-[#f2a311] overflow-hidden cursor-pointer`}
                                    onClick={() => {
                                      setBadgeModalData({
                                        name: "Farville Avatar",
                                        title: `Farville Farmer #${userData.user?.fid}`,
                                        description: `This is the custom Farville avatar of ${userData.user?.username}.`,
                                        badgeUrl: collectibleImage,
                                        type: "collectible",
                                      });
                                    }}
                                  >
                                    <Image
                                      src={collectibleImage}
                                      alt={collectible.name}
                                      fill
                                      className={`rounded-md transition-transform duration-300 ${
                                        isCurrentUser ? "group" : ""
                                      }`}
                                      sizes="(max-width: 640px) 25vw, 20vw"
                                    />
                                  </div>
                                ) : (
                                  <div
                                    key={index}
                                    className="relative aspect-square w-full bg-[#7E4E31] rounded-lg flex items-center justify-center opacity-50"
                                  >
                                    <Image
                                      src={`/images/profile/question-mark-yellow.png`}
                                      alt="Yellow question mark"
                                      width={14}
                                      height={14}
                                      className="w-[14px] h-[14px] xs:w-[18px] xs:h-[18px]"
                                    />
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>

                        {/* Glowing Crops */}
                        <div className="flex flex-col gap-1 xs:gap-2">
                          <div className="flex flex-row justify-between items-center">
                            <h4 className="text-white/90 text-[9px] xs:text-xs font-bold">
                              Gold Crops
                            </h4>
                            <p className="text-white/70 text-[9px] xs:text-xs">
                              {selectedCrops.length}/{goldCropsData.length}
                            </p>
                          </div>
                          <div className="grid grid-cols-8 gap-[0.2rem] xs:gap-1">
                            {goldCropsData.map((crop, index) =>
                              userData.specialCrops?.find(
                                (c) => c.item.slug === crop.slug
                              ) ? (
                                <div
                                  key={index}
                                  className="relative aspect-square w-full rounded-lg bg-[#7E4E31] border border-[#FFB938] cursor-pointer"
                                  onClick={() => {
                                    setBadgeModalData({
                                      name: crop.name,
                                      title: crop.name,
                                      description: `A badge issued to those who demonstrated mastery of the ${
                                        crop.name
                                      } by harvesting ${
                                        crop.name.endsWith("y")
                                          ? crop.name.slice(
                                              0,
                                              crop.name.length - 1
                                            ) + "ies"
                                          : crop.name.endsWith("o")
                                          ? crop.name + "es"
                                          : crop.name + "s"
                                      }!`,
                                      badgeUrl: `/images/badge/gold-crops/${crop.slug}.png`,
                                      type: "gold-crop",
                                      crop: crop.slug,
                                    });
                                  }}
                                >
                                  <Image
                                    src={`/images/badge/gold-crops/${crop.slug}.png`}
                                    alt={crop.name}
                                    fill
                                    sizes="(max-width: 420px) 100%, 36px"
                                    className="rounded-lg"
                                  />
                                </div>
                              ) : (
                                <div
                                  key={index}
                                  className="relative aspect-square w-full bg-[#7E4E31] rounded-lg flex items-center justify-center opacity-50"
                                >
                                  <Image
                                    src={`/images/profile/question-mark-yellow.png`}
                                    alt="Yellow question mark"
                                    width={14}
                                    height={14}
                                    className="w-[14px] h-[14px] xs:w-[18px] xs:h-[18px]"
                                  />
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {/* Harvest Honours */}
                        <div className="flex flex-col gap-1 xs:gap-2">
                          <div className="flex flex-row justify-between items-center">
                            <h4 className="text-white/90 text-[9px] xs:text-xs font-bold">
                              Harvest Honours
                            </h4>
                            <p className="text-white/70 text-[9px] xs:text-xs">
                              {harvestHonours.totalAchievementsCompleted}/
                              {harvestHonours.totalAchievements}
                            </p>
                          </div>
                          <div className="grid grid-cols-8 gap-[0.2rem] xs:gap-1">
                            {harvestHonours.harvestAchievements.map((honour) =>
                              Array.from({ length: 4 }).map((_, index) =>
                                honour.step > index + 1 ? (
                                  <div
                                    key={index}
                                    className="relative aspect-square w-full rounded-lg bg-[#7E4E31] border border-[#FFB938] cursor-pointer"
                                    onClick={() => {
                                      const crop = honour.crop;
                                      const cropAchievements =
                                        ACHIEVEMENTS_THRESHOLDS.find(
                                          (achievement) =>
                                            achievement.crop === crop
                                        );
                                      setBadgeModalData({
                                        name: crop,
                                        title:
                                          cropAchievements?.titles[index] ||
                                          `Badge for ${crop} achievement`,
                                        description: `A badge issued to those who demonstrated mastery of the ${crop} by harvesting ${
                                          cropAchievements?.thresholds[index]
                                        } ${
                                          crop.endsWith("y")
                                            ? crop.slice(0, crop.length - 1) +
                                              "ies"
                                            : crop.endsWith("o")
                                            ? crop + "es"
                                            : crop + "s"
                                        }!`,
                                        badgeUrl: `/images/badge/honours/${crop}-${
                                          index + 1
                                        }.png`,
                                        step: index + 1,
                                        type: "honour",
                                      });
                                    }}
                                  >
                                    <Image
                                      src={`/images/badge/honours/${
                                        honour.crop
                                      }-${index + 1}.png`}
                                      alt={`Badge ${honour.crop} ${index + 1}`}
                                      fill
                                      sizes="(max-width: 420px) 100%, 36px"
                                      className="rounded-lg"
                                    />
                                  </div>
                                ) : (
                                  <div
                                    key={index}
                                    className="relative aspect-square w-full bg-[#7E4E31] rounded-lg flex items-center justify-center opacity-50"
                                  >
                                    <Image
                                      src={`/images/profile/question-mark-yellow.png`}
                                      alt="Yellow question mark"
                                      width={14}
                                      height={14}
                                      className="w-[14px] h-[14px] xs:w-[18px] xs:h-[18px]"
                                    />
                                  </div>
                                )
                              )
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </div>

          {badgeModalData && (
            <AchievementBadgeModal
              title={
                badgeModalData.type === "honour"
                  ? `${
                      badgeModalData.name[0].toUpperCase() +
                      badgeModalData.name.slice(1)
                    } #${badgeModalData.step}`
                  : badgeModalData.type === "special"
                  ? "Special Badge"
                  : badgeModalData.type === "collectible"
                  ? "Collectible"
                  : "Gold Crop Badge"
              }
              icon={
                badgeModalData.type !== "special" &&
                badgeModalData.type !== "collectible"
                  ? `/images/crop/${
                      badgeModalData.type === "gold-crop"
                        ? badgeModalData.name.replace(" ", "-")
                        : badgeModalData.name
                    }.png`
                  : "/images/icons/experience.png"
              }
              onCancel={() => setBadgeModalData(null)}
              onShare={() => {
                handleShareAchievement(badgeModalData);
              }}
              shareable={badgeModalData.shareable}
              mintable={badgeModalData.mintable}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-36 h-36 xs:w-52 xs:h-52 rounded-lg my-2 xs:my-4 border-3 xs:border-4 border-[#f2a311] overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer-effect z-10"></div>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={badgeModalData.badgeUrl}
                      alt={badgeModalData.title}
                      layout="fill"
                      className="rounded-sm"
                    />
                  </motion.div>
                </div>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-base xs:text-lg font-bold text-[#f2a311] text-center px-2"
                >
                  {badgeModalData.title}
                </motion.p>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-white/90 text-[10px] xs:text-xs mt-2 xs:mt-4 mb-4 xs:mb-12 text-center px-2"
                >
                  {badgeModalData.description}
                </motion.p>
              </div>
            </AchievementBadgeModal>
          )}
        </div>
      </motion.div>
    </div>
  );
}
