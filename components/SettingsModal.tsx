"use client";

import { motion } from "framer-motion";
import { useAudio } from "../context/AudioContext";

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const {
    volume,
    setVolume,
    musicVolume,
    setMusicVolume,
    toggleMusic,
    isMusicPlaying,
    isSoundEnabled,
    toggleSound,
  } = useAudio();

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
                <span className="text-3xl">⚙️</span> Settings
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

          <div className="space-y-4">
            {/* Sound Effects Controls */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#6d4c2c] p-5 rounded-xl border border-[#8B5E3C]/50 shadow-lg"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 flex justify-center items-center bg-[#5c4121] rounded-xl shadow-inner">
                  <motion.span
                    className="text-3xl"
                    animate={isSoundEnabled ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {isSoundEnabled ? "🔊" : "🔇"}
                  </motion.span>
                </div>
                <div className="flex-1 min-w-[180px]">
                  <h3 className="text-white/90 text-xl font-semibold mb-1">
                    Sound Effects
                  </h3>
                  <p className="text-white/60 text-sm">
                    Adjust or disable game sounds
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <p className="text-white/60 text-sm font-medium">Volume</p>
                    <p className="text-white/90 text-sm font-semibold">
                      {Math.round(volume * 100)}%
                    </p>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-[#FFB938] h-2 rounded-lg appearance-none bg-[#5c4121]"
                    disabled={!isSoundEnabled}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={toggleSound}
                  className="w-full h-11 bg-[#8B5E3C] text-white/90 rounded-lg hover:bg-[#9b6a44] 
                           transition-colors text-xs font-medium border border-white/10 flex items-center justify-center gap-2
                           shadow-md"
                >
                  {isSoundEnabled ? "Disable  🔇" : "Enable  🔊"}
                </motion.button>
              </div>
            </motion.div>

            {/* Background Music Controls */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#6d4c2c] p-5 rounded-xl border border-[#8B5E3C]/50 shadow-lg"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 flex justify-center items-center bg-[#5c4121] rounded-xl shadow-inner">
                  <motion.span
                    className="text-3xl"
                    animate={
                      isMusicPlaying
                        ? {
                            rotate: [0, -10, 10, -10, 10, 0],
                            scale: [1, 1.1, 1],
                          }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isMusicPlaying ? "🎵" : "🔇"}
                  </motion.span>
                </div>
                <div className="flex-1 min-w-[180px]">
                  <h3 className="text-white/90 text-xl font-semibold mb-1">
                    Background Music
                  </h3>
                  <p className="text-white/60 text-sm">
                    Adjust or disable background music
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <p className="text-white/60 text-sm font-medium">Volume</p>
                    <p className="text-white/90 text-sm font-semibold">
                      {Math.round(musicVolume * 100)}%
                    </p>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                    className="w-full accent-[#FFB938] h-2 rounded-lg appearance-none bg-[#5c4121]"
                    disabled={!isMusicPlaying}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={toggleMusic}
                  className="w-full h-11 bg-[#8B5E3C] text-white/90 rounded-lg hover:bg-[#9b6a44] 
                           transition-colors text-sm font-medium border border-white/10 flex items-center justify-center gap-2
                           shadow-md"
                >
                  {isMusicPlaying
                    ? "Stop 🔇"
                    : "Play 🎵"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
