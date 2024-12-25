"use client";

import { motion } from "framer-motion";
import { useAudio } from "../context/AudioContext";
import { useGame } from "../context/GameContext";

export default function SettingsModal() {
  const { volume, setVolume, toggleMusic, isMusicPlaying } = useAudio();
  const { toggleSettings } = useGame();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-[var(--wood)] w-full h-full md:w-[480px] md:h-auto md:rounded-xl p-6 relative"
      >
        <h2 className="text-2xl font-bold mb-6">Settings</h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block font-medium">Sound Effects Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-[#FFB938]"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-medium">Background Music</label>
            <button
              onClick={toggleMusic}
              className="w-full px-4 py-2 bg-[#8B5E3C] text-white/90 rounded-xl hover:bg-[#9b6e4c] 
                       shadow-lg border-2 border-[#6d4c2c] text-sm font-medium"
            >
              {isMusicPlaying ? "🔇 Stop Music" : "🎵 Play Music"}
            </button>
          </div>
        </div>

        <button
          onClick={toggleSettings}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/10"
        >
          ✕
        </button>
      </motion.div>
    </motion.div>
  );
}
