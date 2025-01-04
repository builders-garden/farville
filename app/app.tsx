"use client";

import React from "react";
import dynamic from "next/dynamic";

const Game = dynamic(() => import("./../components/Game"), {
  ssr: false,
});

export default function App() {
  return <Game />;
}
