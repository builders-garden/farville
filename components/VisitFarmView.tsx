"use client";

import { useGame } from "@/context/GameContext";
import { motion } from "framer-motion";
import Image from "next/image";
import { useOtherUserProfile } from "@/hooks/use-other-user-profile";
import GridCell from "./GridCell";
import { useUserGridCells } from "@/hooks/use-grid-cells";
import { BACKGROUND_PATTERN } from "./GameWrapper";
import { useFrameContext } from "@/context/FrameContext";

export default function VisitFarmView() {
  const { visitedUserFid, setActiveOverlay } = useGame();
  const { userData } = useOtherUserProfile(visitedUserFid || undefined);
  const { safeAreaInsets } = useFrameContext();
  const { gridCells: visitedUserGrid, isLoading } = useUserGridCells(
    visitedUserFid || 0
  );

  const handleClose = () => {
    setActiveOverlay(null);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#7E4E31] p-6 w-full min-h-screen"
        >
          <div className="flex flex-col items-center justify-center gap-4 min-h-screen">
            <div className="h-12 w-12 border-4 border-t-[#FFB938] border-[#5B4120] rounded-full animate-spin"></div>
            <span className="text-white/80 text-center">Loading farm...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!visitedUserFid || !visitedUserGrid) {
    return null;
  }

  // Calculate the grid size based on the visited user's grid
  // Add 1 because indices are 0-based
  const width = Math.max(...visitedUserGrid.map((cell) => cell.x));
  const height = Math.max(...visitedUserGrid.map((cell) => cell.y)) + 1;

  // Create a 2D grid representation - similar to how GameGrid does it
  const grid = Array.from({ length: height }, (_, y) =>
    visitedUserGrid.filter((cell) => cell.y === y).sort((a, b) => a.x - b.x)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="w-full min-h-screen"
        style={{
          backgroundColor: "#255F37",
          backgroundImage: BACKGROUND_PATTERN,
          backgroundSize: "160px 160px",
          backgroundPosition: "0 0, 0 80px, 80px -80px, -80px 0px",
          marginTop: safeAreaInsets.top,
          marginBottom: safeAreaInsets.bottom,
          marginLeft: safeAreaInsets.left,
          marginRight: safeAreaInsets.right,
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6 p-4 bg-[#8B5E3C]/40">
            <motion.h2
              className="text-white/90 font-bold text-sm flex items-center gap-2"
              animate={{ rotate: [0, -3, 3, 0] }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 5,
              }}
            >
              <Image
                src="/images/icons/farmer.png"
                alt="Farmer"
                width={36}
                height={36}
              />
              {userData?.user?.displayName ||
                userData?.user?.username ||
                "Farmer"}
              &apos;s Farm
            </motion.h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 hover:bg-black/20 rounded-full transition-colors text-white/90 
                       flex items-center justify-center hover:rotate-90 transform duration-200"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto h-[calc(100vh-100px)] px-4 py-0 pb-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#6D4B2B] [&::-webkit-scrollbar-thumb]:bg-[#8A5E3B]">
            {/* Farm Grid */}
            <div
              data-tutorial="grid"
              className="grid gap-1 aspect-square w-full mt-10"
              style={{
                gridTemplateColumns: `repeat(${width}, 1fr)`,
                gridTemplateRows: `repeat(${height}, 1fr)`,
              }}
            >
              {grid.map((row) =>
                row.map((cell) => (
                  <GridCell
                    key={`${cell.fid}-${cell.x}-${cell.y}`}
                    cell={cell}
                    readOnly
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
