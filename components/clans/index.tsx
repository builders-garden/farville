import { useFrameContext } from "@/context/FrameContext";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import MainClanTabs, { Tab as MainTab } from "./main-tabs";
import MyClan from "./my-clan";
import CreateClanModal from "./create-clan-modal";
import { useGame } from "@/context/GameContext";
import { SearchClan } from "./search-clan";
import ClanOutgoingRequests from "./clan-outgoing-requests";
import { useApiQuery } from "@/hooks/use-api-query";
import { ClanJoinRequestWithClan } from "@/lib/prisma/types";

interface ClansModalProps {
  onClose: () => void;
}

export default function ClansModal({ onClose }: ClansModalProps) {
  const { safeAreaInsets } = useFrameContext();
  const { state, refetch } = useGame();
  const userHasClan = Boolean(state.clan);
  const userFid = state.user?.fid;

  const [mainActiveTab, setMainActiveTab] = useState<MainTab>(
    userHasClan ? "feud" : "search"
  );
  const [showCreateClanModal, setShowCreateClanModal] = useState(false);

  // Reference to store the search clan refetch function
  const searchClansRefetchRef = useRef<(() => void) | null>(null);

  // Get outgoing join requests if user doesn't have a clan
  const { data: outgoingRequests = [], refetch: refetchOutgoingRequests } =
    useApiQuery<ClanJoinRequestWithClan[]>({
      queryKey: ["outgoing-join-requests", userFid],
      url: userFid && !userHasClan ? `/api/user/clan-requests` : "",
      isProtected: true,
      enabled: !!userFid && !userHasClan,
    });

  useEffect(() => {
    setMainActiveTab(userHasClan ? "feud" : "search");
  }, [state.clan, userHasClan]);

  // Function to handle successful clan creation
  const handleClanCreationSuccess = () => {
    // Refresh all game state to ensure we get updated clan data
    refetch.userClan();

    // Also refresh the clans list in the search tab to show the newly created clan
    if (searchClansRefetchRef.current) {
      searchClansRefetchRef.current();
    }

    // Note: The TypeScript declaration in GameContext is missing the 'clan' property
    // but it exists in the implementation in use-game-state.tsx
    // We could also use (refetch as any).clan() if needed for specific clan refresh
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start z-50">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        style={{
          marginTop: safeAreaInsets.top,
          marginBottom: safeAreaInsets.bottom,
          marginLeft: safeAreaInsets.left,
          marginRight: safeAreaInsets.right,
        }}
        className="bg-[#7e4e31] w-full h-full flex flex-col"
      >
        {/* Header with Stage Info */}
        <div className="flex flex-col items-start justify-between p-3 xs:p-4 mt-2 border-b border-[#8B5c3C] gap-1">
          <div className="flex w-full items-center justify-between">
            <motion.h2
              className="text-white/90 font-bold text-base xs:text-lg mb-1 flex items-center gap-2"
              animate={{ rotate: [0, -3, 3, 0] }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 5,
              }}
            >
              <span className="text-xl">🛡️</span>
              Feuds
            </motion.h2>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full 
                    bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-white/70 text-xs">
              Farming together is more fun!
            </p>
          </div>
        </div>

        <div className="flex flex-col px-4 py-2 flex-1 overflow-y-auto no-scrollbar">
          <MainClanTabs
            setActiveTab={setMainActiveTab}
            activeTab={mainActiveTab}
            userHasClan={userHasClan}
            outgoingRequestsCount={outgoingRequests?.length || 0}
          />

          {mainActiveTab === "feud" && <MyClan />}
          {mainActiveTab === "search" && (
            <SearchClan
              refetchOutgoingRequests={refetchOutgoingRequests}
              setSearchRefetch={searchClansRefetchRef}
            />
          )}
          {mainActiveTab === "outgoing" && <ClanOutgoingRequests />}
        </div>

        {/* Floating Create Clan Button */}
        {!userHasClan && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateClanModal(true)}
            className="fixed bottom-6 right-6 px-4 py-2 rounded-full bg-[#FFB938] text-[#7E4E31] 
                    flex items-center justify-center gap-2 shadow-lg hover:bg-[#ffc65c] transition-colors z-10"
            aria-label="Create Clan"
          >
            <Plus size={20} />
            <span className="font-medium text-xs">Create Clan</span>
          </motion.button>
        )}

        {/* Create Clan Modal */}
        {showCreateClanModal && (
          <CreateClanModal
            onClose={() => setShowCreateClanModal(false)}
            onSuccess={handleClanCreationSuccess}
            refetchClan={refetch.userClan}
          />
        )}
      </motion.div>
    </div>
  );
}
