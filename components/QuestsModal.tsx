"use client";

import { motion } from "framer-motion";
import { useFrameContext } from "../context/FrameContext";

export default function QuestsModal({ onClose }: { onClose: () => void }) {
  const { safeAreaInsets } = useFrameContext();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        style={{
          marginTop: safeAreaInsets.top,
          marginBottom: safeAreaInsets.bottom,
          marginLeft: safeAreaInsets.left,
          marginRight: safeAreaInsets.right,
        }}
        className="bg-[#7E4E31] w-full h-full"
      >
        <div className="max-w-4xl mx-auto w-full h-full p-6 flex flex-col">
          <div className="flex-none">
            <div className="flex justify-between items-center mb-6">
              <div>
                <motion.h2
                  className="text-white/90 font-bold text-2xl mb-1 flex items-center gap-2"
                  animate={{ rotate: [0, -3, 3, 0] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 5,
                  }}
                >
                  <span className="text-3xl">📜</span> Quests
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
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-2">{/* Quest content will go here */}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
