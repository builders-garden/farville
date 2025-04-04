"use client";

import { useGame } from "../context/GameContext";
import GridCell from "./GridCell";
import { HarvestedGoldCrop } from "./modals/HarvestedGoldCrop";
import { NewAchievementReached } from "./modals/NewAchievementReached";
import SeedMenu from "./SeedMenu";
import MintOgModal from "./modals/MintOgModal";

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

      {/* Render the grid */}
      <div
        className="grid gap-1 aspect-square w-full"
        id="fields-grid"
        style={{
          gridTemplateColumns: `repeat(${state.gridSize.width}, 1fr)`,
          gridTemplateRows: `repeat(${state.gridSize.height}, 1fr)`,
        }}
      >
        {grid.map((row) =>
          row.map((cell) => (
            <GridCell key={`${cell.fid}-${cell.x}-${cell.y}`} cell={cell} />
          ))
        )}
      </div>
      <div className="w-full overflow-x-auto">
        <SeedMenu />
      </div>
    </div>
  );
}
