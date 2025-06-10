import { Card, CardContent } from "../ui/card";
import { Pencil } from "lucide-react";
import { ClanWithData } from "@/lib/prisma/types";

interface ClanDetailProps {
  clanData: ClanWithData;
}

export function ClanDetail({ clanData }: ClanDetailProps) {
  return (
    <Card className="bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none w-full max-w-2xl">
      <CardContent className="flex flex-col w-full gap-3 xs:gap-4 p-3 xs:p-4">
        <div className="flex flex-row items-start gap-3 xs:gap-4">
          <div className="relative w-12 h-12 xs:w-16 xs:h-16 shrink-0 rounded-lg bg-[#7B5B30]" />
          <div className="flex flex-col w-full gap-1 xs:gap-2">
            <div className="flex justify-between items-start">
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
              <div className="text-[#f2a311] text-[10px]">
                {clanData && clanData.motto.length > 45
                  ? clanData.motto.slice(0, 42) + "..."
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
              className="px-3 py-1 bg-red-700 rounded-lg text-xs text-white hover:bg-red-600 transition-colors"
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
  );
}
