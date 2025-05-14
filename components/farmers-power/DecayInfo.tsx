import { motion } from "framer-motion";

interface DecayInfoProps {
  minutesUntilDecay: number;
  timeUntilDecay: number;
  DECAY_INTERVAL: number;
}

export function DecayInfo({
  minutesUntilDecay,
  timeUntilDecay,
  DECAY_INTERVAL,
}: DecayInfoProps) {
  return (
    <div className="bg-[#5C4121]/50 rounded-xl p-4 w-full border border-red-400/20">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-white/90 text-sm font-semibold">
            Power Decay
          </span>
          <p className="text-red-400/90 text-xs mt-1">
            -1 point every 10 minutes
          </p>
        </div>
        <div className="text-right">
          <span className="text-red-400 text-base font-bold">
            {minutesUntilDecay}m
          </span>
          <p className="text-xs text-white/60">until next decay</p>
        </div>
      </div>
      <div className="w-full h-1 bg-white/10 rounded overflow-hidden mt-2">
        <motion.div
          className="h-full bg-red-400"
          initial={{ width: "100%" }}
          animate={{
            width: `${(timeUntilDecay / (DECAY_INTERVAL * 60 * 1000)) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
