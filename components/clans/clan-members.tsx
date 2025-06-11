import { ClanMember } from "@/lib/prisma/types";
import { Card, CardContent } from "../ui/card";
import { LeaderboardUserAvatar } from "../leaderboard/LeaderboardUserAvatar";
import { useState } from "react";
import ClanMemberModal from "./clan-member-modal";
import { useGame } from "@/context/GameContext";

interface ClanMembersProps {
  members: ClanMember[];
  clanId?: string;
  onMemberUpdate?: () => void;
}

export default function ClanMembers({
  members,
  clanId,
  onMemberUpdate,
}: ClanMembersProps) {
  const { state } = useGame();
  const [selectedMember, setSelectedMember] = useState<ClanMember | null>(null);

  const handleModalChange = (open: boolean) => {
    if (!open) setSelectedMember(null);
  };

  return (
    <>
      <div className="w-full max-w-2xl space-y-2">
        <div className="flex justify-between items-center p-3 text-white/70 text-sm">
          <span>Your farmers</span>
          <span>{members.length}/20</span>
        </div>
        {members.map((member, index) => (
          <Card
            key={member.fid}
            className={`border-none cursor-pointer ${
              member.role === "leader"
                ? "bg-gradient-to-r from-[#8B6B43]/90 to-[#9B7B53]/90"
                : member.role === "officer"
                ? "bg-gradient-to-r from-[#7A6B43]/90 to-[#8A7B53]/90"
                : "bg-[#5B4120]/90"
            }`}
            onClick={() => setSelectedMember(member)}
          >
            <CardContent className="flex justify-between items-center p-3">
              <div className="flex items-center gap-3">
                <span className="text-white/70 text-sm">{index + 1}</span>
                <LeaderboardUserAvatar
                  pfpUrl={
                    member.user.selectedAvatarUrl || member.user.avatarUrl || ""
                  }
                  username={member.user.username}
                  isOgUser={member.user.mintedOG}
                  size={{ width: 10, height: 10 }}
                  borderSize={2}
                />
                <div className="flex flex-col">
                  <span className="text-white/90 text-xs font-medium">
                    {member.user.username.length > 14
                      ? member.user.username.slice(0, 10) + "..."
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
              <div className="flex flex-row items-center gap-1 text-right">
                <span className="text-white/90 text-sm">
                  {member.xpContributed
                    ? member.xpContributed >= 1000
                      ? `${(member.xpContributed / 1000).toFixed(1)}K`
                      : member.xpContributed.toString()
                    : "0"}
                </span>
                <span className="text-white/50 text-xs">XP</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedMember && (
        <ClanMemberModal
          fid={selectedMember.fid}
          username={selectedMember.user.username}
          displayName={selectedMember.user.displayName || ""}
          role={selectedMember.role}
          xpContributed={selectedMember.xpContributed}
          avatarUrl={
            selectedMember.user.selectedAvatarUrl ||
            selectedMember.user.avatarUrl ||
            ""
          }
          mintedOG={selectedMember.user.mintedOG}
          joinedAt={new Date(selectedMember.joinedAt)}
          open={!!selectedMember}
          onOpenChange={handleModalChange}
          currentUserRole={state.clan?.role}
          clanId={clanId || state.clan?.clanId}
          onMemberUpdate={onMemberUpdate}
        />
      )}
    </>
  );
}
