import { useGame } from "@/context/GameContext";
import MyClanTabs, { Tab } from "./my-clan-tabs";
import { useState } from "react";
import { useClan } from "@/hooks/use-clan";
import ClanMembers from "./clan-members";
import ClanJoinRequests from "./clan-join-requests";
import { useClanJoinRequests } from "@/hooks/use-clan-join-requests";
import { ClanRole } from "@/lib/types/game";
import { ClanDetail } from "./clan-detail";
import ClanRequests from "./clan-requests";
import { ClanQuests } from "./clan-quests";

export default function MyClan() {
  const { state } = useGame();

  const [activeTab, setActiveTab] = useState<Tab>("members");

  const {
    clanData,
    isLoading,
    refetch: refetchClanData,
  } = useClan(state.clan?.clanId);

  // Check if user can manage requests (leader or officer)
  const canManageRequests =
    state.clan?.role === ClanRole.Leader ||
    state.clan?.role === ClanRole.Officer;

  // Get join requests if user can manage them
  const { requests: joinRequests } = useClanJoinRequests(
    canManageRequests ? state.clan?.clanId : undefined
  );

  const membersMap = Object.fromEntries(
    clanData?.members?.map((m) => [m.fid, m.user]) ?? []
  );

  return (
    <div className="flex flex-col items-center justify-center w-full pb-8 gap-2">
      <ClanDetail clanData={clanData} refetchClan={refetchClanData} />

      <MyClanTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingRequestsCount={joinRequests?.length || 0}
        canManageRequests={canManageRequests}
      />

      {activeTab === "members" && !isLoading && clanData && (
        <ClanMembers
          members={clanData.members}
          clanId={clanData.id}
          onMemberUpdate={refetchClanData}
        />
      )}

      {activeTab === "quests" && !isLoading && clanData && <ClanQuests />}

      {activeTab === "newcomers" && !isLoading && clanData && (
        <div className="w-full max-w-2xl">
          <ClanJoinRequests
            clanId={clanData.id}
            refetchClanData={refetchClanData}
          />
        </div>
      )}

      {activeTab === "requests" && !isLoading && clanData && (
        <ClanRequests
          requests={clanData.requests.map((req) => ({
            ...req,
            user: membersMap[req.fid],
          }))}
          viewerFid={state.user.fid}
          refetchClanData={refetchClanData}
        />
      )}
    </div>
  );
}
