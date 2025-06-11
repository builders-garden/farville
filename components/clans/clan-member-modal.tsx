import { Statistic } from "../profile/Statistic";
import { LeaderboardUserAvatar } from "../leaderboard/LeaderboardUserAvatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import ProfileModal from "../ProfileModal";
import { useClanOperations } from "@/hooks/game-actions/use-clan-operations";
import { ClanRole } from "@/lib/types/game";

interface ClanMemberModalProps {
  fid: number;
  username: string;
  displayName: string;
  role: string;
  xpContributed: number;
  avatarUrl: string;
  mintedOG: boolean;
  joinedAt: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserRole?: string;
  clanId?: string;
  onMemberUpdate?: () => void;
}

export default function ClanMemberModal({
  fid,
  username,
  displayName,
  role,
  xpContributed,
  avatarUrl,
  mintedOG,
  joinedAt,
  open,
  onOpenChange,
  currentUserRole,
  clanId,
  onMemberUpdate,
}: ClanMemberModalProps) {
  const [selectedUserFid, setSelectedUserFid] = useState<number | undefined>(
    undefined
  );
  const [processingAction, setProcessingAction] = useState<"promote" | "demote" | "kick" | null>(null);

  const { manageMember } = useClanOperations(() => {
    // Call the refetch function passed from parent instead of full page reload
    if (onMemberUpdate) {
      onMemberUpdate();
    }
  });

  const handleCloseProfile = () => {
    setSelectedUserFid(undefined);
  };

  const handleMemberAction = (action: "promote" | "demote" | "kick") => {
    if (!clanId || processingAction) return;

    setProcessingAction(action);
    manageMember(
      {
        fid,
        action,
        clanId,
      },
      {
        onSuccess: () => {
          setProcessingAction(null);
          onOpenChange(false);
        },
        onError: () => {
          setProcessingAction(null);
        },
      }
    );
  };

  // Determine what buttons to show based on current user's role
  const currentUserIsLeaderOrOfficer =
    currentUserRole === ClanRole.Leader || currentUserRole === ClanRole.Officer;

  const currentUserIsLeader = currentUserRole === ClanRole.Leader;

  // Can promote if: current user is leader AND target is member
  const canPromote = currentUserIsLeader && role === ClanRole.Member;

  // Can demote if: current user is leader AND target is officer
  const canDemote = currentUserIsLeader && role === ClanRole.Officer;

  // Can kick if: current user is leader/officer AND target is not leader AND not targeting self
  const canKick = currentUserIsLeaderOrOfficer && role !== ClanRole.Leader;

  return (
    <>
      {selectedUserFid ? (
        <ProfileModal
          onClose={handleCloseProfile}
          userFid={selectedUserFid}
        />
      ) : (
        <Dialog
          open={open}
          onOpenChange={onOpenChange}
        >
          <DialogContent className="w-[360px] bg-[#7E4E31] border-[#8B5E3C]/50 rounded-lg">
            <DialogHeader hidden>
              <DialogTitle hidden>{username}&apos;s profile</DialogTitle>
            </DialogHeader>
            <div className="flex flex-row items-center gap-3 xs:gap-4">
              <div className={`relative flex-none w-fit`}>
                <LeaderboardUserAvatar
                  pfpUrl={avatarUrl}
                  username={username}
                  isOgUser={mintedOG}
                  size={{
                    width: 12,
                    height: 12,
                  }}
                  borderSize={3}
                />
              </div>
              <div className="flex flex-col w-full gap-1 xs:gap-2">
                <h3 className="text-white/90 font-bold text-xs xs:text-sm">
                  {!displayName
                    ? "Farmer"
                    : displayName.length > 17
                    ? displayName.slice(0, 13) + "..."
                    : displayName}
                </h3>
                <div className="flex flex-row justify-between w-full">
                  <div className="text-[#f2a311] text-[10px] xs:text-xs">
                    {role}
                  </div>
                  <div className="flex flex-row text-white/70 text-[10px] xs:text-xs gap-1">
                    <span>XP:</span>
                    <span>{xpContributed.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            <hr className="w-full border-white/20" />
            {/* Statistics */}
            <div className="flex flex-col gap-1 xs:gap-2 text-white/80">
              <Statistic
                title="Joined At"
                image="/images/icons/farmer.png"
                value={
                  joinedAt ? new Date(joinedAt).toLocaleDateString() : "Unknown"
                }
              />
            </div>
            {/* Buttons */}
            <div className="flex flex-col w-full gap-2 mt-3">
              {/* Always show View Profile button */}
              <button
                className="w-full px-3 py-2 bg-[#8B5E3C] rounded-lg text-xs text-white hover:bg-[#7B5B30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#8B5E3C]"
                onClick={() => {
                  setSelectedUserFid(fid);
                }}
                disabled={!!processingAction}
              >
                View Profile
              </button>

              {/* Show role management buttons only if user has permissions */}
              {currentUserIsLeaderOrOfficer && (
                <>
                  {canPromote && (
                    <button
                      className="w-full px-3 py-2 bg-green-600 rounded-lg text-xs text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
                      onClick={() => handleMemberAction("promote")}
                      disabled={!!processingAction}
                    >
                      {processingAction === "promote" ? "Processing..." : "Promote to Officer"}
                    </button>
                  )}

                  {canDemote && (
                    <button
                      className="w-full px-3 py-2 bg-yellow-500 rounded-lg text-xs text-white hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-yellow-500"
                      onClick={() => handleMemberAction("demote")}
                      disabled={!!processingAction}
                    >
                      {processingAction === "demote" ? "Processing..." : "Demote to Member"}
                    </button>
                  )}

                  {canKick && (
                    <button
                      className="w-full px-3 py-2 bg-red-500 rounded-lg text-xs text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500"
                      onClick={() => handleMemberAction("kick")}
                      disabled={!!processingAction}
                    >
                      {processingAction === "kick" ? "Processing..." : "Kick Out"}
                    </button>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
