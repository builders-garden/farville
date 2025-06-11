import { Card, CardContent } from "../ui/card";
import { Pencil, Loader2 } from "lucide-react";
import { ClanWithData } from "@/lib/prisma/types";
import { useClanOperations } from "@/hooks/game-actions/use-clan-operations";
import { useGame } from "@/context/GameContext";
import { useState } from "react";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import EditClanModal from "./edit-clan-modal";

interface ClanDetailProps {
  clanData: ClanWithData | undefined;
  refetchClan: () => void;
  refetchStateClan: () => void;
}

export function ClanDetail({
  clanData,
  refetchClan,
  refetchStateClan,
}: ClanDetailProps) {
  const { state } = useGame();
  const [isLeaving, setIsLeaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { leaveClan } = useClanOperations(refetchStateClan);

  // Check if the current user is a leader or officer
  const userRole = state.clan?.role;
  const canEdit = userRole === "leader" || userRole === "officer";

  const handleLeaveClan = () => {
    if (isLeaving) return;

    setIsLeaving(true);
    leaveClan(undefined, {
      onSuccess: () => {
        setIsLeaving(false);
        setIsModalOpen(false);
      },
      onError: () => {
        setIsLeaving(false);
        setIsModalOpen(false);
      },
    });
  };

  if (!clanData) {
    return (
      <Card className="bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none w-full max-w-2xl">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="w-8 h-8 animate-spin text-white/70" />
        </CardContent>
      </Card>
    );
  }

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
              {canEdit && (
                <button
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setIsEditModalOpen(true)}
                  aria-label="Edit clan"
                >
                  <Pencil className="text-white/80 hover:text-white w-4 h-4" />
                </button>
              )}
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
              <span>
                Min Level:{" "}
                {clanData.requiredLevel ? clanData.requiredLevel : "None"}
              </span>
              <span>1.34M XP</span>
            </div>
            <button
              className="px-3 py-1 bg-red-700 rounded-lg text-xs text-white hover:bg-red-600 transition-colors"
              onClick={() => setIsModalOpen(true)}
              disabled={isLeaving}
            >
              {isLeaving ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                "Leave"
              )}
            </button>
          </div>
        </div>
      </CardContent>

      {isModalOpen && (
        <ConfirmationModal
          title="Leave Clan"
          message="Are you sure you want to leave the clan? This action cannot be undone."
          onConfirm={handleLeaveClan}
          onCancel={() => setIsModalOpen(false)}
          confirmDisabled={isLeaving}
          isLoading={isLeaving}
        />
      )}

      {isEditModalOpen && clanData && (
        <EditClanModal
          clan={clanData}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => refetchClan()}
          refetchClan={refetchClan}
        />
      )}
    </Card>
  );
}
