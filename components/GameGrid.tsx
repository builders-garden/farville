"use client";

import { MODE_DEFINITIONS } from "@/lib/modes/constants";
import { Mode } from "@/lib/types/game";
import { useEffect } from "react";
import { useGame } from "../context/GameContext";
import GridCell from "./GridCell";
import SeedMenu from "./SeedMenu";
import { HarvestedGoldCrop } from "./modals/HarvestedGoldCrop";
import MintOgModal from "./modals/MintOgModal";
import { NewAchievementReached } from "./modals/NewAchievementReached";
import { NotActiveModeModal } from "./modals/NotActiveModeModal";
import MintCollectibleModal from "./modals/mint-collectible-modal";
import { WelcomeOnNewModeCard } from "./modes/WelcomeOnNewModeCard";

export default function GameGrid() {
  const {
    mode,
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
    showNotActiveMode,
    setShowNotActiveMode,
  } = useGame();

  // Create a 2D grid from the flat array
  const grid = Array.from({ length: state.gridSize.height }, (_, i) =>
    state.grid.slice(i * state.gridSize.width, (i + 1) * state.gridSize.width)
  );

  useEffect(() => {
    if (
      mode !== Mode.Classic &&
      MODE_DEFINITIONS[mode].startDate! > new Date()
    ) {
      setShowNotActiveMode({
        show: true,
        mode: mode,
      });
    }
  }, [mode, setShowNotActiveMode]);

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

      {showNotActiveMode.show && (
        <NotActiveModeModal
          onClose={() => {
            setShowNotActiveMode({
              show: false,
              mode: Mode.Classic,
            });
          }}
        />
      )}

      {/* Render the grid */}
      {state.userModes.includes(mode) && grid.length > 0 ? (
        <>
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
                <GridCell
                  key={`${cell.fid}-${cell.x}-${cell.y}`}
                  cell={cell}
                />
              ))
            )}
          </div>
          <div className="w-full overflow-x-auto">
            <SeedMenu />
          </div>
        </>
      ) : (
        !showNotActiveMode.show &&
        mode !== Mode.Classic && <WelcomeOnNewModeCard />
      )}
    </div>
  );
}
