import { RequestChatCard } from "@/components/RequestChatCard";
import { ClanRequestWithItemData, ClanMember } from "@/lib/prisma/types";

interface ClanRequestsProps {
  viewerFid: number;
  requests: (ClanRequestWithItemData & { user: ClanMember["user"] })[];
}

export default function ClanRequests({
  requests,
  viewerFid,
}: ClanRequestsProps) {
  console.log("ClanRequests", requests, viewerFid);

  return (
    <div className="flex flex-col gap-2 w-full max-w-2xl py-2">
      {requests.length === 0 && (
        <div className="text-center text-gray-400 py-8">No requests yet.</div>
      )}
      {requests.map((req) => {
        const isOwn = req.request.fid === viewerFid;
        const user = req.user;
        return (
          <RequestChatCard
            key={req.requestId}
            isOwn={isOwn}
            username={user.username || "Unknown"}
            avatarUrl={user.selectedAvatarUrl || user?.avatarUrl || undefined}
            itemName={req.request?.item?.name || "Unknown Item"}
            itemImageUrl={`/images/${req.request?.item?.icon}` || undefined}
            quantity={req.request?.quantity || 0}
            missing={
              req.request?.quantity && req.request?.filledQuantity !== undefined
                ? req.request.quantity - req.request.filledQuantity
                : req.request?.quantity || 0
            }
            createdAt={req.request.createdAt}
          />
        );
      })}
    </div>
  );
}
