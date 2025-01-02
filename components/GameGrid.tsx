"use client";

import { useGame } from "../context/GameContext";
import GridCell from "./GridCell";

export default function GameGrid() {
  const { state } = useGame();

  // Create a 2D grid from the flat array
  const grid = Array.from({ length: state.gridSize.height }, (_, i) =>
    state.grid.slice(i * state.gridSize.width, (i + 1) * state.gridSize.width)
  );

  return (
    <div className="h-full w-full flex items-center p-4 justify-center overflow-hidden">
      <div
        className="grid gap-1 aspect-square w-full"
        style={{
          gridTemplateColumns: `repeat(${state.gridSize.width}, 1fr)`,
          gridTemplateRows: `repeat(${state.gridSize.height}, 1fr)`,
        }}
      >
        {grid.map((row) =>
          row.map((cell) => <GridCell key={`${cell.fid}-${cell.x}-${cell.y}`} cell={cell} />)
        )}
      </div>
    </div>
  );
}
