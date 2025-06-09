import { useGame } from "@/context/GameContext";

import { Card, CardContent } from "../ui/card";

export default function MyClan() {
  const { state } = useGame();

  console.log("ClansModal state:", state.clan);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <Card className="bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none w-full max-w-2xl">
        <CardContent className="flex flex-col w-full gap-3 xs:gap-4 p-3 xs:p-4">
          <div className="flex flex-row items-center gap-3 xs:gap-4">
            <div className="relative w-16 h-16 xs:w-20 xs:h-20 shrink-0 rounded-lg bg-[#7B5B30]" />
            <div className="flex flex-col w-full gap-1 xs:gap-2">
              <h3 className="text-white/90 font-bold text-xs xs:text-sm">
                {!state.clan?.clan.name
                  ? "No Name"
                  : state.clan?.clan.name?.length > 17
                  ? state.clan?.clan.name.slice(0, 13) + "..."
                  : state.clan?.clan.name}
              </h3>
              <div className="flex w-full">
                <div className="text-[#f2a311] text-[10px] xs:text-xs">
                  {state.clan?.clan.motto}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
