"use client";

import { motion } from "framer-motion";
import { useAudio } from "../context/AudioContext";
import Image from "next/image";

export default function WelcomeOverlay({ onStart }: { onStart: () => void }) {
  const { startBackgroundMusic } = useAudio();

  const handleStart = () => {
    startBackgroundMusic();
    onStart();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#2d5a27] flex flex-col items-center"
    >
      {/* Full screen background image */}
      <div className="relative w-full h-[60vh] max-w-[500px]">
        <Image
          src="/images/welcome.png"
          alt="Welcome to FarVille"
          fill
          priority
          className="object-contain"
        />
      </div>

      {/* Content */}
      <div className="mt-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          className="px-16 py-4 bg-[#FFB938] text-[#7E4E31] rounded-xl text-2xl font-bold
                   hover:bg-[#ffc55c] transition-colors shadow-lg border-2 border-[#7E4E31]"
        >
          Start
        </motion.button>
      </div>
    </motion.div>
  );
}
