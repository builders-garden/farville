import { useFrameContext } from "@/context/FrameContext";
import { motion } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";
import ProfileModal from "../ProfileModal";
import { LeaderboardTab } from "./leaderboard-tab";
import { PowerTab } from "./power-tab";
import { useDonationLeaderboard } from "@/hooks/use-donation-leadeboard";
import { useGame } from "@/context/GameContext";

interface FarmersPowerModalProps {
  onClose: () => void;
}

export default function FarmersPowerModal({ onClose }: FarmersPowerModalProps) {
  const { safeAreaInsets } = useFrameContext();
  const { state, mode } = useGame();
  const [activeTab, setActiveTab] = useState<"power" | "leaderboard">("power");
  const [selectedUserFid, setSelectedUserFid] = useState<number | undefined>(
    undefined
  );
  const { data: leaderboardData, isLoading: isLoadingLeaderboard } =
    useDonationLeaderboard(mode, state.user.fid, 100, true);

  const handleCloseProfile = () => {
    setSelectedUserFid(undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50">
      {selectedUserFid ? (
        <ProfileModal onClose={handleCloseProfile} userFid={selectedUserFid} />
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
            {activeTab === "power" && (
              <PowerTab
                setActiveTab={setActiveTab}
                topDonors={
                  leaderboardData?.leaderboard.slice(0, 5).map((user) => {
                    return {
                      fid: user.fid,
                      username: user.username,
                      avatarUrl: user.avatarUrl || undefined,
                      selectedAvatarUrl: user.selectedAvatarUrl || undefined,
                      mintedOG: user.mintedOG,
                    };
                  }) || []
                }
                isLoadingDonors={isLoadingLeaderboard}
                onSelectUser={setSelectedUserFid}
              />
            )}
            {activeTab === "leaderboard" && (
              <LeaderboardTab
                setActiveTab={setActiveTab}
                onSelectUser={setSelectedUserFid}
                leaderboardData={leaderboardData}
                viewerData={{
                  fid: state.user.fid,
                  username: state.user.username,
                  avatarUrl: state.user.avatarUrl || undefined,
                  selectedAvatarUrl: state.user.selectedAvatarUrl || undefined,
                  mintedOG: state.user.mintedOG,
                }}
              />
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
