import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { ClanMember } from "@/lib/prisma/types";
import { LeaderboardUserAvatar } from "../leaderboard/LeaderboardUserAvatar";
import { Button } from "../ui/button";
import { Loader2, X } from "lucide-react";

interface LeaderSuccessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: ClanMember[];
  onSelectSuccessor: (successorFid: number) => void;
  isLoading: boolean;
  currentUserFid: number;
}

export default function LeaderSuccessionModal({
  isOpen,
  onClose,
  members,
  onSelectSuccessor,
  isLoading,
  currentUserFid,
}: LeaderSuccessionModalProps) {
  const [selectedSuccessor, setSelectedSuccessor] = useState<number | null>(
    null
  );

  // Filter members that can become leaders (exclude current leader)
  const eligibleMembers = members.filter(
    (member) => member.fid !== currentUserFid && member.role !== "leader"
  );

  const handleConfirm = () => {
    if (selectedSuccessor) {
      onSelectSuccessor(selectedSuccessor);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent
        className="bg-gradient-to-br from-[#7E4E31] to-[#6D4C2C] border-[#8B5E3C] max-w-sm rounded-lg"
        showCloseButton={false}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full 
                    bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
          aria-label="Close"
        >
          <X size={14} />
        </button>

        <DialogHeader>
          <DialogTitle className="text-white/90 text-lg font-bold">
            Choose New Leader
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-white/80 text-xs">
            As the current leader, you must select a new leader before leaving
            the clan.
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {eligibleMembers.map((member) => (
              <div
                key={member.fid}
                className={`border-2 rounded-lg cursor-pointer transition-all p-3 ${
                  selectedSuccessor === member.fid
                    ? "bg-gradient-to-r from-[#8B6B43]/90 to-[#9B7B53]/90 border-[#FFB938]"
                    : "bg-[#5B4120]/70 hover:bg-[#5B4120]/90 border-[#8B5E3C]/50"
                }`}
                onClick={() => setSelectedSuccessor(member.fid)}
              >
                <div className="flex items-center gap-3">
                  <LeaderboardUserAvatar
                    pfpUrl={
                      member.user.selectedAvatarUrl ||
                      member.user.avatarUrl ||
                      ""
                    }
                    username={member.user.username}
                    isOgUser={member.user.mintedOG}
                    size={{ width: 10, height: 10 }}
                    borderSize={2}
                  />
                  <div className="flex flex-col flex-1">
                    <span className="text-white/90 text-sm font-medium">
                      {member.user.username}
                    </span>
                    <span
                      className={`text-xs ${
                        member.role === "officer"
                          ? "text-[#B8B8B8]"
                          : "text-white/50"
                      }`}
                    >
                      {member.role === "officer" ? "Officer" : "Member"}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-white/90 text-sm">
                      {member.xpContributed
                        ? member.xpContributed >= 1000
                          ? `${(member.xpContributed / 1000).toFixed(1)}K`
                          : member.xpContributed.toString()
                        : "0"}
                    </div>
                    <span className="text-white/50 text-xs">XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {eligibleMembers.length === 0 && (
            <div className="text-center p-4 text-white/70">
              No eligible members found. You need at least one other member to
              select as leader.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-transparent border-[#8B5E3C] text-white/80 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={
                !selectedSuccessor || isLoading || eligibleMembers.length === 0
              }
              className="flex-1 bg-[#FFB938] text-[#7E4E31] hover:bg-[#ffc661] font-bold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Leaving...
                </>
              ) : (
                "Leave"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
