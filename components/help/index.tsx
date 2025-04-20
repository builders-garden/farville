"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import sdk from "@farcaster/frame-sdk";
import { useNextStep } from "nextstepjs";

export default function HelpModal({ onClose }: { onClose: () => void }) {
  const { startNextStep } = useNextStep();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50">
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
            {/* TUTORIAL */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#6d4c2c] p-3 xs:p-5 rounded-xl border border-[#8B5E3C]/50 shadow-lg"
            >
              <div className="flex items-center gap-3 xs:gap-5">
                <div className="aspect-square w-10 h-10 xs:w-14 xs:h-14 flex justify-center items-center bg-[#5c4121] rounded-xl shadow-inner">
                  <motion.span
                    className="text-2xl xs:text-3xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    📖
                  </motion.span>
                </div>
                <div className="flex-1 min-w-0 xs:min-w-[180px]">
                  <h3 className="text-white/90 text-sm font-semibold mb-0 xs:mb-1">
                    Show Tutorial
                  </h3>
                  <p className="text-white/60 text-[11px] xs:text-xs">
                    Review the game instructions
                  </p>
                </div>
              </div>

              <div className="mt-3 xs:mt-5">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    onClose();
                    startNextStep("mainTour");
                  }}
                  className="w-full h-8 xs:h-10 bg-[#8B5E3C] text-white/90 rounded-lg hover:bg-[#9b6a44] 
                           transition-colors text-[11px] xs:text-sm font-medium border border-white/10 flex items-center justify-center gap-2
                           shadow-md"
                >
                  Show Tutorial 📖
                </motion.button>
              </div>
            </motion.div>

            {/* ANY ISSUES? */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#6d4c2c] p-3 xs:p-5 rounded-xl border border-[#8B5E3C]/50 shadow-lg"
            >
              <div className="flex items-center gap-3 xs:gap-5">
                <div className="w-10 h-10 xs:w-14 xs:h-14 flex justify-center items-center bg-[#5c4121] rounded-xl shadow-inner">
                  <motion.span
                    className="text-2xl xs:text-3xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    🐛
                  </motion.span>
                </div>
                <div className="flex-1 min-w-0 xs:min-w-[180px]">
                  <h3 className="text-white/90 text-sm font-semibold mb-0 xs:mb-1">
                    Any issues?
                  </h3>
                  <p className="text-white/60 text-[11px] xs:text-xs">
                    Send a DM to the developers
                  </p>
                </div>
              </div>

              <div className="mt-3 xs:mt-5">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={async () => {
                    await sdk.actions.openUrl(
                      "https://warpcast.com/~/inbox/create/5698?text=Hey%21%20I%20have%20this%20issue%20on%20Farville%3A"
                    );
                  }}
                  className="w-full h-8 xs:h-10 bg-[#8B5E3C] text-white/90 rounded-lg hover:bg-[#9b6a44] 
                           transition-colors text-[11px] xs:text-sm font-medium border border-white/10 flex items-center justify-center gap-2
                           shadow-md"
                >
                  Report Issue 🐛
                </motion.button>
              </div>
            </motion.div>

            {/* GROUP CHAT */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#6d4c2c] p-3 xs:p-5 rounded-xl border border-[#8B5E3C]/50 shadow-lg"
            >
              <div className="flex items-center gap-3 xs:gap-5">
                <div className="w-10 h-10 xs:w-14 xs:h-14 flex justify-center items-center bg-[#5c4121] rounded-xl shadow-inner">
                  <motion.span
                    className="text-2xl xs:text-3xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    👥
                  </motion.span>
                </div>
                <div className="flex-1 min-w-0 xs:min-w-[180px]">
                  <h3 className="text-white/90  text-sm font-semibold mb-0 xs:mb-1">
                    Join the Chat
                  </h3>
                  <p className="text-white/60 text-[11px] xs:text-xs">
                    Farm together with frens and complete quests
                  </p>
                </div>
              </div>

              <div className="mt-3 xs:mt-5">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={async () => {
                    await sdk.actions.openUrl(
                      "https://warpcast.com/~/group/De4zk72jrlBqSoV-rbR5XA"
                    );
                  }}
                  className="w-full h-8 xs:h-10 bg-[#8B5E3C] text-white/90 rounded-lg hover:bg-[#9b6a44] 
                           transition-colors text-[11px] xs:text-sm font-medium border border-white/10 flex items-center justify-center gap-2
                           shadow-md"
                >
                  Join Chat 👥
                </motion.button>
              </div>
            </motion.div>

            {/* DOCS */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#6d4c2c] p-3 xs:p-5 rounded-xl border border-[#8B5E3C]/50 shadow-lg"
            >
              <div className="flex items-center gap-3 xs:gap-5">
                <div className="w-10 h-10 xs:w-14 xs:h-14 flex justify-center items-center bg-[#5c4121] rounded-xl shadow-inner">
                  <motion.span
                    className="text-2xl xs:text-3xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    👨🏻‍🌾
                  </motion.span>
                </div>
                <div className="flex-1 min-w-0 xs:min-w-[180px]">
                  <h3 className="text-white/90 text-sm font-semibold mb-0 xs:mb-1">
                    Farville Docs
                  </h3>
                  <p className="text-white/60 text-[11px] xs:text-xs">
                    Read the Farville documentation
                  </p>
                </div>
              </div>

              <div className="mt-3 xs:mt-5">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={async () => {
                    await sdk.actions.openUrl(
                      "https://docs.farville.farm/gameplay"
                    );
                  }}
                  className="w-full h-8 xs:h-10 bg-[#8B5E3C] text-white/90 rounded-lg hover:bg-[#9b6a44] 
                           transition-colors text-[11px] xs:text-sm font-medium border border-white/10 flex items-center justify-center gap-2
                           shadow-md"
                >
                  Show Docs 👨🏻‍🌾
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
