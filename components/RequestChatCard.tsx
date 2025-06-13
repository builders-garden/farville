import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { LeaderboardUserAvatar } from "./leaderboard/LeaderboardUserAvatar";
import { Progress } from "./ui/progress";
import RequestModal from "./RequestModal";
import { ClanRequestWithItemData } from "@/lib/prisma/types";
import { useGame } from "@/context/GameContext";
import { Item } from "@prisma/client";

export interface RequestChatCardProps {
  isOwn: boolean;
  request: ClanRequestWithItemData;
  requestor: {
    fid: number;
    username: string;
    avatarUrl: string;
  };
  refetchClanData: () => void;
  type: "ask" | "request";
}

export const RequestChatCard: React.FC<RequestChatCardProps> = ({
  isOwn,
  request,
  requestor,
  refetchClanData,
  type,
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { state } = useGame();

  const itemData: Item = request.itemId
    ? state.items.find((item) => item.id === request.itemId)!
    : request.request!.item!;

  const requestData = request.request;

  const requestFullfilled = requestData
    ? requestData.filledQuantity >= requestData.quantity
    : false;

  return (
    <>
      <div
        className={`flex w-full mb-4 flex-col items-${isOwn ? "end" : "start"}`}
        key={request.requestId || request.id}
      >
        <div
          className={`relative w-full flex flex-col ${
            isOwn ? "items-end" : "items-start"
          }`}
        >
          <Card
            className={`max-w-xs w-full shadow-lg border-none ${
              isOwn ? "bg-[#9f7444]" : "bg-[#654827]"
            }`}
          >
            <CardContent className="flex flex-col gap-2 p-3">
              {requestor.avatarUrl && (
                <div className="flex w-full items-center">
                  <div
                    className={`flex flex-row justify-between w-full mb-2 items-center`}
                  >
                    <div
                      className={`flex items-center gap-2 flex-row ${
                        isOwn ? "flex-row-reverse ml-auto" : "flex-row"
                      }`}
                    >
                      <LeaderboardUserAvatar
                        pfpUrl={requestor.avatarUrl}
                        size={{ width: 6, height: 6 }}
                        borderSize={2}
                        username={requestor.username}
                      />
                      <div
                        className={`flex flex-col ${
                          isOwn ? "text-right" : "text-left"
                        }`}
                      >
                        <span className="text-xs text-white/80">
                          {isOwn ? "You" : requestor.username}
                        </span>
                      </div>
                    </div>
                    {!isOwn && !requestFullfilled && type !== "ask" && (
                      <button
                        className="bg-[#f2a311] text-white text-xs py-1 px-3 rounded hover:bg-[#f2a311]/80 transition-colors ml-auto"
                        onClick={() => setShowRequestModal(true)}
                      >
                        Donate
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="flex flex-row items-center gap-3 w-full">
                {type === "request" && requestData ? (
                  <>
                    <Image
                      src={
                        itemData.icon
                          ? `/images/${itemData.icon}`
                          : "/images/default-item.png"
                      }
                      alt={itemData.name || "Item"}
                      width={40}
                      height={40}
                      className="rounded"
                    />
                    <div className="flex flex-col w-full gap-2">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium text-white text-sm leading-none">
                          {itemData.name || "Unknown Item"}
                        </span>
                        <span className="text-xs text-white/80 leading-none">
                          ({requestData.filledQuantity}/{requestData.quantity})
                        </span>
                      </div>

                      <Progress
                        value={
                          ((requestData.filledQuantity || 0) /
                            requestData.quantity) *
                          100
                        }
                        className="bg-[#7e4e31]"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <Image
                      src={
                        itemData.icon
                          ? `/images/${itemData.icon}`
                          : "/images/default-item.png"
                      }
                      alt={itemData.name || "Item"}
                      width={40}
                      height={40}
                      className="rounded"
                    />
                    <div className="flex flex-col w-full">
                      <span className="font-medium text-white text-xs leading-relaxed">
                        {`I need to donate ${request.quantity} ${
                          itemData.name || "Unknown Item"
                        }. Please ask!`}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <span className="text-xs text-white/60 mt-2">
          {new Date(request.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {showRequestModal && request.requestId && (
        <RequestModal
          onClose={() => {
            refetchClanData();
            setShowRequestModal(false);
          }}
          id={request.requestId}
        />
      )}
    </>
  );
};
