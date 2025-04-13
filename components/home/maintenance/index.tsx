import { motion } from "framer-motion";
import Image from "next/image";
import { CountdownTimer } from "./countdown-timer";

export const Maintenance = ({ maintenanceEnd }: { maintenanceEnd: Date }) => {
  return (
    <main className="h-screen w-screen overflow-hidden">
      <div className="fixed inset-0">
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
        <div className="absolute inset-0 bg-black/70" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col relative z-10 p-6 py-8 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl max-w-md gap-6"
        >
          <motion.h2
            animate={{
              color: ["#4ade80", "#22c55e", "#4ade80"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="text-2xl font-bold text-center"
          >
            {new Date() > maintenanceEnd
              ? "Maintenance Complete!"
              : "Ongoing Maintenance"}
          </motion.h2>

          <p className="text-white/90 text-sm text-center leading-relaxed">
            The Weekly Leaderboard is resetting. Meanwhile, pls throw some memes
            on Farcaster.
          </p>
          <CountdownTimer maintenanceEnd={maintenanceEnd} />
        </motion.div>
      </div>
    </main>
  );
};
