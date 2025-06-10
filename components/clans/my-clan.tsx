import { useGame } from "@/context/GameContext";

import { Card, CardContent } from "../ui/card";
import { Pencil } from "lucide-react";
import MyClanTabs, { Tab } from "./my-clan-tabs";
import { useState } from "react";
import { useClan } from "@/hooks/use-clan";
import ClanMembers from "./clan-members";

export default function MyClan() {
  const { state } = useGame();

  const [activeTab, setActiveTab] = useState<Tab>("members");

  console.log("ClansModal state:", state.clan);

  const { clanData, isLoading } = useClan(state.clan?.clanId);

  console.log("Clan Data:", clanData);

  return (
    <div className="flex flex-col items-center justify-center w-full pb-8 gap-2">
      <Card className="bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none w-full max-w-2xl">
        <CardContent className="flex flex-col w-full gap-3 xs:gap-4 p-3 xs:p-4">
          <div className="flex flex-row items-center gap-3 xs:gap-4">
            <div className="relative w-16 h-16 xs:w-20 xs:h-20 shrink-0 rounded-lg bg-[#7B5B30]" />
            <div className="flex flex-col w-full gap-1 xs:gap-2">
              <div className="flex justify-between items-center">
                <h3 className="text-white/90 font-bold text-xs xs:text-sm">
                  {clanData && clanData.name.length > 17
                    ? clanData.name.slice(0, 14) + "..."
                    : clanData?.name}
                </h3>
                <button
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => {
                    /* Add your edit function here */
                  }}
                >
                  <Pencil className="text-white/80 hover:text-white w-4 h-4" />
                </button>
              </div>
              <div className="flex w-full">
                <div className="text-[#f2a311] text-[10px] xs:text-xs">
                  {clanData && clanData.motto.length > 40
                    ? clanData.motto.slice(0, 37) + "..."
                    : clanData?.motto}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full gap-2">
            <div className="flex flex-row justify-between text-white/70">
              <div className="flex flex-col gap-2 text-xs font-semibold">
                <span>Required Level: 2</span>
                <span>1.34M XP</span>
              </div>
              <button
                className="px-3 py-1 bg-[#7B5B30] rounded-lg text-xs text-white hover:bg-[#8B5C3C] transition-colors"
                onClick={() => {
                  /* Add your join clan function here */
                }}
              >
                Leave
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <MyClanTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "members" && !isLoading && clanData && (
        <ClanMembers members={clanData.members} />
      )}
    </div>
  );
}
