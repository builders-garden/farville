import { useFrameContext } from "@/context/FrameContext";
import { motion } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";
import ProfileModal from "../ProfileModal";
import { LeaderboardTab } from "./leaderboard-tab";
import { PowerTab } from "./power-tab";

interface FarmersPowerModalProps {
  onClose: () => void;
}

export default function FarmersPowerModal({ onClose }: FarmersPowerModalProps) {
  const { safeAreaInsets } = useFrameContext();
  const [activeTab, setActiveTab] = useState<"power" | "leaderboard">("power");
  const [selectedUserFid, setSelectedUserFid] = useState<number | undefined>(
    undefined
  );

  const handleCloseProfile = () => {
    setSelectedUserFid(undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50">
      {selectedUserFid ? (
        <ProfileModal
          onClose={handleCloseProfile}
          userFid={selectedUserFid}
        />
      ) : (
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
                <span className="text-xl">⚡</span>
                Farmers Power
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
                Let&apos;s play Farville faster!
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center gap-6 max-w-md mx-auto w-full px-4 pb-8 overflow-y-auto no-scrollbar pt-4">
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-1 xs:gap-2">
              {[
                { id: "power", icon: "⚡️", label: "Power" },
                { id: "leaderboard", icon: "🏆", label: "Leaderboard" },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() =>
                    setActiveTab(tab.id as "power" | "leaderboard")
                  }
                  className={`px-2 xs:px-3 py-1 xs:py-1 rounded-lg flex items-center justify-center gap-1 xs:gap-1.5 transition-all duration-200
                    ${
                      activeTab === tab.id
                        ? "bg-[#6d4c2c] text-white scale-105 shadow-lg"
                        : "text-white/70 hover:bg-[#6d4c2c]/50"
                    }`}
                  whileHover={{ scale: activeTab === tab.id ? 1.05 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.span
                    animate={{
                      rotate: activeTab === tab.id ? [0, -5, 5, 0] : 0,
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                    className="mb-1"
                  >
                    {tab.icon}
                  </motion.span>
                  <span className="text-[10px] xs:text-xs font-medium">
                    {tab.label}
                  </span>
                </motion.button>
              ))}
            </div>

            {activeTab === "power" && <PowerTab />}
            {activeTab === "leaderboard" && (
              <LeaderboardTab onSelectUser={setSelectedUserFid} />
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
