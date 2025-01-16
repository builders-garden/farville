"use client";
import { motion } from "framer-motion";
import { useFrameContext } from "../context/FrameContext";
import Image from "next/image";
import Link from "next/link";
import { ReferralLeaderboardEntry } from "../supabase/queries";

interface LeaderboardPageProps {
  leaderboard: ReferralLeaderboardEntry[];
}

export default function LeaderboardPage({ leaderboard }: LeaderboardPageProps) {
  const { safeAreaInsets } = useFrameContext();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        marginTop: safeAreaInsets.top,
        marginBottom: safeAreaInsets.bottom,
        marginLeft: safeAreaInsets.left,
        marginRight: safeAreaInsets.right,
      }}
      className="fixed inset-0 w-full h-full z-[100] flex flex-col items-center justify-center gap-2 bg-black"
    >
      {/* Full-screen background image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/welcome.png"
          alt="Background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={100}
        />
      </div>

      {/* Semi-transparent gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/10" />

      {/* Content container */}
      <div className="relative z-20 flex flex-col gap-2 w-full max-w-md p-4">
        {/* FarVille title */}
        <div className="flex flex-col text-center gap-2">
          <h1 className="text-white/90 text-3xl font-bold [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
            Leaderboard
          </h1>
          <p className="text-white/70 text-xs [text-shadow:_1px_1px_2px_rgb(0_0_0_/_50%)]">
            Share with friends to climb the ranks and receive rewards!
          </p>
        </div>
        <div className="flex gap-2 mt-4">
          <div className="w-full bg-black/30 backdrop-blur-sm rounded-lg p-2">
            <table className="w-full">
              <thead>
                <tr className="text-white/70 text-[10px] border-b border-white/20">
                  <th className="pb-2 text-left px-[6px]">Rank</th>
                  <th className="pb-2 text-left px-[6px]">User</th>
                  <th className="pb-2 text-right px-[6px]">Referred</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr
                    key={entry.fid}
                    className="text-white border-b border-white/10 last:border-0"
                  >
                    <td className="py-2 px-[6px]">
                      <div
                        className={`flex items-start text-xs ${
                          index + 1 === 1
                            ? "text-amber-400"
                            : index + 1 === 2
                            ? "text-gray-300"
                            : index + 1 === 3
                            ? "text-amber-700"
                            : "text-white"
                        }`}
                      >
                        <span>{index + 1}</span>
                        <sup className="text-[8px] ml-[2px] leading-[2]">
                          {index + 1 === 1
                            ? "st"
                            : index + 1 === 2
                            ? "nd"
                            : index + 1 === 3
                            ? "rd"
                            : "th"}
                        </sup>
                      </div>
                    </td>
                    <td className="py-2 px-[6px]">
                      <div className="flex items-center gap-2">
                        <div className="w-[1.6rem] h-[1.6rem] rounded-full overflow-hidden">
                          <Image
                            src={entry.avatarUrl || "/images/avatar.png"}
                            alt={entry.username}
                            width={32}
                            height={32}
                          />
                        </div>
                        <p className="text-[10px]">
                          {entry.username.length > 10
                            ? entry.username.substring(0, 10) + "..."
                            : entry.username}
                        </p>
                      </div>
                    </td>
                    <td className="py-2 text-right px-[6px] text-xs">
                      {entry.referralCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Referral leaderboard */}
      <Link href="/">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-4 left-4 z-30 transition-colors text-lg text-white [text-shadow:_0_0_20px_rgba(255,255,255,0.9)]"
        >
          Back
        </motion.button>
      </Link>
    </motion.div>
  );
}
