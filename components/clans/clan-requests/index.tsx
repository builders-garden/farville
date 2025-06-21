import { RequestChatCard } from "@/components/RequestChatCard";
import { ClanRequestWithItemData, ClanMember } from "@/lib/prisma/types";
import { RefreshCw } from "lucide-react";

interface ClanRequestsProps {
  viewerFid: number;
  requests: (ClanRequestWithItemData & { user: ClanMember["user"] })[];
  refetchClanData: () => void;
}

export default function ClanRequests({
  requests,
  viewerFid,
  refetchClanData,
}: ClanRequestsProps) {
  return (
    <>
      <div className="flex flex-col gap-2 w-full max-w-2xl py-2">
        {requests.length === 0 ? (
          <div className="text-center text-white/80 py-8">No requests yet.</div>
        ) : (
          <>
            <button
              onClick={refetchClanData}
              className="self-end px-4 py-2 mb-2 text-sm bg-[#6D4C2C] text-white rounded-md hover:bg-[#8B5E3C] transition-colors flex items-center"
            >
              Refresh <RefreshCw className="inline h-4 w-4 ml-1" />
            </button>

            {requests.map((req) => {
              const isOwn = req.fid === viewerFid;
              const user = req.user;
              if (!user) {
                console.warn(
                  `Request ${req.requestId} has no associated user data`
                );
                return undefined; // Skip rendering if user data is missing
              }
              return (
                <RequestChatCard
                  key={req.requestId || req.id}
                  isOwn={isOwn}
                  request={req}
                  requestor={{
                    fid: user.fid,
                    username: user.username,
                    avatarUrl: user.selectedAvatarUrl || user.avatarUrl || "",
                  }}
                  refetchClanData={refetchClanData}
                  type={req.requestId ? "request" : "ask"}
                />
              );
            })}
          </>
        )}
      </div>
    </>
  );
}
