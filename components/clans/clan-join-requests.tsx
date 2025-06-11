import { useState } from "react";
import { useGame } from "@/context/GameContext";
import { useClanJoinRequests } from "@/hooks/use-clan-join-requests";
import { ClanRole } from "@/lib/types/game";
import { Button } from "../ui/button";
import { Check, Loader2, X } from "lucide-react";
import Image from "next/image";

interface ClanJoinRequestsProps {
  clanId?: string;
  refetchClanData: () => void;
  // We can add joinRequests in the future if needed
}

export default function ClanJoinRequests({
  clanId,
  refetchClanData,
}: ClanJoinRequestsProps) {
  const { state } = useGame();
  const userClan = state.clan as
    | { clan: { id: string }; role: ClanRole }
    | undefined;

  // Only show this component for clan leaders and officers
  const canManageRequests =
    userClan?.role === ClanRole.Leader || userClan?.role === ClanRole.Officer;

  // TODO: this data is available in the parent component, so we should use this hook only to update the requests
  // so this needs to be fixed
  const { requests, isLoading, respondToJoinRequest } = useClanJoinRequests(
    canManageRequests ? clanId : undefined
  );

  // Track both processing state and the current action for each request
  const [processingRequests, setProcessingRequests] = useState<
    Record<string, { processing: boolean; action?: "accept" | "reject" }>
  >({});

  if (!canManageRequests) return null;

  const handleRequestAction = async (
    requestId: string,
    action: "accept" | "reject"
  ) => {
    // Set the loading state and action type for this specific request
    setProcessingRequests((prev) => ({
      ...prev,
      [requestId]: { processing: true, action },
    }));

    // Define the callback to clear loading state when action completes
    const onActionComplete = () => {
      setProcessingRequests((prev) => ({
        ...prev,
        [requestId]: { processing: false },
      }));
    };

    try {
      // Call the hook function with completion callback
      // For 'accept' actions, also refetch clan members
      respondToJoinRequest(
        requestId,
        action,
        onActionComplete,
        action === "accept" ? refetchClanData : undefined
      );
    } catch (error) {
      console.error(
        `Error ${action === "accept" ? "accepting" : "rejecting"} request:`,
        error
      );
      // Clear loading state in case of an immediate error
      onActionComplete();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-white/70" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center p-3 text-white/70 text-sm border-t border-[#8B5E3C]/40">
        No pending join requests
      </div>
    );
  }

  return (
    <div className="bg-[#6D4C2C]/80 rounded-md mt-3">
      <h3 className="text-sm font-semibold text-white/90 p-3 border-b border-[#8B5E3C]/40">
        Pending Join Requests
      </h3>
      <div className="max-h-[200px] overflow-y-auto">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-3 border-b border-[#8B5E3C]/30 last:border-none"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#5A4129] flex items-center justify-center overflow-hidden border border-[#8B5E3C]">
                {request.user.avatarUrl ? (
                  <Image
                    src={request.user.avatarUrl}
                    alt={request.user.displayName}
                    className="h-full w-full object-cover"
                    width={32}
                    height={32}
                  />
                ) : (
                  <span className="text-xs text-white">
                    {request.user.displayName.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs text-white/90">
                  {request.user.displayName}
                </p>
                <p className="text-[10px] text-white/60">
                  @{request.user.username}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleRequestAction(request.id, "accept")}
                disabled={processingRequests[request.id]?.processing}
                size="sm"
                className="h-7 bg-green-600/70 hover:bg-green-600 text-white text-xs px-2"
              >
                {processingRequests[request.id]?.processing &&
                processingRequests[request.id]?.action === "accept" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </Button>
              <Button
                onClick={() => handleRequestAction(request.id, "reject")}
                disabled={processingRequests[request.id]?.processing}
                size="sm"
                className="h-7 bg-red-600/70 hover:bg-red-600 text-white text-xs px-2"
              >
                {processingRequests[request.id]?.processing &&
                processingRequests[request.id]?.action === "reject" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
