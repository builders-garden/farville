import { useGame } from "@/context/GameContext";
import { MODE_DEFINITIONS } from "@/lib/modes/constants";
import { useEffect, useState } from "react";
import { Countdown } from "../Countdown";
import { Card, CardContent } from "../ui/card";

export function WelcomeOnNewModeCard() {
  const { initializeMode, mode, isActionInProgress, refetchState } = useGame();

  const [modeDefinition, setModeDefinition] = useState(MODE_DEFINITIONS[mode]);
  useEffect(() => {
    setModeDefinition(MODE_DEFINITIONS[mode]);
  }, [mode]);

  return (
    <Card
      className="w-full max-w-[400px] p-4 bg-[#7e4e31] xs:mt-8 mt-1
      hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm border-none"
    >
      <CardContent className="p-0 flex flex-col items-center gap-6 relative">
        <p
          className="text-center text-xl font-bold text-white
      animate-fade-in-down"
        >
          {modeDefinition.name}
        </p>
        <div
          className="flex flex-col gap-4 text-center text-sm text-amber-100
      leading-relaxed px-4"
        >
          {modeDefinition.description}
        </div>
        <button
          onClick={() => {
            initializeMode({
              mode,
            });
            refetchState();
          }}
          disabled={isActionInProgress}
          className="group flex items-center gap-2 bg-gradient-to-r from-[#FFB938] to-[#FFA000] text-[#7E4E31] 
      px-6 py-3 rounded-lg font-bold hover:from-[#ffc661] hover:to-[#FFB938] transition-all duration-300 
      transform hover:scale-105 hover:shadow-lg my-8"
        >
          {isActionInProgress ? "Joining..." : "Participate"}
          {/* <span className="group-hover:translate-x-1 transition-transform duration-300">
            →
          </span> */}
        </button>
        <Countdown
          date={new Date(modeDefinition.endDate!)}
          text="Ends in"
          border
        />
      </CardContent>
    </Card>
  );
}
