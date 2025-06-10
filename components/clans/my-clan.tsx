import { useGame } from "@/context/GameContext";

import MyClanTabs, { Tab } from "./my-clan-tabs";
import { useState } from "react";
import { useClan } from "@/hooks/use-clan";
import ClanMembers from "./clan-members";
import { ClanDetail } from "./clan-detail";
import ClanRequests from "./clan-requests";
import ClanNewcomers from "./clan-newcomers";

export default function MyClan() {
  const { state } = useGame();

  const [activeTab, setActiveTab] = useState<Tab>("members");

  const { clanData, isLoading } = useClan(state.clan?.clanId);

  console.log("Clan Data:", clanData);

  const membersMap = Object.fromEntries(
    clanData?.members?.map((m) => [m.fid, m.user]) ?? []
  );

  return (
    <div className="flex flex-col items-center justify-center w-full pb-8 gap-2">
      <ClanDetail clanData={clanData!} />

      <MyClanTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "members" && !isLoading && clanData && (
        <ClanMembers members={clanData.members} />
      )}

      {activeTab === "requests" && !isLoading && clanData && (
        <ClanRequests
          requests={clanData.requests.map((req) => ({
            ...req,
            user: membersMap[req.request.fid],
          }))}
          viewerFid={state.user.fid}
        />
      )}

      {activeTab === "newcomers" && !isLoading && clanData && (
        <ClanNewcomers
          requestsToJoin={clanData.joinRequests}
          membersCount={clanData.members.length}
        />
      )}
    </div>
  );
}
