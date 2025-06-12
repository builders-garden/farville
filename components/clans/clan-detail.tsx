import { Card, CardContent } from "../ui/card";
import { Pencil, Loader2, LogOut } from "lucide-react";
import { ClanWithData } from "@/lib/prisma/types";
import { useClanOperations } from "@/hooks/game-actions/use-clan-operations";
import { useGame } from "@/context/GameContext";
import { useState } from "react";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import EditClanModal from "./edit-clan-modal";
import LeaderSuccessionModal from "./leader-succession-modal";
import { ClanStatus } from "./clan-status";
import Image from "next/image";

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
  const [isSuccessionModalOpen, setIsSuccessionModalOpen] = useState(false);
  const { leaveClan } = useClanOperations(() => {
    refetchStateClan();
    refetchClan();
  });

  // Check if the current user is a leader or officer
  const userRole = state.clan?.role;
  const isDisplayingMyClan =
    state.clan && clanData ? state.clan.clanId === clanData.id : false;
  const canEdit = userRole === "leader" || userRole === "officer";
  const isLeader = userRole === "leader";

  const handleLeaveClan = () => {
    if (isLeaving) return;

    // If user is a leader and there are other members, show succession modal
    if (isLeader && clanData && clanData.members.length > 1) {
      setIsModalOpen(false);
      setIsSuccessionModalOpen(true);
      return;
    }

    // Otherwise proceed with normal leave
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

  const handleSuccessorSelection = (successorFid: number) => {
    setIsLeaving(true);
    leaveClan(
      { successorFid },
      {
        onSuccess: () => {
          setIsLeaving(false);
          setIsSuccessionModalOpen(false);
        },
        onError: () => {
          setIsLeaving(false);
          setIsSuccessionModalOpen(false);
        },
      }
    );
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
          <div className="relative w-12 h-12 xs:w-16 xs:h-16 shrink-0 rounded-lg bg-[#7B5B30] overflow-hidden">
            {clanData.imageUrl && (
              <Image
                src={clanData.imageUrl}
                alt={clanData.name}
                className="w-full h-full object-cover"
                fill
                sizes="(max-width: 640px) 64px, (min-width: 641px) 80px"
              />
            )}
          </div>
          <div className="flex flex-col w-full gap-1 xs:gap-2">
            <div className="flex justify-between items-start">
              <h3 className="text-white/90 font-bold text-xs xs:text-sm">
                {clanData && clanData.name.length > 17
                  ? clanData.name.slice(0, 14) + "..."
                  : clanData?.name}
              </h3>
              <ClanStatus isPublic={clanData.isPublic} short />
            </div>
            <div className="flex w-full">
              <div className="text-[#f2a311] text-[10px]">
                {clanData && clanData.motto.length > 45 && isDisplayingMyClan
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
              <span>
                Farmed:{" "}
                {clanData
                  ? clanData.xp >= 1000000
                    ? `${(clanData.xp / 1000000).toFixed(2)}M`
                    : clanData.xp >= 1000
                    ? `${(clanData.xp / 1000).toFixed(2)}K`
                    : clanData.xp
                  : undefined}{" "}
                XP
              </span>
              {!isDisplayingMyClan && (
                <span>Shared requests: {clanData.requests.length}</span>
              )}
            </div>
            {isDisplayingMyClan && (
              <div className="flex flex-col items-center gap-2">
                {canEdit && (
                  <button
                    className="flex flex-row text-[10px] text-white/90 items-center justify-center gap-2 w-24 h-8 rounded-lg hover:bg-yellow-800 transition-colors bg-yellow-700"
                    onClick={() => setIsEditModalOpen(true)}
                    aria-label="Edit clan"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
                <button
                  className="flex flex-row items-center justify-center gap-2 w-24 h-8 bg-red-700 rounded-lg text-[10px] text-white/90 hover:bg-red-600 transition-colors"
                  onClick={() => setIsModalOpen(true)}
                  disabled={isLeaving}
                >
                  {isLeaving ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Leave</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {isModalOpen && (
        <ConfirmationModal
          title="Leave Clan"
          message={
            isLeader && clanData && clanData.members.length > 1
              ? "As the leader, you need to select a successor before leaving the clan."
              : "Are you sure you want to leave the clan? This action cannot be undone."
          }
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

      {isSuccessionModalOpen && clanData && (
        <LeaderSuccessionModal
          isOpen={isSuccessionModalOpen}
          onClose={() => setIsSuccessionModalOpen(false)}
          members={clanData.members}
          onSelectSuccessor={handleSuccessorSelection}
          isLoading={isLeaving}
          currentUserFid={state.user.fid}
        />
      )}
    </Card>
  );
}
