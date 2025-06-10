import { ClanRequestToJoin } from "@/lib/prisma/types";
import { Card, CardContent } from "../ui/card";
import { LeaderboardUserAvatar } from "../leaderboard/LeaderboardUserAvatar";

interface ClanNewcomersProps {
  requestsToJoin: ClanRequestToJoin[];
  membersCount: number;
}

export default function ClanNewcomers({
  requestsToJoin,
  membersCount,
}: ClanNewcomersProps) {
  return (
    <>
      <div className="w-full max-w-2xl space-y-2">
        <div className="flex flex-col gap-2 text-white/70 text-xs px-2">
          <span>New farmers want to join!</span>
          <span className="text-[10px]">
            Available spots: {20 - membersCount}
          </span>
        </div>
        {requestsToJoin.map((member) => (
          <Card
            key={member.fid}
            className={`border-none cursor-pointer bg-[#5B4120]/90`}
          >
            <CardContent className="flex justify-between items-center p-3">
              <div className="flex items-center gap-3">
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
                </div>
              </div>
              <div className="flex items-end flex-row items-center gap-1 text-right text-sm">
                <span>✅</span>
                <span>❌</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
