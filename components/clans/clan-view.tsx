import { useClan } from "@/hooks/use-clan";
import { ClanDetail } from "./clan-detail";
import ClanMembers from "./clan-members";
import { ArrowLeft } from "lucide-react";

interface ClanViewProps {
  clanId: string;
  onClose: () => void;
}

export function ClanView({ clanId, onClose }: ClanViewProps) {
  const { clanData, isLoading, refetch: refetchClanData } = useClan(clanId);

  return (
    <div className="flex flex-col w-full pb-8 gap-2">
      <button
        onClick={onClose}
        className="flex items-center px-4 py-2 rounded-lg text-white text-sm w-fit border-2 border-white/40"
      >
        <ArrowLeft size={16} className="inline mr-2" />
        Back
      </button>
      {isLoading ? (
        <div className="flex justify-center items-center p-4">
          <div className="animate-pulse text-white/70">Loading clan...</div>
        </div>
      ) : !clanData ? (
        <div className="flex flex-col items-center justify-center p-4 text-white/70">
          <p>Clan not found.</p>
        </div>
      ) : (
        <>
          <ClanDetail clanData={clanData} refetchClan={refetchClanData} />

          <ClanMembers
            members={clanData.members}
            clanId={clanData.id}
            onMemberUpdate={refetchClanData}
          />
        </>
      )}
    </div>
  );
}
