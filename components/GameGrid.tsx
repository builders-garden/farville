"use client";

import { useGame } from "../context/GameContext";
import GridCell from "./GridCell";
import { HarvestedGoldCrop } from "./modals/HarvestedGoldCrop";
import SeedMenu from "./SeedMenu";

export default function GameGrid() {
  const {
    state,
    showHarvestedNewGoldCrops,
    gridBulkResult,
    setShowHarvestedNewGoldCrops,
  } = useGame();

  // Create a 2D grid from the flat array
  const grid = Array.from({ length: state.gridSize.height }, (_, i) =>
    state.grid.slice(i * state.gridSize.width, (i + 1) * state.gridSize.width)
  );

  return (
    <div className="flex flex-col h-full w-full items-start p-4 justify-start overflow-hidden gap-8">
      {/* create here an overlay to display the harvested gold crops */}
      {showHarvestedNewGoldCrops && gridBulkResult?.rewards?.goldCrops && (
        <HarvestedGoldCrop
          goldCrops={gridBulkResult.rewards.goldCrops}
          onClose={() => setShowHarvestedNewGoldCrops(false)}
        />
      )}

      {/* Render the grid */}
      <div
        data-tutorial="grid"
        className="grid gap-1 aspect-square w-full"
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
