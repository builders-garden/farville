import { Card, CardContent } from "../ui/card";

export function ClanQuests() {
  return (
    <Card className={`border-none cursor-pointer bg-[#5B4120]/90`}>
      <CardContent className="flex flex-col justify-between items-center p-3 text-center gap-3">
        <p className="text-md font-bold text-amber-200">👨🏻‍🌾 Feud Quests 👨🏻‍🌾</p>
        <p className="text-xs text-white/80">
          Feud Quests are coming soon! Complete tasks with your feud to earn
          rewards.
        </p>
        <p className="text-xs text-white/80">
          Will your feud be the first to complete all quests?
        </p>
      </CardContent>
    </Card>
  );
}
