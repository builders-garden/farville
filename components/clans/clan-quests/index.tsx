import { Card, CardContent } from "../../ui/card";
import { ClanHasQuestWithQuest } from "@/lib/prisma/types";
import ClanQuest from "./clan-quest";

interface ClanQuestsProps {
  quests: ClanHasQuestWithQuest[];
  refetchClanQuests: () => void;
}

export function ClanQuests({ quests, refetchClanQuests }: ClanQuestsProps) {
  if (quests.length === 0) {
    return (
      <Card className={`border-none cursor-pointer bg-[#5B4120]/90`}>
        <CardContent className="flex flex-col justify-center items-center p-3 text-center gap-3">
          <p className="text-md font-bold text-amber-200">👨🏻‍🌾 Feud Quests 👨🏻‍🌾</p>
          <p className="text-xs text-white/80">
            No quests available for your feud at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col w-full gap-4">
      {quests.map((quest) => (
        <ClanQuest
          key={quest.quest.id}
          quest={quest}
          refetchClanQuests={refetchClanQuests}
        />
      ))}
    </div>
  );
}

//  {
//   return (
//     <Card className={`border-none cursor-pointer bg-[#5B4120]/90`}>
//       <CardContent className="flex flex-col justify-between items-center p-3 text-center gap-3">
//         <p className="text-md font-bold text-amber-200">👨🏻‍🌾 Feud Quests 👨🏻‍🌾</p>
//         <p className="text-xs text-white/80">
//           Feud Quests are coming soon! Complete tasks with your feud to earn
//           rewards.
//         </p>
//         <p className="text-xs text-white/80">
//           Will your feud be the first to complete all quests?
//         </p>
//       </CardContent>
//     </Card>
//   );
// }
