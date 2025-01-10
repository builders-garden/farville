"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { OverlayConfig } from "@/context/GameContext";

const Game = dynamic(() => import("./../components/Game"), {
  ssr: false,
});

const GameWrapper = dynamic(() => import("./../components/GameWrapper"), {
  ssr: false,
});

export default function App({
  initialOverlay = { type: "welcome" },
}: {
  initialOverlay?: OverlayConfig;
}) {
  return (
    <Game initialOverlay={initialOverlay}>
      <GameWrapper />
    </Game>
  );
}
