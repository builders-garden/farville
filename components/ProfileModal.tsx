"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { useGame } from "@/context/GameContext";
import { Statistic } from "./profile/Statistic";
import { useState } from "react";
import InfoModal from "./InfoModal";
import { HarvestHonour } from "./profile/HarvestHonour";

const sampleGoldCrops = ["carrot", "potato", "corn"];
// const sampleLegendaryCrops = ["pumpkin", "watermelon"];

export default function ProfileModal({ onClose }: { onClose: () => void }) {
  const { state } = useGame();
  const [isWhatIsThisOpen, setIsWhatIsThisOpen] = useState(false);

  const harvestHonours = [
    {
      crop: "carrot",
      title: "Carrot King",
      count: 30,
      nextGoal: 50,
    },
  ];

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
                className="text-white/90 font-bold text-2xl mb-1 flex items-center gap-2"
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
            {/* Profile Information */}
            <div className="flex flex-col items-center gap-8">
              <Card className="bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none w-full max-w-2xl">
                <CardContent className="flex flex-row justify-between w-full gap-4 p-4">
                  <div className="flex flex-col gap-4 w-[45%]">
                    <div className="relative mt-2">
                      <div className="w-20 h-20 relative rounded-full overflow-hidden border-4 border-[#feb938]">
                        <Image
                          src={
                            state.user?.avatarUrl || "/images/icons/avatar.png"
                          }
                          alt="Profile"
                          layout="fill"
                        />
                      </div>
                      <div className="absolute -top-2 right-2 bg-[#5ae88e] rounded-lg flex items-center justify-center z-80 p-1">
                        <span className="text-[#7E4E31] font-bold text-[10px]">
                          Level {state.level}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-white/90 font-bold text-[10px]">
                        {state.user?.displayName.length > 10
                          ? state.user?.displayName.slice(0, 10) + "..."
                          : state.user?.displayName}
                      </h3>
                      <p className="text-white/70 text-[8px]">
                        {state.user?.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-white/80 w-[55%]">
                    <Statistic
                      title="Experience"
                      image="/images/icons/experience.png"
                      value={`${state.user?.xp || 0} XP`}
                    />
                    <Statistic
                      title="Farmer since"
                      image="/images/icons/farmer.png"
                      value={new Date(
                        state.user.createdAt
                      ).toLocaleDateString()}
                    />
                    <Statistic
                      title="Streak"
                      image="/images/special/fire.png"
                      value={`${state.streaks.length.toString()} days`}
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
                      {sampleGoldCrops?.map((crop, index) => (
                        <div
                          key={index}
                          className="relative w-24 h-24 [image-rendering:pixelated] mx-auto rounded-xl
                        shadow-lg shadow-yellow-400/50 transition-shadow duration-300
                        bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-300
                        before:absolute before:inset-0 before:border-2 before:border-yellow-400 before:rounded-xl"
                        >
                          <Image
                            src={`/images/crop/${crop}.png`}
                            alt={crop}
                            layout="fill"
                            className="animate-[pulse_2s_ease-in-out_infinite]"
                            style={{
                              animation: "pulse 4s ease-in-out infinite",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="w-full flex flex-col gap-2">
                <h3 className="text-white/90 text-sm font-bold">
                  Harvest Honours
                </h3>
                {harvestHonours.map((honour, index) => (
                  <HarvestHonour
                    key={index}
                    crop={honour.crop}
                    title={honour.title}
                    count={honour.count}
                    nextGoal={honour.nextGoal}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
