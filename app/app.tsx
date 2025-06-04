"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import type { OverlayConfig } from "@/context/GameContext";
import { useAccount, useConnect } from "wagmi";
import farcasterFrame from "@farcaster/frame-wagmi-connector";
import { useFrameContext } from "@/context/FrameContext";

export const toasterStyle = {
  padding: "0.375rem 0.75rem",
  borderRadius: "1rem",
  backgroundColor: "rgba(16, 185, 129)",
  color: "#d1fae5",
  fontSize: "0.75rem",
  filter: "drop-shadow(0 4px 4px rgb(0 0 0 / 0.15))",
  marginBottom: "6rem",
  marginLeft: "0.4rem",
  marginRight: "auto",
};

const Game = dynamic(() => import("./../components/Game"), {
  ssr: false,
});

const GameWrapper = dynamic(() => import("./../components/GameWrapper"), {
  ssr: false,
});

export default function App({
  initialOverlay,
}: {
  initialOverlay?: OverlayConfig;
}) {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const { context } = useFrameContext();

  // always connect to wagmi farcaster frame to retrieve wallet address
  useEffect(() => {
    if (!isConnected || !address) {
      if (context) {
        connect({ connector: farcasterFrame() });
      }
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  return (
    <>
      <Game initialOverlay={initialOverlay}>
        <GameWrapper />
      </Game>
    </>
  );
}
