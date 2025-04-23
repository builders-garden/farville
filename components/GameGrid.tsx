"use client";

import { useGame } from "../context/GameContext";
import GridCell from "./GridCell";
import { HarvestedGoldCrop } from "./modals/HarvestedGoldCrop";
import { NewAchievementReached } from "./modals/NewAchievementReached";
import SeedMenu from "./SeedMenu";
import MintOgModal from "./modals/MintOgModal";
import MintCollectibleModal from "./modals/mint-collectible-modal";
import { Card, CardContent } from "./ui/card";
import { Clock } from "lucide-react";
import { Mode } from "@/lib/types/game";

export default function GameGrid() {
  const {
    state,
    showHarvestedNewGoldCrops,
    gridBulkResult,
    setShowHarvestedNewGoldCrops,
    showAchievedNewBadges,
    setShowAchievedNewBadges,
    showMintOGBadge,
    setShowMintOGBadge,
    showMintCollectible,
    setShowMintCollectible,
    initializeMode,
  } = useGame();

  // Create a 2D grid from the flat array
  const grid = Array.from({ length: state.gridSize.height }, (_, i) =>
    state.grid.slice(i * state.gridSize.width, (i + 1) * state.gridSize.width)
  );

  return (
    <div className="flex flex-col h-full w-full items-start p-4 justify-start overflow-hidden gap-2 xs:gap-8">
      {/* overlay to display the harvested gold crops */}
      {showHarvestedNewGoldCrops && gridBulkResult?.rewards?.goldCrops && (
        <HarvestedGoldCrop
          goldCrops={gridBulkResult.rewards.goldCrops}
          onClose={() => setShowHarvestedNewGoldCrops(false)}
        />
      )}

      {/* overlay to display the new achievements */}
      {showAchievedNewBadges && gridBulkResult?.rewards?.newBadges && (
        <NewAchievementReached
          achievements={gridBulkResult.rewards.newBadges}
          onClose={() => setShowAchievedNewBadges(false)}
        />
      )}

      {showMintOGBadge && (
        <MintOgModal onCancel={() => setShowMintOGBadge(false)} />
      )}

      {showMintCollectible && (
        <MintCollectibleModal onCancel={() => setShowMintCollectible(false)} />
      )}

      {/* Render the grid */}
      <div
        className="grid gap-1 aspect-square w-full"
        id="fields-grid"
        style={{
          gridTemplateColumns: `repeat(${state.gridSize.width}, 1fr)`,
          gridTemplateRows: `repeat(${state.gridSize.height}, 1fr)`,
        }}
      >
        {grid.length > 0 ? (
          grid.map((row) =>
            row.map((cell) => (
              <GridCell key={`${cell.fid}-${cell.x}-${cell.y}`} cell={cell} />
            ))
          )
        ) : (
          <div className="flex items-center justify-center col-span-full">
            <Card className="w-full max-w-[400px] p-4">
              <CardContent className="p-0 flex flex-col items-center gap-4">
                <p className="text-center text-lg text-purple-500">
                  Farcon Mode
                </p>
                <p className="text-center text-sm text-gray-500">
                  This is a special mode that allows you to play and compete
                  against the other Farcon attendees.
                </p>
                <button
                  onClick={() => {
                    initializeMode({
                      mode: Mode.Farcon,
                    });
                  }}
                  className="flex-1 bg-[#FFB938] text-[#7E4E31] px-4 py-2 rounded-lg font-bold 
                     hover:bg-[#ffc661] transition-colors relative my-8"
                >
                  Participate
                </button>
                <div className="bg-[#6d4c2c]/80 rounded-lg p-2 flex items-center justify-between w-full">
                  <div className="flex items-center gap-1 text-white/80">
                    <Clock size={14} className="text-[#FFB938]" />
                    <span className="text-[8px]">Starts in:</span>
                  </div>
                  <div className="flex gap-1 text-white font-bold">
                    <div className="bg-[#5c4121] px-1 py-0.5 rounded text-[9px] min-w-[20px] text-center">
                      12
                      <span className="text-[#FFB938] ml-0.5">d</span>
                    </div>
                    <div className="bg-[#5c4121] px-1 py-0.5 rounded text-[9px] min-w-[20px] text-center">
                      13
                      <span className="text-[#FFB938] ml-0.5">h</span>
                    </div>
                    <div className="bg-[#5c4121] px-1 py-0.5 rounded text-[9px] min-w-[20px] text-center">
                      14
                      <span className="text-[#FFB938] ml-0.5">m</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <div className="w-full overflow-x-auto">
        <SeedMenu />
      </div>
    </div>
  );
}
