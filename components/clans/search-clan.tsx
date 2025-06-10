import Image from "next/image";
import { motion } from "framer-motion";
import { useClan } from "@/hooks/use-clan";
import { Lock, Unlock, Search } from "lucide-react";
import { Clan } from "@prisma/client";
import { useState, useEffect, useCallback, useRef } from "react";
import ClanDetailModal from "./clan-detail-modal";

interface ClanWithDetails extends Clan {
  memberCount?: number;
  level?: number;
  requiredLevel?: number;
}

export const SearchClan = () => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedClan, setSelectedClan] = useState<ClanWithDetails | null>(
    null
  );
  const { items: clans, isLoading, refetch } = useClan(searchValue, undefined);

  // Handle debounced search
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      refetch();
    }, 300);
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Mock clan details that would come from the backend
  const clansWithDetails: ClanWithDetails[] =
    clans?.map((clan) => ({
      ...clan,
      memberCount: 12,
      level: 2,
      requiredLevel: 2,
    })) || [];

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
      <div className="flex items-center bg-[#6D4C2C] rounded-lg p-2 mb-3 border border-[#8B5E3C]/50">
        <Search
          size={16}
          className="text-white/70 mr-2"
        />
        <input
          type="text"
          placeholder="Clan Name..."
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-sm"
        />
      </div>

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
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh] py-2 pr-1 -mr-2 overflow-x-hidden w-full">
          {clansWithDetails.map((clan) => (
            <motion.div
              key={clan.id}
              className="bg-[#6D4C2C] rounded-xl overflow-hidden shadow-md border border-[#8B5E3C]/50 cursor-pointer hover:border-[#FFB938]/50 transition-all w-full"
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
                    {clan.isPublic ? (
                      <Unlock
                        size={14}
                        className="mr-1"
                      />
                    ) : (
                      <Lock
                        size={14}
                        className="mr-1"
                      />
                    )}
                  </div>
                </div>

                {/* Row 2: Image on left, stats on right */}
                <div className="flex">
                  {/* Left - Clan Image */}
                  <div className="relative w-16 h-16 rounded-md border-2 border-[#8B5E3C] overflow-hidden mr-3 bg-[#5A4129] flex items-center justify-center shadow-inner">
                    {clan.imageUrl ? (
                      <Image
                        src={clan.imageUrl}
                        alt={clan.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-lg">🛡️</span>
                    )}
                    {/* Status indicator - yellow for open, locked for closed */}
                    {clan.isPublic && (
                      <div className="absolute top-0 right-0 w-3 h-3 bg-[#FFB938] rounded-full border border-[#8B5E3C]" />
                    )}
                  </div>

                  {/* Right - Stats */}
                  <div className="flex-1 flex flex-col justify-center">
                    {/* Stats Row 1: Level / XP */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#FFB938]">
                        LVL {clan.level}
                      </span>
                      <span className="text-[10px] text-white/80">
                        {formatXP(clan.xp || 0)}
                      </span>
                    </div>

                    {/* Stats Row 2: Required Level / Members */}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-white/80">
                        Required Lvl: {clan.requiredLevel}
                      </span>
                      <span className="text-[9px] text-white/90">
                        {clan.memberCount}/{clan.maxMembers}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Clan Detail Modal */}
      {selectedClan && (
        <ClanDetailModal
          clan={selectedClan}
          onClose={() => setSelectedClan(null)}
          refetchClans={refetch}
        />
      )}
    </div>
  );
};
