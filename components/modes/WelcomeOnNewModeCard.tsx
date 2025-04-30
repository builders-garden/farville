import { Card, CardContent } from "../ui/card";
import { Clock } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { useEffect, useState } from "react";
import { MODE_DEFINITIONS } from "@/lib/modes/constants";

export function WelcomeOnNewModeCard() {
  const { initializeMode, mode } = useGame();

  const [modeDefinition, setModeDefinition] = useState(MODE_DEFINITIONS[mode]);
  useEffect(() => {
    setModeDefinition(MODE_DEFINITIONS[mode]);
  }, [mode]);

  console.log("modeDefinition", modeDefinition);

  return (
    <Card
      className={`w-full max-w-[400px] p-4 bg-[${MODE_DEFINITIONS[mode].welcomeCardColors.background}]`}
    >
      <CardContent className="p-0 flex flex-col items-center gap-4">
        <p
          className={`text-center text-lg text-[${MODE_DEFINITIONS[mode].welcomeCardColors.title}]`}
        >
          {modeDefinition.name}
        </p>
        <p
          className={`text-center text-sm text-[${MODE_DEFINITIONS[mode].welcomeCardColors.description}]`}
        >
          {modeDefinition.description}
        </p>
        <button
          onClick={() => {
            initializeMode({
              mode,
            });
          }}
          className="flex-1 bg-[#FFB938] text-[#7E4E31] px-4 py-2 rounded-lg font-bold 
                     hover:bg-[#ffc661] transition-colors relative my-8"
        >
          Participate
        </button>
        <div className="bg-[#6d4c2c]/80 rounded-lg p-2 flex items-center justify-between w-full">
          <div className="flex items-center gap-1 text-white/80">
            <Clock
              size={14}
              className="text-[#FFB938]"
            />
            <span className="text-[8px]">Starts in:</span>
          </div>
          <div className="flex gap-1 text-white font-bold">
            {(() => {
              const now = new Date();
              const startAt = new Date(modeDefinition.startDate || 0);
              const nowUTC = Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                now.getUTCHours(),
                now.getUTCMinutes(),
                now.getUTCSeconds()
              );
              const startAtUTC = Date.UTC(
                startAt.getUTCFullYear(),
                startAt.getUTCMonth(),
                startAt.getUTCDate(),
                startAt.getUTCHours(),
                startAt.getUTCMinutes(),
                startAt.getUTCSeconds()
              );
              const diff = startAtUTC - nowUTC;

              const days = Math.floor(diff / (1000 * 60 * 60 * 24));
              const hours = Math.floor(
                (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
              );
              const minutes = Math.floor(
                (diff % (1000 * 60 * 60)) / (1000 * 60)
              );

              return (
                <>
                  <div className="bg-[#5c4121] px-1 py-0.5 rounded text-[9px] min-w-[20px] text-center">
                    {days.toString().padStart(2, "0")}
                    <span className="text-[#FFB938] ml-0.5">d</span>
                  </div>
                  <div className="bg-[#5c4121] px-1 py-0.5 rounded text-[9px] min-w-[20px] text-center">
                    {hours.toString().padStart(2, "0")}
                    <span className="text-[#FFB938] ml-0.5">h</span>
                  </div>
                  <div className="bg-[#5c4121] px-1 py-0.5 rounded text-[9px] min-w-[20px] text-center">
                    {minutes.toString().padStart(2, "0")}
                    <span className="text-[#FFB938] ml-0.5">m</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
