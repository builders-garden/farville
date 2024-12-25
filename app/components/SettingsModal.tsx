"use client";

import { motion } from "framer-motion";
import { useAudio } from "../context/AudioContext";
import { useGame } from "../context/GameContext";

export default function SettingsModal() {
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
  const { toggleSettings } = useGame();

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
              onClick={toggleSettings}
              className="w-8 h-8 hover:bg-black/20 rounded-full transition-colors text-white/90 
                       flex items-center justify-center hover:rotate-90 transform duration-200"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Sound Effects Controls */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#6d4c2c] px-4 py-3 rounded-lg border border-[#8B5E3C]/50 shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center bg-[#5c4121] rounded-lg">
                  <motion.span
                    className="text-xl text-white/90"
                    animate={isSoundEnabled ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {isSoundEnabled ? "🔊" : "🔇"}
                  </motion.span>
                </div>
                <div className="flex-1">
                  <p className="text-white/90 font-medium">Sound Effects</p>
                  <p className="text-white/60 text-sm">
                    Adjust or disable game sounds
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={toggleSound}
                  className="min-w-[120px] py-2 px-4 bg-[#8B5E3C] text-white/90 rounded-lg hover:bg-[#9b6a44] 
                           transition-colors text-sm font-medium border border-white/10 flex items-center justify-center gap-2"
                >
                  {isSoundEnabled ? (
                    <>
                      <span>Disable</span>
                      <span>🔇</span>
                    </>
                  ) : (
                    <>
                      <span>Enable</span>
                      <span>🔊</span>
                    </>
                  )}
                </motion.button>
              </div>
              {isSoundEnabled && (
                <div className="space-y-2">
                  <p className="text-white/60 text-sm">
                    Volume: {Math.round(volume * 100)}%
                  </p>
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
              )}
            </motion.div>

            {/* Background Music Controls */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#6d4c2c] px-4 py-3 rounded-lg border border-[#8B5E3C]/50 shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex items-center justify-center bg-[#5c4121] rounded-lg">
                  <motion.span
                    className="text-xl text-white/90"
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
                <div className="flex-1">
                  <p className="text-white/90 font-medium">Background Music</p>
                  <p className="text-white/60 text-sm">
                    Adjust or disable background music
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={toggleMusic}
                  className="min-w-[120px] py-2 px-4 bg-[#8B5E3C] text-white/90 rounded-lg hover:bg-[#9b6a44] 
                           transition-colors text-sm font-medium border border-white/10 flex items-center justify-center gap-2"
                >
                  {isMusicPlaying ? (
                    <>
                      <span>Stop</span>
                      <span>🔇</span>
                    </>
                  ) : (
                    <>
                      <span>Play</span>
                      <span>🎵</span>
                    </>
                  )}
                </motion.button>
              </div>
              {isMusicPlaying && (
                <div className="space-y-2">
                  <p className="text-white/60 text-sm">
                    Volume: {Math.round(musicVolume * 100)}%
                  </p>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                    className="w-full accent-[#FFB938]"
                  />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
