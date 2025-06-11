import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { LeaderboardUserAvatar } from "./leaderboard/LeaderboardUserAvatar";
import { Progress } from "./ui/progress";
import RequestModal from "./RequestModal";

export interface RequestChatCardProps {
  isOwn: boolean;
  requestId: string;
  username: string;
  avatarUrl?: string;
  itemName: string;
  itemImageUrl?: string;
  quantity: number;
  missing: number;
  createdAt: Date;
  refetchClanData: () => void;
}

export const RequestChatCard: React.FC<RequestChatCardProps> = ({
  isOwn,
  username,
  requestId,
  avatarUrl,
  itemName,
  itemImageUrl,
  quantity,
  missing,
  createdAt,
  refetchClanData,
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false);

  return (
    <>
      <div
        className={`flex w-full mb-4 flex-col items-${isOwn ? "end" : "start"}`}
      >
        <div
          className={`relative w-full flex ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
          <Card
            className={`max-w-xs w-full shadow-lg border-none p-2 ${
              isOwn ? "bg-[#9f7444]" : "bg-[#654827]"
            }`}
          >
            <CardContent className="flex flex-row items-center gap-3 p-2">
              {itemImageUrl && (
                <Image
                  src={itemImageUrl}
                  alt={itemName}
                  width={40}
                  height={40}
                  className="rounded"
                />
              )}
              <div className="flex flex-col w-full gap-2">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium text-white text-sm leading-none">
                    {itemName}
                  </span>
                  <span className="text-xs text-white/80 leading-none">
                    ({quantity - missing}/{quantity})
                  </span>
                </div>

                <div className="flex flex-row items-end text-white/90 w-full gap-2">
                  <Progress
                    value={((quantity - missing) / quantity) * 100}
                    className="bg-[#7e4e31]"
                  />
                </div>
                {!isOwn && missing > 0 && (
                  <button
                    className="bg-[#f2a311] text-white text-xs py-1 px-3 rounded hover:bg-[#f2a311]/80 transition-colors ml-auto w-fit"
                    onClick={() => setShowRequestModal(true)}
                    disabled={missing <= 0}
                  >
                    Donate
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        {avatarUrl && (
          <div
            className={`mt-3 pl-1 flex ${
              isOwn ? "justify-end" : "justify-start"
            } w-full items-center`}
          >
            <div
              className={`flex gap-2 items-center ${
                isOwn ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <LeaderboardUserAvatar
                pfpUrl={avatarUrl}
                size={{ width: 8, height: 8 }}
                borderSize={2}
                username={username}
              />
              <div
                className={`flex flex-col ${
                  isOwn ? "text-right" : "text-left"
                }`}
              >
                <span className={`text-xs text-white/80`}>
                  {isOwn ? "You" : username}
                </span>
                <span className="text-xs text-white/60">
                  {new Date(createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showRequestModal && (
        <RequestModal
          onClose={() => {
            refetchClanData();
            setShowRequestModal(false);
          }}
          id={requestId}
        />
      )}
    </>
  );
};
