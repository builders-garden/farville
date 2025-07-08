import { motion } from "motion/react";
import { useClans } from "@/hooks/use-clans";
import { Search } from "lucide-react";
import { Clan } from "@prisma/client";
import { useState, useEffect, useCallback, useRef } from "react";
import ClanDetailModal from "./clan-detail-modal";
import { ClanView } from "./clan-view";
import { ClanStatus } from "./clan-status";
import { ClanImage } from "./clan-image";

interface ClanWithDetails extends Clan {
  memberCount?: number;
  level?: number;
}

interface SearchClanProps {
  refetchOutgoingRequests?: () => void;
  setSearchRefetch?: React.MutableRefObject<(() => void) | null>;
  isViewingClan: boolean;
  setIsViewingClan: (isViewing: boolean) => void;
}

export const SearchClan = ({
  refetchOutgoingRequests,
  setSearchRefetch,
  isViewingClan,
  setIsViewingClan,
}: SearchClanProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedClan, setSelectedClan] = useState<ClanWithDetails | null>(
    null
  );

  const { items: clans, isLoading, refetch } = useClans(searchValue, undefined);

  // Handle debounced search
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        refetch();
      }, 300);
    },
    [refetch]
  );

  const handleViewClan = () => {
    setIsViewingClan(true);
  };

  useEffect(() => {
    // Store the refetch function in the parent component if the ref is provided
    if (setSearchRefetch && refetch) {
      setSearchRefetch.current = refetch;
    }

    // Cleanup on unmount
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      // Clear the ref on unmount if it was set
      if (setSearchRefetch && setSearchRefetch.current === refetch) {
        setSearchRefetch.current = null;
      }
    };
  }, [setSearchRefetch, refetch]);

  // Add member count and level info to clan data, then sort by member count (ascending)
  // Special clan ID that should always appear last
  const foundersClan = "70800afa-90ed-4e48-baa1-ae1c0e27ff6f";

  const clansWithDetails: ClanWithDetails[] =
    clans
      ?.map((clan) => ({
        ...clan,
        memberCount: clan.members.length,
      }))
      .sort((a, b) => {
        // Special clan always goes last
        if (a.id === foundersClan) return 1;
        if (b.id === foundersClan) return -1;

        // For all other clans, sort by member count (ascending)
        return (a.memberCount || 0) - (b.memberCount || 0);
      }) || [];

  // Format XP for display
  const formatXP = (xp: number): string => {
    if (xp >= 1000000) {
      return `${(xp / 1000000).toFixed(2)}M XP`;
    } else if (xp >= 1000) {
      return `${(xp / 1000).toFixed(1)}K XP`;
    } else {
      return `${xp} XP`;
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Search Bar - Always visible */}
      {!isViewingClan && (
        <div className="flex items-center bg-[#6D4C2C] rounded-lg p-2 mb-3 border border-[#8B5E3C]/50">
          <Search size={16} className="text-white/70 mr-2" />
          <input
            type="text"
            placeholder="Clan Name..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-sm"
          />
        </div>
      )}

      {/* Content area that changes based on loading or results */}
      {isLoading ? (
        <div className="flex justify-center items-center p-4">
          <div className="animate-pulse text-white/70">Loading clans...</div>
        </div>
      ) : clansWithDetails.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-4 text-white/70">
          <p>
            No clans found
            {searchValue ? ` matching "${searchValue}"` : ""}.
          </p>
          {searchValue ? (
            <p className="text-xs mt-2">Try a different search term.</p>
          ) : (
            <p className="text-xs mt-2">Be the first to create a clan!</p>
          )}
        </div>
      ) : (
        <div
          className={`flex flex-col gap-2 overflow-y-auto no-scrollbar py-2 pr-1 -mr-2 overflow-x-hidden w-full ${
            isViewingClan ? "" : "max-h-[60vh]"
          }`}
          style={{ minHeight: "0" }}
        >
          {
            /* If viewing a clan, show the clan view */
            selectedClan && isViewingClan ? (
              <ClanView
                clanId={selectedClan.id}
                onClose={() => {
                  setIsViewingClan(false);
                }}
              />
            ) : (
              clansWithDetails.map((clan) => (
                <motion.div
                  key={clan.id}
                  className="bg-[#6D4C2C] rounded-xl overflow-hidden shadow-md border border-[#8B5E3C]/50 cursor-pointer hover:border-[#FFB938]/50 transition-all w-full flex-shrink-0"
                  whileHover={{
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedClan(clan)}
                >
                  <div className="flex flex-col p-3 w-full">
                    {/* Row 1: Clan Name / Open-Closed Status */}
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-white font-medium text-sm">
                        {clan.name}
                      </h3>
                      <div className="flex items-center text-xs text-white/70">
                        <ClanStatus isPublic={clan.isPublic} />
                      </div>
                    </div>

                    {/* Row 2: Image on left, stats on right */}
                    <div className="flex gap-3">
                      {/* Left - Clan Image */}
                      <ClanImage
                        imageUrl={clan.imageUrl}
                        clanName={clan.name}
                      />

                      {/* Right - Stats */}
                      <div className="flex-1 flex flex-col justify-center">
                        {/* Stats Row 1: Level / XP */}
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-white/80">
                            Members
                          </span>
                          <span className="text-[10px] text-white/80">
                            {clan.memberCount}/{clan.maxMembers}
                          </span>
                        </div>

                        {/* Stats Row 2: Required Level / Members */}
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] text-white/80">
                            Experience
                          </span>
                          <span className="text-[9px] text-white/90">
                            {formatXP(clan.xp || 0)}
                          </span>
                        </div>

                        {/* Stats Row 3: Clan Level */}
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] text-white/80">
                            Required Level
                          </span>
                          <span className="text-[9px] text-white/90">
                            {clan.requiredLevel ? clan.requiredLevel : "None"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )
          }
        </div>
      )}

      {/* Clan Detail Modal */}
      {selectedClan && !isViewingClan && (
        <ClanDetailModal
          clan={selectedClan}
          onClose={() => setSelectedClan(null)}
          refetchClans={refetch}
          refetchOutgoingRequests={refetchOutgoingRequests}
          onClickView={handleViewClan}
        />
      )}
    </div>
  );
};
