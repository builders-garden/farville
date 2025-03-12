import { motion } from "framer-motion";
import Image from "next/image";

interface MintOgModalProps {
  onCancel: () => void;
}

export default function MintOgModal({ onCancel }: MintOgModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 100 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          transition: {
            type: "spring",
            damping: 15,
            stiffness: 200,
          },
        }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        className="bg-[#7E4E31] p-6 rounded-lg max-w-sm w-full mx-4 border border-[#8B5E3C]/50 
                  [box-shadow:0_0_50px_rgba(234,179,8,0.3)]"
      >
        <div className="flex flex-row items-center gap-2 mb-4">
          <h3 className={`text-white/90 font-bold text-lg`}>Mint OG Badge</h3>
        </div>
        <div className="flex flex-col gap-4 my-4">
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(234,179,8,0.5)",
                "0 0 50px rgba(234,179,8,0.8)",
                "0 0 20px rgba(234,179,8,0.5)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`relative mx-auto w-56 h-56 rounded-xl
                       [animation:float_2s_ease-in-out_infinite]
                       before:absolute before:bg-yellow-400/20 
                       before:rounded-xl before:[animation:pulse_2s_ease-in-out_infinite]
                       after:absolute after:rounded-lg border-8 border-yellow-400/40 
                       after:[animation:border-pulse_2s_ease-in-out_infinite]`}
          >
            <Image
              src={`/images/badge/og.png`}
              alt={`OG Badge Minting`}
              layout="fill"
              className="rounded-lg [animation:rotate_20s_linear_infinite] 
                       [filter:drop-shadow(0_0_10px_rgba(234,179,8,0.5))]"
            />
          </motion.div>
          <button
            onClick={() => {
              console.log("missing implementation");
            }}
            className="flex-1 py-2 px-4 rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30
                      transition-colors text-sm font-medium border border-yellow-500/30 flex items-center justify-center gap-2"
          >
            Mint
          </button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 rounded bg-white/10 text-white/90 hover:bg-white/20 
                     transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
