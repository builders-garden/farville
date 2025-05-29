import { LeaderboardUserAvatar } from "@/components/leaderboard/LeaderboardUserAvatar";
import { motion } from "framer-motion";

interface TopDonorsProps {
  topDonors: {
    fid: number;
    username: string;
    avatarUrl?: string;
    selectedAvatarUrl?: string;
    mintedOG?: boolean;
  }[];
  onSelectUser: (fid: number) => void;
}

export const TopDonors = ({ topDonors, onSelectUser }: TopDonorsProps) => {
  return (
    <div className="flex flex-col gap-4 w-full bg-[#5C4121]/50 rounded-lg p-4 border border-yellow-400/20">
      <div className="text-white text-center font-semibold text-xs">
        Top Contributors
      </div>
      <div className="grid grid-cols-5 gap-2 place-items-center">
        {topDonors.map((donor, index) => (
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 1 + Math.random() * 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            key={donor.fid}
            onClick={() => onSelectUser(donor.fid)}
            className={`relative ${
              index === 0
                ? "ring-4 ring-yellow-400"
                : index === 1
                ? "ring-4 ring-gray-300"
                : index === 2
                ? "ring-4 ring-[#CD7F32]"
                : "ring-4 ring-white/30"
            } rounded-full cursor-pointer`}
          >
            {/* Aura effect behind each donor avatar with random scale animation */}
            <motion.span
              className="absolute inset-0 rounded-full -z-10"
              style={{
                boxShadow:
                  index === 0
                    ? "0 0 12px 6px rgba(251, 191, 36, 0.5), 0 0 24px 12px rgba(251, 191, 36, 0.2)"
                    : index === 1
                    ? "0 0 12px 6px rgba(209, 213, 219, 0.5), 0 0 24px 12px rgba(209, 213, 219, 0.2)"
                    : index === 2
                    ? "0 0 12px 6px rgba(205, 127, 50, 0.5), 0 0 24px 12px rgba(205, 127, 50, 0.2)"
                    : "0 0 8px 4px rgba(153, 153, 153, 0.25), 0 0 16px 8px rgba(111, 111, 111, 0.1)",
              }}
              animate={{
                scale: [1, Math.random() * 0.3 + 0.9, 1],
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <LeaderboardUserAvatar
              pfpUrl={donor.selectedAvatarUrl || donor.avatarUrl || ""}
              username={donor.username}
              isOgUser={donor.mintedOG}
              borderSize={0}
            />
          </motion.div>
        ))}
      </div>
      <div className="flex gap-4 justify-center mt-4">
        <button className="text-[10px] bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Show Love
        </button>
        <button className="text-[10px] bg-[#5C4121] hover:bg-[#4A331A] text-white font-bold py-2 px-4 rounded-lg border border-yellow-600/30 transition-colors">
          Leaderboard
        </button>
      </div>
    </div>
  );
};
