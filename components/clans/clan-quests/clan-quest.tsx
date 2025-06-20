import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useGame } from "@/context/GameContext";
import { useClanOperations } from "@/hooks/game-actions/use-clan-operations";
import { ClanHasQuestWithQuest } from "@/lib/prisma/types";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

interface ClanQuestProps {
  quest: ClanHasQuestWithQuest;
  refetchClanQuests: () => void;
}

const renderClanQuestProgress = (quest: ClanHasQuestWithQuest) => {
  const progress = quest.progress || 0;
  const target = quest.quest.amount || 1;

  return (
    <div className="relative">
      <Progress
        value={(progress / target) * 100}
        className="h-4 my-2 bg-[#5c4121]"
      />
      <div className="absolute w-full text-center text-xs text-white/80 top-1/2 -translate-y-1/2">
        {progress}/{target}
      </div>
    </div>
  );
};

const clanQuestDescription = (quest: ClanHasQuestWithQuest["quest"]) => {
  let start = "";
  let end = "";
  switch (quest.category) {
    case "harvest":
      start = "Harvest";
      end = "crops";
      break;
    case "plant":
      start = "Plant";
      end = "seeds";
      break;
    case "fertilize":
      start = "Fertilize";
      end = "crops";
      break;
    case "donate":
      start = "Fill";
      end = "items";
      break;
    case "sell":
      start = "Sell";
      end = "crops";
      break;
    case "receive":
      start = "Receive";
      end = "items";
      break;
    default:
      start = "Complete";
      end = "the quest";
      break;
  }
  if (quest.amount && quest.itemId) {
    end = quest.item?.name.toLowerCase() || end;
  }
  return `${start} ${quest.amount} ${end}`;
};

