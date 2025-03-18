"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { useGame } from "@/context/GameContext";
import { Statistic } from "./profile/Statistic";
import { useEffect, useState } from "react";
import InfoModal from "./modals/InfoModal";
import { HarvestHonour } from "./profile/HarvestHonour";
import ChooseGlowingCrop from "@/components/modals/ChooseGlowingCrop";
import { Plus } from "lucide-react";
import { UserItem } from "@/hooks/use-user-items";
import { calculateHarvestAchievements } from "@/lib/utils";
import { LeaderboardUserAvatar } from "./LeaderboardUserAvatar";
import sdk from "@farcaster/frame-sdk";
import { useOtherUserProfile } from "@/hooks/use-other-user-profile";

export default function ProfileModal({
  onClose,
  userFid,
}: {
  onClose: () => void;
  userFid?: number;
}) {
  const { state } = useGame();
  const [isWhatIsThisOpen, setIsWhatIsThisOpen] = useState(false);
  const [chooseGlowingCropOpen, setChooseGlowingCropOpen] = useState(false);
  const [selectedCrops, setSelectedCrops] = useState<UserItem[]>([]);
  const [cropIndex, setCropIndex] = useState<number | undefined>(undefined);

  const { userData, isLoading } = useOtherUserProfile(userFid);

  const isCurrentUser = !userFid || userFid === state.user.fid;
  const user = isCurrentUser ? state.user : userData?.user;

  const harvestHonours = calculateHarvestAchievements(
    isCurrentUser
      ? state.harvestedCropsSummary
      : userData?.harvestedCropsSummary || []
  );

  const onChooseCrop = (crop: UserItem) => {
    // Only allow choosing crops for current user
    if (isCurrentUser && cropIndex !== undefined) {
      const newCrops = [...selectedCrops];
      newCrops[cropIndex] = crop;
      setSelectedCrops(newCrops);
    }
  };

  useEffect(() => {
    if (isCurrentUser) {
      setSelectedCrops(state.specialCrops || []);
    } else if (userData?.specialCrops) {
      setSelectedCrops(userData.specialCrops);
    }
  }, [state.specialCrops, userData?.specialCrops, isCurrentUser]);

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
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <motion.h2
                className={`text-white/90 font-bold text-2xl mb-1 flex items-center gap-2`}
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
              >
                <Image
                  src="/images/icons/farmer.png"
                  alt="Profile"
                  width={36}
                  height={36}
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

          <div className="space-y-4 overflow-y-auto h-[calc(100vh-100px)] pb-4 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#6D4B2B] [&::-webkit-scrollbar-thumb]:bg-[#8A5E3B]">
            <div className="flex flex-col items-center gap-8">
              {/* Profile Information */}
              <Card
                className={`bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none w-full max-w-2xl ${
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
                <CardContent className="flex flex-row justify-between w-full gap-4 p-4">
                  <div className="flex flex-col gap-4 w-[45%]">
                    <div className="relative mt-2">
                      <div className="relative flex-none w-fit">
                        <LeaderboardUserAvatar
                          pfpUrl={user?.avatarUrl || ""}
                          username={user?.username}
                          isOgUser={user?.mintedOG}
                          size={{
                            width: 20,
                            height: 20,
                          }}
                          borderSize={4}
                        />
                      </div>
                      <div className="absolute -top-2 right-2 bg-[#5ae88e] rounded-lg flex items-center justify-center z-80 p-1">
                        <span className="text-[#7E4E31] font-bold text-[10px]">
                          Level{" "}
                          {isCurrentUser ? state.level : userData?.level || 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-white/90 font-bold text-[10px]">
                        {!user?.displayName
                          ? "Farmer"
                          : user?.displayName?.length > 10
                          ? user?.displayName.slice(0, 10) + "..."
                          : user?.displayName}
                      </h3>
                      <p className="text-white/70 text-[8px]">
                        {user?.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-white/80 w-[55%]">
                    <Statistic
                      title="Experience"
                      image="/images/icons/experience.png"
                      value={`${user?.xp || 0} XP`}
                    />
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
                </CardContent>
              </Card>

              {/* Glowing crops section */}
              <div className="w-full flex flex-col gap-2">
                <div className="flex flex-row items-center justify-between">
                  <h3 className="text-white/90 text-sm font-bold">
                    Glowing crops
                  </h3>
                  <button
                    className="text-[8px] text-white/70 hover:text-white/90 transition-colors px-2 py-1 rounded-md 
                    border-2 border-[#8A5E3B] hover:border-[#feb938]"
                    onClick={() => setIsWhatIsThisOpen(true)}
                  >
                    What&apos;s this?
                  </button>
                  {isWhatIsThisOpen && (
                    <InfoModal
                      title="Glowing crops"
                      onCancel={() => setIsWhatIsThisOpen(false)}
                      options={{
                        titleColor: "text-[#feb938]",
                      }}
                    >
                      <div className="flex flex-col gap-4 my-4 text-white/90 text-[10px]">
                        <p>
                          Here you can showcase up to 3 of your most prized
                          crops.
                        </p>
                        <p>
                          These are special crops (gold or legendary) that other
                          farmers can see when they visit your profile.
                        </p>
                        <p>
                          <strong>Tip:</strong> Select your rarest and most
                          valuable crops to display your farming achievements to
                          the community!
                        </p>
                      </div>
                    </InfoModal>
                  )}
                </div>
                <Card
                  className={`bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none w-full max-w-2xl`}
                >
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-4">
                      {selectedCrops?.slice(0, 3).map((crop, index) => (
                        <div
                          key={index}
                          className={`relative w-24 h-24 mx-auto rounded-lg bg-[#7E4E31] ${
                            isCurrentUser ? "cursor-pointer" : ""
                          }`}
                          onClick={() => {
                            if (isCurrentUser) {
                              setChooseGlowingCropOpen(true);
                              setCropIndex(index);
                            }
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-16 h-16">
                              <Image
                                src={`/images/crop/${crop.item.slug}-glowing.png`}
                                alt={crop.item.name}
                                layout="fill"
                                className="animate-[pulse_2s_ease-in-out_infinite]"
                                style={{
                                  animation: "pulse 3s ease-in-out infinite",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {isCurrentUser &&
                        selectedCrops.length < 3 &&
                        Array.from({ length: 3 - selectedCrops.length }).map(
                          (_, index) => (
                            <div
                              key={index}
                              className="w-24 h-24 mx-auto rounded-lg bg-[#7E4E31] flex items-center justify-center cursor-pointer"
                              onClick={() => {
                                setChooseGlowingCropOpen(true);
                                setCropIndex(selectedCrops.length + index);
                              }}
                            >
                              <div className="text-white/70 text-[10px]">
                                <Plus size={24} />
                              </div>
                            </div>
                          )
                        )}

                      {/* Empty slots for other users if they don't have 3 crops */}
                      {!isCurrentUser &&
                        selectedCrops.length < 3 &&
                        Array.from({ length: 3 - selectedCrops.length }).map(
                          (_, index) => (
                            <div
                              key={index}
                              className="w-24 h-24 mx-auto rounded-lg bg-[#7E4E31] flex items-center justify-center opacity-50"
                            >
                              <div className="text-white/40 text-xs">Empty</div>
                            </div>
                          )
                        )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Harvest Honours section */}
              <div className="w-full flex flex-col gap-2">
                <h3 className="text-white/90 text-sm font-bold">
                  Harvest Honours
                </h3>
                {harvestHonours.map((honour, index) => (
                  <HarvestHonour
                    key={index}
                    crop={honour.crop}
                    title={honour.title}
                    totalCount={honour.totalCount}
                    currentCount={honour.currentCount}
                    currentGoal={honour.currentGoal}
                    step={honour.step}
                  />
                ))}
              </div>
            </div>
          </div>

          {isCurrentUser && chooseGlowingCropOpen && (
            <ChooseGlowingCrop
              onChooseCrop={onChooseCrop}
              specialCrops={state.specialCrops}
              onCancel={() => setChooseGlowingCropOpen(false)}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
