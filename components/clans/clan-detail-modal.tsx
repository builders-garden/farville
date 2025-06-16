import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Unlock, X, Shield, Users, Trophy } from "lucide-react";
import { Clan } from "@prisma/client";
import { useClanOperations } from "@/hooks/game-actions/use-clan-operations";
import { useGame } from "@/context/GameContext";
import { useCheckClanJoinRequest } from "@/hooks/use-check-clan-join-request";
import { ClanImage } from "./clan-image";

interface ClanWithDetails extends Clan {
  memberCount?: number;
  level?: number;
}

interface ClanDetailModalProps {
  clan: ClanWithDetails;
  onClose: () => void;
  refetchClans: () => void;
  refetchOutgoingRequests?: () => void;
  onClickView: () => void;
}

export default function ClanDetailModal({
  clan,
  onClose,
  refetchClans,
  refetchOutgoingRequests,
  onClickView,
}: ClanDetailModalProps) {
  const { state, refetch } = useGame();
  const [isJoining, setIsJoining] = useState(false);

  const { joinClan } = useClanOperations(
    () => {
      refetch.userClan();
      refetchClans();
    },
    // If refetchOutgoingRequests is provided as a prop, use it, otherwise it will be undefined
    refetchOutgoingRequests
  );

  // Check if the user has a pending join request for this clan
  const { hasPendingRequest } = useCheckClanJoinRequest(clan?.id);

  const userHasClan = Boolean(state.clan);

  // Check if clan is full
  const isClanFull = (clan.memberCount || 0) >= (clan.maxMembers || 20);

  // If no required level is set, any level can join
  const userCanJoin =
    !userHasClan &&
    !isClanFull &&
    (!clan.requiredLevel || state.level >= clan.requiredLevel);

  // Handle joining a clan
  const handleJoinClan = () => {
    if (
      !userCanJoin ||
      isJoining ||
      isClanFull ||
      (!clan.isPublic && hasPendingRequest)
    )
      return;

    setIsJoining(true);

    // Add clan name and user level to the join parameters for level validation and toast messages
    joinClan({
      clanId: clan.id,
      isPublic: clan.isPublic,
      clanName: clan.name,
      userLevel: state.level,
    });

    // Close modal after a brief delay to show loading state
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  // Format XP for display
  const formatXP = (xp: number): string => {
    if (xp >= 1000000) {
      return `${(xp / 1000000).toFixed(2)}M XP`;
    } else if (xp >= 1000) {
      return `${(xp / 1000).toFixed(1)}K XP`;
    } else {
      return `${xp} XP`;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-60"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#7E4E31] p-6 rounded-lg max-w-sm w-full mx-4 border border-[#8B5E3C]/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white/90 font-bold text-lg flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            Feud Details
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full 
                    bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Clan Header with Icon and Name */}
          <div className="flex items-center gap-4">
            <ClanImage imageUrl={clan.imageUrl} clanName={clan.name} />
            <div className="flex flex-col">
              <h3 className="text-white font-bold text-lg">{clan.name}</h3>
              <div className="flex items-center text-xs text-white/70">
                {clan.isPublic ? (
                  <>
                    <Unlock size={14} className="mr-1" />
                    <span>Public Feud</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} className="mr-1" />
                    <span>Private Feud</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Clan Motto */}
          {clan.motto && (
            <div className="bg-[#6D4C2C]/80 p-3 rounded-lg border border-[#8B5E3C]/30">
              <p className="text-[#FFB938]/90 text-sm italic">
                &quot;{clan.motto}&quot;
              </p>
            </div>
          )}

          {/* Clan Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#6D4C2C]/80 p-3 rounded-lg flex flex-col items-center justify-center">
              <Trophy size={16} className="text-[#FFB938] mb-1" />
              <span className="text-xs font-bold text-[#FFB938]">
                LVL {clan.level}
              </span>
              <span className="text-[10px] text-white/70">
                {formatXP(clan.xp || 0)}
              </span>
            </div>
            <div className="bg-[#6D4C2C]/80 p-3 rounded-lg flex flex-col items-center justify-center">
              <Users size={16} className="text-white/80 mb-1" />
              <span className="text-xs font-medium text-white/90">
                {clan.memberCount || 0}/{clan.maxMembers || 20}
              </span>
              <span className="text-[10px] text-white/70">members</span>
            </div>
            <div className="bg-[#6D4C2C]/80 p-3 rounded-lg flex flex-col items-center justify-center">
              <Shield size={16} className="text-white/80 mb-1" />
              <span className="text-xs font-medium text-white/90">
                {clan.requiredLevel ? `Lvl ${clan.requiredLevel}` : "Lvl 1"}
              </span>
              <span className="text-[10px] text-white/70">required</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClickView}
              className="flex-1 py-2 px-4 rounded bg-[#6D4C2C] text-white/90 hover:bg-[#8B5E3C] transition-colors text-sm font-medium flex items-center justify-center"
            >
              View
            </button>
            {!userHasClan ? (
              <button
                type="button"
                disabled={
                  !userCanJoin ||
                  isJoining ||
                  isClanFull ||
                  (!clan.isPublic && hasPendingRequest)
                }
                onClick={handleJoinClan}
                className={`
                  flex-1 py-2 px-4 rounded text-[#7E4E31] transition-colors text-sm font-medium
                  ${
                    !userCanJoin ||
                    isJoining ||
                    isClanFull ||
                    (!clan.isPublic && hasPendingRequest)
                      ? "bg-[#FFB938]/50 cursor-not-allowed"
                      : "bg-[#FFB938] hover:bg-[#ffc65c]"
                  }
                `}
              >
                {isJoining ? (
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 border-2 border-t-transparent border-[#7E4E31] rounded-full animate-spin mr-2"></div>
                    Loading...
                  </div>
                ) : isClanFull ? (
                  "Feud is Full"
                ) : clan.isPublic ? (
                  "Join"
                ) : hasPendingRequest ? (
                  "Pending"
                ) : (
                  "Request"
                )}
              </button>
            ) : null}
          </div>

          {/* Message for users who don't meet the level requirement */}
          {!userHasClan &&
            clan.requiredLevel &&
            state.level < clan.requiredLevel && (
              <p className="text-amber-400/90 text-xs text-center mt-2">
                You must be level {clan.requiredLevel} to join this feud.
              </p>
            )}

          {/* Message for clan being full */}
          {!userHasClan && isClanFull && (
            <p className="text-red-400/90 text-xs text-center mt-2">
              This feud is full ({clan.memberCount || 0}/{clan.maxMembers || 20}
              )
            </p>
          )}

          {/* Message for users who have a pending request */}
          {!userHasClan && !clan.isPublic && hasPendingRequest && (
            <p className="text-amber-400/90 text-xs text-center mt-2">
              Your request to join this feud is pending approval
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
