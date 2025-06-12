import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { useApiQuery } from "@/hooks/use-api-query";
import { Button } from "../ui/button";
import { Loader2, X } from "lucide-react";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { toast } from "sonner";
import Image from "next/image";

type OutgoingRequest = {
  id: string;
  clanId: string;
  clan: {
    id: string;
    name: string;
    motto: string;
    imageUrl: string | null;
    isPublic: boolean;
  };
  createdAt: string;
};

export default function ClanOutgoingRequests() {
  const { state, refetch } = useGame();
  const userFid = state.user?.fid;

  const {
    data: outgoingRequests,
    isLoading,
    refetch: refetchRequests,
  } = useApiQuery<OutgoingRequest[]>({
    queryKey: ["outgoing-join-requests", userFid],
    url: userFid ? `/api/user/clan-requests` : "",
    isProtected: true,
    enabled: !!userFid,
  });

  // Track which request IDs are currently being cancelled
  const [cancellingIds, setCancellingIds] = useState<Record<string, boolean>>(
    {}
  );

  const { mutate: cancelRequest } = useApiMutation({
    url: (requestId: string) => `/api/clan/join-requests/${requestId}`,
    method: "DELETE",
    onSuccess: (_, requestId) => {
      // Remove from cancelling state
      setCancellingIds((prev) => {
        const updated = { ...prev };
        delete updated[requestId];
        return updated;
      });

      refetchRequests();
      refetch.userClan();
      toast.success("Request cancelled successfully");
    },
    onError: (_, requestId) => {
      // Remove from cancelling state even on error
      setCancellingIds((prev) => {
        const updated = { ...prev };
        delete updated[requestId];
        return updated;
      });

      toast.error("Failed to cancel request");
    },
  });

  const handleCancelRequest = (requestId: string) => {
    setCancellingIds((prev) => ({ ...prev, [requestId]: true }));
    cancelRequest(requestId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-white/70" />
      </div>
    );
  }

  if (!outgoingRequests || outgoingRequests.length === 0) {
    return (
      <div className="text-center p-4 text-white/70 w-full max-w-2xl">
        No pending requests to join clans
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-[#6D4C2C]/80 rounded-md p-4">
        <h3 className="text-sm font-semibold text-white/90 mb-3 border-b border-[#8B5E3C]/40 pb-2">
          Your Pending Join Requests
        </h3>
        <div className="space-y-3">
          {outgoingRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between bg-[#5A4129]/50 p-3 rounded-md border border-[#8B5E3C]/30"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-md bg-[#5A4129] border border-[#8B5E3C] flex items-center justify-center overflow-hidden">
                  {request.clan.imageUrl ? (
                    <Image
                      src={request.clan.imageUrl}
                      alt={request.clan.name}
                      className="h-full w-full object-cover"
                      width={32}
                      height={32}
                    />
                  ) : (
                    <span className="text-xl">🛡️</span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-white/90">{request.clan.name}</p>
                  <p className="text-xs text-white/60 truncate max-w-[200px]">
                    {request.clan.motto}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleCancelRequest(request.id)}
                disabled={cancellingIds[request.id]}
                size="sm"
                className="h-7 bg-red-600/70 hover:bg-red-600 text-white text-xs px-2"
              >
                {cancellingIds[request.id] ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
