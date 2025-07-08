"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { useFrameContext } from "../context/FrameContext";
import { useClan } from "@/hooks/use-clan";
import { useGame } from "@/context/GameContext";
import { useClanOperations } from "@/hooks/game-actions/use-clan-operations";
import { useCheckClanJoinRequest } from "@/hooks/use-check-clan-join-request";
import { ClanImage } from "./clans/clan-image";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Unlock, Users, Trophy, Shield, X } from "lucide-react";
import { LeaderboardUserAvatar } from "./leaderboard/LeaderboardUserAvatar";

export default function ClanOverlay({
  onClose,
  clanId,
}: {
  onClose: () => void;
  clanId: string;
}) {
  const { safeAreaInsets } = useFrameContext();
  const { state, refetch, setShowClans } = useGame();
  const [isJoining, setIsJoining] = useState(false);

  // Fetch clan data
  const { clanData: clan, isLoading: clanDataIsLoading } = useClan(clanId);

  // Check if user has pending request
  const { hasPendingRequest, isLoading: joinRequestsIsLoading } =
    useCheckClanJoinRequest(clanId);

  // Clan operations hook
  const { joinClan } = useClanOperations(() => {
    refetch.userClan();
    onClose();
    // Open ClansModal after successful join
    setTimeout(() => {
      setShowClans(true);
    }, 100);
  });

  const userHasClan = Boolean(state.clan);

  // Get member count from members array
  const memberCount = clan?.members?.length || 0;
  const isClanFull = memberCount >= (clan?.maxMembers || 20);

  const userCanJoin =
    !userHasClan &&
    clan &&
    !isClanFull &&
    (!clan.requiredLevel || state.level >= clan.requiredLevel);

  // Check if we're still loading any necessary data
  const isLoading = clanDataIsLoading || joinRequestsIsLoading;

  // Calculate clan level from XP (assuming 1000 XP per level)
  const calculateClanLevel = (xp: number): number => {
    return Math.floor(xp / 1000) + 1;
  };

  const clanLevel = clan ? calculateClanLevel(clan.xp) : 1;

  const handleJoinClan = () => {
    if (
      !userCanJoin ||
      isJoining ||
      isClanFull ||
      (!clan?.isPublic && hasPendingRequest) ||
      !clan
    )
      return;

    setIsJoining(true);

    joinClan({
      clanId: clan.id,
      isPublic: clan.isPublic,
      clanName: clan.name,
      userLevel: state.level,
    });

    // Close overlay after brief delay to show loading state
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

  if (isLoading || !clan) {
    return (
      <div
        className="fixed inset-0 bg-[#7E4E31] flex flex-col z-50 overflow-y-auto"
        style={{
          paddingTop: safeAreaInsets.top,
          paddingBottom: safeAreaInsets.bottom,
          paddingLeft: safeAreaInsets.left,
          paddingRight: safeAreaInsets.right,
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#8B5E3C]/50">
          <h3 className="text-white/90 font-bold text-lg flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            Loading Feud...
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

        {/* Loading Content */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Clan Header Loading */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-lg bg-[#5A4129]" />
              <div className="flex flex-col space-y-2">
                <Skeleton className="h-6 w-48 bg-[#5A4129]" />
                <Skeleton className="h-4 w-32 bg-[#5A4129]" />
              </div>
            </div>

            {/* Clan Motto Loading */}
            <Skeleton className="h-12 w-full bg-[#5A4129] rounded-lg" />

            {/* Stats Loading */}
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-16 w-full bg-[#5A4129] rounded-lg" />
              <Skeleton className="h-16 w-full bg-[#5A4129] rounded-lg" />
              <Skeleton className="h-16 w-full bg-[#5A4129] rounded-lg" />
            </div>

            {/* Members Loading */}
            <Skeleton className="h-32 w-full bg-[#5A4129] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-[#7E4E31] flex flex-col z-50 overflow-y-auto"
      style={{
        paddingTop: safeAreaInsets.top,
        paddingBottom: safeAreaInsets.bottom,
        paddingLeft: safeAreaInsets.left,
        paddingRight: safeAreaInsets.right,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#8B5E3C]/50">
          <h3 className="text-white/90 font-bold text-lg flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            Join Feud
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

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 pb-24">
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
                LVL {clanLevel}
              </span>
              <span className="text-[10px] text-white/70">
                {formatXP(clan.xp || 0)}
              </span>
            </div>
            <div className="bg-[#6D4C2C]/80 p-3 rounded-lg flex flex-col items-center justify-center">
              <Users size={16} className="text-white/80 mb-1" />
              <span className="text-xs font-medium text-white/90">
                {memberCount}
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

          {/* Clan Members */}
          {clan.members && clan.members.length > 0 && (
            <div className="bg-[#6D4C2C]/80 p-3 rounded-lg border border-[#8B5E3C]/30">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-white/90 text-sm font-medium flex items-center gap-2">
                  <Users size={14} />
                  Feud Members
                </h4>
                <span className="text-white/70 text-xs">
                  {memberCount}/{clan.maxMembers || 20}
                </span>
              </div>
              <div
                className="max-h-32 overflow-y-auto space-y-2"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#8B5E3C #5A4129",
                }}
              >
                {clan.members.map((member, index) => (
                  <div
                    key={member.fid}
                    className="flex items-center justify-between p-2 bg-[#5A4129]/50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 text-xs w-4">
                        {index + 1}
                      </span>
                      <LeaderboardUserAvatar
                        pfpUrl={
                          member.user.selectedAvatarUrl ||
                          member.user.avatarUrl ||
                          ""
                        }
                        username={member.user.username}
                        isOgUser={member.user.mintedOG}
                        size={{ width: 6, height: 6 }}
                        borderSize={1}
                      />
                      <div className="flex flex-col">
                        <span className="text-white/90 text-xs font-medium">
                          {member.user.username.length > 12
                            ? member.user.username.slice(0, 8) + "..."
                            : member.user.username}
                        </span>
                        <span
                          className={`text-[10px] ${
                            member.role === "leader"
                              ? "text-[#D4AF37]"
                              : member.role === "officer"
                              ? "text-[#B8B8B8]"
                              : "text-white/50"
                          }`}
                        >
                          {member.role || "Member"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-right">
                      <span className="text-white/90 text-xs">
                        {member.xpContributed
                          ? member.xpContributed >= 1000
                            ? `${(member.xpContributed / 1000).toFixed(1)}K`
                            : member.xpContributed.toString()
                          : "0"}
                      </span>
                      <span className="text-white/50 text-[10px]">XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Fixed Action buttons */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-[#7E4E31] pt-4 pb-4 px-6 border-t border-[#8B5E3C]/50 z-50"
        style={{
          paddingBottom: safeAreaInsets.bottom + 16,
          paddingLeft: safeAreaInsets.left + 24,
          paddingRight: safeAreaInsets.right + 24,
        }}
      >
        <div className="flex gap-3">
          {!userHasClan ? (
            <button
              type="button"
              disabled={
                isLoading ||
                !clan ||
                !userCanJoin ||
                isJoining ||
                isClanFull ||
                (!clan.isPublic && hasPendingRequest)
              }
              onClick={handleJoinClan}
              className={`
                flex-1 py-2 px-4 rounded text-[#7E4E31] transition-colors text-sm font-medium
                ${
                  isLoading ||
                  !clan ||
                  !userCanJoin ||
                  isJoining ||
                  isClanFull ||
                  (!clan.isPublic && hasPendingRequest)
                    ? "bg-[#FFB938]/50 cursor-not-allowed"
                    : "bg-[#FFB938] hover:bg-[#ffc65c]"
                }
              `}
            >
              {isLoading || !clan ? (
                <div className="flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-t-transparent border-[#7E4E31] rounded-full animate-spin mr-2"></div>
                  Loading...
                </div>
              ) : isJoining ? (
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
                "Ask to Join"
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="flex-1 py-2 px-4 rounded bg-[#FFB938]/50 text-[#7E4E31]/70 cursor-not-allowed text-sm font-medium"
            >
              Already in Feud
            </button>
          )}
        </div>

        {/* Message for users who don't meet the level requirement */}
        {!isLoading &&
          clan &&
          !userHasClan &&
          clan.requiredLevel &&
          state.level < clan.requiredLevel && (
            <p className="text-amber-400/90 text-xs text-center mt-2">
              You must be level {clan.requiredLevel} to join this feud
            </p>
          )}

        {/* Message for clan being full */}
        {!isLoading && clan && !userHasClan && isClanFull && (
          <p className="text-red-400/90 text-xs text-center mt-2">
            This feud is full ({memberCount}/{clan.maxMembers || 20})
          </p>
        )}

        {/* Message for users who have a pending request */}
        {!isLoading &&
          clan &&
          !userHasClan &&
          !clan.isPublic &&
          hasPendingRequest && (
            <p className="text-amber-400/90 text-xs text-center mt-2">
              Your request to join this feud is pending approval
            </p>
          )}
      </div>
    </div>
  );
}
