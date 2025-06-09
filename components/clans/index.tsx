import { useFrameContext } from "@/context/FrameContext";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import MainClanTabs, { Tab as MainTab } from "./main-tabs";
import MyClan from "./my-clan";

interface ClansModalProps {
  onClose: () => void;
}

export default function ClansModal({ onClose }: ClansModalProps) {
  const { safeAreaInsets } = useFrameContext();

  const [mainActiveTab, setMainActiveTab] = useState<MainTab>("clan");

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
        className="bg-[#7e4e31] w-full h-full flex flex-col overflow-y-auto"
      >
        {/* Header with Stage Info */}
        <div className="flex flex-col items-start justify-between p-3 xs:p-4 mt-2 border-b border-[#8B5c3C] gap-1">
          <div className="flex w-full items-center justify-between">
            <motion.h2
              className="text-white/90 font-bold text-base xs:text-lg mb-1 flex items-center gap-2"
              animate={{ rotate: [0, -3, 3, 0] }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 5,
              }}
            >
              <span className="text-xl">🛡️</span>
              Clans
            </motion.h2>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full 
                    bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-white/70 text-xs">
              Farming together is more fun!
            </p>
          </div>

          <MainClanTabs
            setActiveTab={setMainActiveTab}
            activeTab={mainActiveTab}
          />

          {mainActiveTab === "clan" && <MyClan />}
        </div>
      </motion.div>
    </div>
  );
}
