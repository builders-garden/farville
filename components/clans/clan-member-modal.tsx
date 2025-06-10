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
}: ClanMemberModalProps) {
  const [selectedUserFid, setSelectedUserFid] = useState<number | undefined>(
    undefined
  );

  const handleCloseProfile = () => {
    setSelectedUserFid(undefined);
  };

  return (
    <>
      {selectedUserFid ? (
        <ProfileModal onClose={handleCloseProfile} userFid={selectedUserFid} />
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
            <div className="flex flex-row w-full justify-between gap-2 mt-3">
              <button
                className="px-3 py-1 bg-[#8B5E3C] rounded-lg text-xs text-white hover:bg-[#7B5B30] transition-colors"
                onClick={() => {
                  // Set the selected user FID to open the profile modal
                  setSelectedUserFid(fid); // Replace with actual user FID
                }}
              >
                View Profile
              </button>
              <button
                className="px-3 py-1 bg-[#8B5E3C] rounded-lg text-xs text-white hover:bg-[#7B5B30] transition-colors"
                onClick={() => {
                  // Add your remove function here
                  console.log("Remove button clicked");
                }}
              >
                Kick out
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
