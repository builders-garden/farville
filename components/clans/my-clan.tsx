import { useGame } from "@/context/GameContext";
import MyClanTabs, { Tab } from "./my-clan-tabs";
import { useState } from "react";
import { useClan } from "@/hooks/use-clan";
import ClanMembers from "./clan-members";
import ClanJoinRequests from "./clan-join-requests";
import { useClanJoinRequests } from "@/hooks/use-clan-join-requests";
import { ClanRole } from "@/lib/types/game";
import { ClanDetail } from "./clan-detail";
import { FloatingShareButton } from "../FloatingShareButton";
import { ClanQuests } from "./clan-quests";
import { useClanQuests } from "@/hooks/clan/use-clan-quests";
import ClanShareModal from "./clan-share-modal";
import { ClanChat } from "./clan-chat";

export default function MyClan() {
  const { state } = useGame();

  const [activeTab, setActiveTab] = useState<Tab>("members");
  const [showShareModal, setShowShareModal] = useState(false);

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

  const { quests: clanQuests, refetch: refetchClanQuests } = useClanQuests(
    state.clan?.clanId,
    "incomplete"
  );

  const { quests: completedClanQuests, refetch: refetchCompletedClanQuests } =
    useClanQuests(state.clan?.clanId, "completed");

  const membersMap = Object.fromEntries(
    clanData?.members?.map((m) => [m.fid, m.user]) ?? []
  );

  const handleShareClan = async () => {
    if (!clanData) return;
    setShowShareModal(true);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center w-full gap-2 ${
        activeTab === "chat" ? "pb-4" : "pb-8"
      }`}
    >
      <ClanDetail
        clanData={clanData}
        refetchClan={refetchClanData}
        fullHeight={activeTab === "members"}
      />

      <MyClanTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingRequestsCount={joinRequests?.length || 0}
        canManageRequests={canManageRequests}
        hasUnfulfilledRequests={state.hasUnfulfilledClanRequests}
      />

      {activeTab === "members" && !isLoading && clanData && (
        <ClanMembers
          members={clanData.members}
          clanId={clanData.id}
          onMemberUpdate={refetchClanData}
          maxMembers={clanData.maxMembers}
        />
      )}

      {activeTab === "quests" && !isLoading && clanData && (
        <ClanQuests
          activeQuests={clanQuests}
          completedQuests={completedClanQuests}
          refetchActiveQuests={refetchClanQuests}
          refetchCompletedQuests={refetchCompletedClanQuests}
          refetchClanData={refetchClanData}
        />
      )}

      {activeTab === "chat" && !isLoading && clanData && (
        <ClanChat
          clanId={clanData.id}
          requests={clanData.requests.map((req) => ({
            ...req,
            user: membersMap[req.fid],
          }))}
          refetchClanData={refetchClanData}
          members={clanData.members}
        />
      )}

      {activeTab === "newcomers" && !isLoading && clanData && (
        <div className="w-full max-w-2xl">
          <ClanJoinRequests
            clanId={clanData.id}
            refetchClanData={refetchClanData}
            isAtCapacity={clanData.members.length >= clanData.maxMembers}
          />
        </div>
      )}

      {/* Floating Share Button */}
      {clanData && activeTab !== "chat" && (
        <FloatingShareButton onClick={handleShareClan} />
      )}

      {/* Clan Share Modal */}
      {showShareModal && clanData && (
        <ClanShareModal
          clanId={clanData.id}
          clanName={clanData.name}
          userFid={state.user.fid}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
