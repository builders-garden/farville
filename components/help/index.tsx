"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import sdk from "@farcaster/frame-sdk";
import { useNextStep } from "nextstepjs";
import { useAudio } from "@/context/AudioContext";

export default function HelpModal({ onClose }: { onClose: () => void }) {
  const { startNextStep } = useNextStep();
  const { toggleMusic, isMusicPlaying, isSoundEnabled, toggleSound } =
    useAudio();
  return (
    <div className="fixed inset-0 max-w-md mx-auto bg-black/50 flex items-start z-50">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-[#7E4E31] w-full min-h-screen"
      >
        <div className="max-w-4xl mx-auto p-4 mt-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <motion.h2
                className="text-white/90 font-bold text-base xs:text-xl mb-1 flex items-center gap-2"
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
              >
                <Image
                  src="/images/icons/help.png"
                  alt="Help"
                  width={20}
                  height={20}
                  className="w-5 h-5 xs:w-6 xs:h-6"
                />
                Help
              </motion.h2>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 xs:w-8 xs:h-8 hover:bg-black/20 rounded-full transition-colors text-white/90 
                       flex items-center justify-center hover:rotate-90 transform duration-200"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 xs:space-y-4 overflow-y-auto h-[calc(100vh-80px)] xs:h-[calc(100vh-100px)] pb-4 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#6D4B2B] [&::-webkit-scrollbar-thumb]:bg-[#8A5E3B]">
            {/* Section Components */}
            <HelpSection
              icon="📖"
              title="Show Tutorial"
              description="Review the game instructions"
              onClick={() => {
                onClose();
                startNextStep("mainTour");
              }}
            />

            <HelpSection
              icon="🐛"
              title="Any issues?"
              description="Send a DM to the developers"
              onClick={() =>
                sdk.actions.openUrl(
                  "https://farcaster.xyz/~/inbox/create/262800"
                )
              }
            />

            <HelpSection
              icon="👥"
              title="Join the Chat"
              description="Farm together with frens and complete quests"
              onClick={() =>
                sdk.actions.openUrl(
                  "https://farcaster.xyz/~/group/De4zk72jrlBqSoV-rbR5XA"
                )
              }
            />

            <HelpSection
              icon="👨🏻‍🌾"
              title="Farville Docs"
              description="Read the Farville documentation"
              onClick={() =>
                sdk.actions.openUrl("https://docs.farville.farm/gameplay")
              }
            />

            <HelpSection
              icon={isSoundEnabled ? "🔊" : "🔇"}
              title="Sound Effects"
              description="Enable or disable game sounds"
              onClick={toggleSound}
              animate={isSoundEnabled}
            />

            <HelpSection
              icon={isMusicPlaying ? "🎵" : "🔇"}
              title="Background Music"
              description="Enable or disable background music"
              onClick={toggleMusic}
              animate={isMusicPlaying}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface HelpSectionProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  animate?: boolean;
}

function HelpSection({
  icon,
  title,
  description,
  onClick,
  animate,
}: HelpSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-[#6d4c2c] p-3 xs:p-4 rounded-xl border border-[#8B5E3C]/50 shadow-lg cursor-pointer 
                hover:bg-[#7d593a] transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 xs:w-12 xs:h-12 flex justify-center items-center bg-[#5c4121] rounded-xl shadow-inner">
          <motion.span
            className="text-xl xs:text-2xl"
            animate={animate ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {icon}
          </motion.span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white/90 text-sm xs:text-base font-semibold">
            {title}
          </h3>
          <p className="text-white/60 text-[10px] xs:text-xs">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
