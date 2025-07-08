import sdk from "@farcaster/frame-sdk";
import { motion } from "motion/react";
import Image from "next/image";

export const BotBlocker = () => {
  return (
    <main className="h-screen w-screen max-w-md mx-auto overflow-hidden">
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
          <motion.h1
            animate={{
              color: ["#fcd34d", "#eab308", "#fcd34d"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="text-xl xs:text-2xl font-bold text-center"
          >
            Unauthorized Tractor Activity
          </motion.h1>

          <motion.h2
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="text-sm xs:text-md text-[#efd88c] font-bold text-center"
          >
            Farville is for farmers, not scripts.
          </motion.h2>
          <p className="text-white/90 text-xs xs:text-sm text-center leading-relaxed">
            If you&apos;re a bot, please log off and let the crops grow in
            peace.
          </p>
          <p className="text-white/90 text-xs xs:text-sm text-center leading-relaxed">
            If you&apos;re a human and believe this is a mistake, please contact
            us so we can get you back on the farm.
          </p>

          <button
            className="bg-[#FFB938] text-[#7E4E31] px-4 py-2 rounded-lg font-bold 
                           hover:bg-[#ffc661] transition-colors text-xs xs:text-sm"
            onClick={() => {
              sdk.actions.openUrl(
                "https://farcaster.xyz/~/inbox/create/262800"
              );
            }}
          >
            Contact Support
          </button>
        </motion.div>
      </div>
    </main>
  );
};
