"use client";


import dynamic from "next/dynamic";
const GameWrapper = dynamic(() => import("./components/GameWrapper"), {
  ssr: false,
});

export default function Home() {
  //const [showWelcome, setShowWelcome] = useState(true);

  return (
    <main className="min-h-screen bg-green-800">
      {/* <AnimatePresence>
        {showWelcome && (
          <WelcomeOverlay onStart={() => setShowWelcome(false)} />
        )}
      </AnimatePresence> */}
      {/* {showWelcome ? null : <GameWrapper />} */}
      <GameWrapper />
    </main>
  );
}