export default function ClanQuest({
  quest,
  refetchClanQuests,
}: ClanQuestProps) {
  const { fillClanQuest } = useClanOperations();
  const { state } = useGame();

  const [depositQuantity, setDepositQuantity] = useState(1);
  const [isFillingQuest, setIsFillingQuest] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const item = quest.quest.item;
  const userItem = state.inventory.find(
    (i) => i.itemId === item.id && i.mode === "classic"
  );
  const maxFillableAmount = Math.min(
    userItem?.quantity || 0,
    quest.quest.amount - (quest.progress || 0)
  );

  const handleFillQuest = () => {
    setIsFillingQuest(true);
    fillClanQuest(
      {
        clanId: quest.clanId,
        questId: quest.questId,
        amount: depositQuantity,
      },
      {
        onSuccess: () => {
          refetchClanQuests();
          setIsFillingQuest(false);
          setDepositQuantity(1); // Reset request quantity after successful fill
          setDialogOpen(false); // Close dialog
        },
        onError: (error) => {
          refetchClanQuests();
          console.error("Error filling quest:", error);
          setIsFillingQuest(false);
        },
      }
    );
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <motion.div
          key={quest.quest.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#6d4c2c] px-4 py-3 rounded-lg flex flex-col gap-2 border border-[#8B5E3C]/50 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <motion.div
                className="text-2xl"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {quest.quest.category === "donate" && (
                  <Image
                    src={`/images${quest.quest.item?.icon}` || "🧑‍🌾"}
                    width={40}
                    height={40}
                    alt={`Quest icon for ${quest.quest.category}`}
                  />
                )}
              </motion.div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-white/90 font-medium">
                  {quest.quest.category === "donate" && "Fill the Crate"}
                </h3>
              </div>
              <p className="text-white/60 text-xs">
                {clanQuestDescription(quest.quest)}
              </p>
              <div className="flex items-center justify-between text-xs mt-2 gap-2">
                <span className="text-white/60 flex items-center">
                  <span>XP</span>
                  <span className="text-yellow-400 font-medium flex items-center">
                    <span className="text-sm mb-1 ml-1 mr-0.5">⭐</span>
                    {quest.quest.xp}
                  </span>
                </span>
                <DialogTrigger asChild>
                  <button
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow transition-colors duration-200 w-fit"
                    onClick={() => setDialogOpen(true)}
                  >
                    Fill
                  </button>
                </DialogTrigger>
              </div>
            </div>
          </div>
          {renderClanQuestProgress(quest)}
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-xs">
              {quest.quest.endAt && (
                <span className="ml-auto">
                  Ends in:{" "}
                  {(() => {
                    const endTime = new Date(quest.quest.endAt).getTime();
                    const timeRemaining = endTime - new Date().getTime();
                    if (timeRemaining <= 0) return "";

                    const SECOND = 1000;
                    const MINUTE = SECOND * 60;
                    const HOUR = MINUTE * 60;
                    const DAY = HOUR * 24;

                    const days = Math.floor(timeRemaining / DAY);
                    const hours = Math.floor((timeRemaining % DAY) / HOUR);
                    const minutes = Math.floor((timeRemaining % HOUR) / MINUTE);
                    const seconds = Math.floor(
                      (timeRemaining % MINUTE) / SECOND
                    );

                    const parts = [];
                    if (days > 0) parts.push(`${days}d`);
                    if (hours > 0) parts.push(`${hours}h`);
                    if (minutes > 0) parts.push(`${minutes}m`);
                    else parts.push(`${seconds}s`);

                    return parts.join(" ");
                  })()}
                </span>
              )}
            </span>
          </div>
        </motion.div>

        <DialogContent className="w-[360px] bg-[#7E4E31] border-[#8B5E3C]/50 rounded-lg p-4">
          <DialogHeader className="gap-2 mb-2">
            <DialogTitle className="text-white/90">Fill the Crate</DialogTitle>
            <DialogDescription className="text-white/80 text-xs flex flex-col gap-2">
              <span>Donate some crops to help filling the crate</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col w-full my-2 p-2">
            <div className="flex items-center gap-3 mb-4">
              {item.icon.startsWith("/") ? (
                <Image
                  src={`/images${item.icon}`}
                  alt={item.name}
                  width={36}
                  height={36}
                  className="object-contain"
                />
              ) : (
                <span className="text-4xl">{item.icon}</span>
              )}
              <div>
                <h3 className="text-white/90 font-bold text-md">{item.name}</h3>
                <p className="text-white/70 text-sm">
                  Required Level: {item.requiredLevel}
                </p>
              </div>
            </div>

            <p className="text-white/80 mb-4">{item.description}</p>

            <div className="flex flex-col gap-3">
              <div className="bg-[#6d4c2c] rounded-lg p-4 mb-2">
                <div className="flex justify-between items-center mb-3">
                  <div className="w-full flex justify-between items-center gap-2">
                    <span className="text-white/80 text-sm">In inventory:</span>
                    <span className="text-white font-bold text-md bg-[#5A4129] px-2 py-0.5 rounded">
                      {userItem?.quantity || 0}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm">
                      Depositing crops:
                    </span>
                    <span className="text-[#FFB938] font-bold text-lg">
                      {depositQuantity}
                    </span>
                  </div>

                  <Slider
                    variant="yellow-brown"
                    value={[depositQuantity]}
                    min={1}
                    max={maxFillableAmount}
                    step={1}
                    onValueChange={(value) => setDepositQuantity(value[0])}
                    className="cursor-pointer"
                    disabled={isFillingQuest}
                  />

                  <p className="text-white/70 text-xs text-right">
                    Missing: {quest.quest.amount - (quest.progress || 0)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 text-xs">
                <button
                  onClick={handleFillQuest}
                  disabled={isFillingQuest}
                  className="flex-1 bg-[#FFB938] text-[#7E4E31] px-4 py-2 rounded-lg font-bold 
                   hover:bg-[#ffc661] transition-colors"
                >
                  {isFillingQuest ? (
                    <div className="flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-t-transparent border-[#7E4E31] rounded-full animate-spin mr-2"></div>
                      Filling...
                    </div>
                  ) : (
                    "Fill"
                  )}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
