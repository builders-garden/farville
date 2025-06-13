import { Card, CardContent } from "../ui/card";

export function ClanSeason() {
  return (
    <div className="flex flex-col items-center justify-start h-full">
      <Card className={`border-none cursor-pointer bg-[#5B4120]/90`}>
        <CardContent className="flex flex-col justify-between items-center p-3 text-center gap-3">
          <p className="text-lg font-bold text-amber-200">🌟 Feud Seasons 🌟</p>
          <p className="text-sm text-white/80">Seasons are coming soon!</p>
          <p className="text-sm text-white/80">
            Which feud will dominate the first Farville season?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
