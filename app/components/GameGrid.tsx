"use client";

import { useGame } from "../context/GameContext";
import GridCell from "./GridCell";

export default function GameGrid() {
  const { state } = useGame();

  return (
    <div className="h-full w-full flex items-center justify-center p-4 overflow-hidden">
      <div
        className="grid gap-1 aspect-square w-full max-w-[min(90vh,90vw)]"
        style={{
          gridTemplateColumns: `repeat(${state.gridSize.width}, 1fr)`,
          gridTemplateRows: `repeat(${state.gridSize.height}, 1fr)`,
        }}
      >
        {state.grid.map((row) =>
          row.map((cell) => <GridCell key={cell.id} cell={cell} />)
        )}
      </div>
    </div>
  );
}
