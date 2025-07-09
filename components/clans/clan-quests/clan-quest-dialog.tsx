import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useGame } from "@/context/GameContext";
import { useClanOperations } from "@/hooks/game-actions/use-clan-operations";
import { ClanHasQuestWithQuest } from "@/lib/prisma/types";
import { QuestStatus } from "@/lib/types/game";
import Image from "next/image";
import { useState } from "react";

interface ClanQuestDialogProps {
  quest: ClanHasQuestWithQuest;
  refetchClanQuests: () => void;
  refetchClanData: () => void;
  children: React.ReactNode;
}

export default function ClanQuestDialog({
  quest,
  refetchClanQuests,
  refetchClanData,
  children,
}: ClanQuestDialogProps) {
  const { fillClanQuest } = useClanOperations();
  const { state, updateUserItems } = useGame();

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
        onSuccess: (data) => {
          refetchClanQuests();
          if (userItem) {
            updateUserItems([
              {
                itemId: item.id,
                quantity: userItem ? userItem.quantity - depositQuantity : 0,
                item,
              },
            ]);
            userItem.quantity -= depositQuantity; // Update local user item quantity
          }
          setIsFillingQuest(false);
          setDepositQuantity(1); // Reset request quantity after successful fill
          setDialogOpen(false); // Close dialog
          if (data.quest.status === QuestStatus.Completed) {
            refetchClanData(); // Refetch clan data if quest is completed
          }
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
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setDepositQuantity(1);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="w-[360px] bg-[#7E4E31] border-[#8B5E3C]/50 rounded-lg p-4">
        <DialogHeader className="gap-2 mb-2">
          <DialogTitle className="text-white/90">Fill Silo</DialogTitle>
          <DialogDescription className="text-white/80 text-xs flex flex-col gap-2">
            <span>Help your clan reach the goal</span>
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
                  <span className="text-white/80 text-sm">Depositing:</span>
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
                  disabled={
                    isFillingQuest || !userItem || userItem.quantity === 0
                  }
                />

                <p className="text-white/70 text-xs text-right">
                  Missing: {quest.quest.amount - (quest.progress || 0)}
                </p>
              </div>
            </div>

            <div className="flex gap-2 text-xs">
              <button
                onClick={handleFillQuest}
                disabled={
                  isFillingQuest ||
                  (userItem?.quantity || 0) < depositQuantity ||
                  userItem?.quantity === 0
                }
                className="flex-1 bg-[#FFB938] text-[#7E4E31] px-4 py-2 rounded-lg font-bold 
                 hover:bg-[#ffc661] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FFB938]"
              >
                {isFillingQuest ? (
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 border-2 border-t-transparent border-[#7E4E31] rounded-full animate-spin mr-2"></div>
                    Contributing...
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
  );
}
