"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useUserMe } from "@/hooks/use-user-me";
import { Card, CardContent } from "./ui/card";

const sampleGoldCrops = [
  "carrot",
  "tomato",
  "potato",
  "wheat",
  "corn",
  "lettuce",
  "pumpkin",
  "watermelon",
];
// const sampleLegendaryCrops = ["pumpkin", "watermelon"];

export default function ProfileModal({ onClose }: { onClose: () => void }) {
  const { user } = useUserMe();

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
            <div className="flex flex-col items-center gap-12">
              <Card
                className={`bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none`}
              >
                <CardContent className="flex flex-row items-start gap-4 p-4">
                  <div className="relative">
                    <div className="-top-8 -left-4 w-28 h-28 absolute z-50">
                      <Image
                        src="/images/profile/farmer-hat.png"
                        alt="Farmer Hat"
                        width={160}
                        height={160}
                      />
                    </div>
                    <div className="top-8 w-20 h-20 relative rounded-full overflow-hidden [image-rendering:pixelated] border-4 border-[#feb938]">
                      <Image
                        src={user?.avatarUrl || "/images/icons/avatar.png"}
                        alt="Profile"
                        layout="fill"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-white/90 font-bold text-sm">
                      {user?.displayName}
                    </h3>
                    <p className="text-white/70 text-xs">{user?.username}</p>
                    <p className="text-white/50 text-[8px]">
                      Farmer since 2025-02-24
                    </p>
                    <hr className="opacity-30 my-2" />
                    <div className="flex flex-row items-center justify-between w-full">
                      <div className="flex flex-row items-center gap-1 text-white/80">
                        <span className="text-xs">{123}</span>
                        <Image
                          src="/images/special/fire.png"
                          alt="Streak"
                          width={24}
                          height={24}
                        />
                      </div>
                      <div className="flex flex-row items-center gap-1 text-white/80">
                        <p className="text-xs">
                          {user?.xp || 0}
                          <span className="ml-1">XP</span>
                        </p>
                        <Image
                          src="/images/icons/experience.png"
                          alt="XP"
                          width={24}
                          height={24}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none w-full max-w-2xl`}
              >
                <CardContent className="p-4">
                  <h4 className="text-white/90 font-bold mb-3">Achievements</h4>
                  <div className="grid grid-cols-4 gap-4 my-8">
                    {sampleGoldCrops?.map((crop, index) => (
                      <div
                        key={index}
                        className="relative w-16 h-16 [image-rendering:pixelated] mx-auto rounded-xl
                        shadow-lg shadow-yellow-400/50 transition-shadow duration-300
                        bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-300
                        before:absolute before:inset-0 before:border-2 before:border-yellow-400 before:rounded-xl
                        before:animate-[borderMove_2s_linear_infinite]"
                      >
                        <Image
                          src={`/images/crop/${crop}.png`}
                          alt={crop}
                          layout="fill"
                          className="animate-[bounce_2s_ease-in-out_infinite]"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
