import { motion } from "framer-motion";
import Image from "next/image";

interface AchievementBadgeModalProps {
  title: string;
  icon?: React.ReactNode;
  onCancel: () => void;
  onShare?: () => void;
  options?: {
    titleColor?: string;
    messageColor?: string;
  };
  children: React.ReactNode;
  mintable?: boolean;
  shareable?: boolean;
}

export default function AchievementBadgeModal({
  title,
  icon,
  children,
  onCancel,
  onShare,
  options,
  mintable,
  shareable,
}: AchievementBadgeModalProps) {
  return (
    <div className="fixed inset-0 max-w-md mx-auto bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-[#7E4E31] to-[#6a4229] p-6 rounded-lg max-w-sm w-full mx-4 border border-[#8B5E3C]/50 shadow-xl"
      >
        <motion.div
          className="flex flex-row justify-center items-center gap-2 mb-4"
          initial={{ y: -5 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {
            // if icon is a string, render an image
            typeof icon === "string" ? (
              <Image
                src={icon}
                alt={title}
                width={24}
                height={24}
                className="animate-pulse-slow"
              />
            ) : (
              // if icon is a React component, render it
              icon
            )
          }
          <h3
            className={`
            ${options?.titleColor || "text-white/90"} font-bold text-lg`}
          >
            {title}
          </h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>

        <div className="flex gap-3 mt-4">
          {mintable && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              className="flex-1 py-2 px-4 rounded bg-gradient-to-r from-yellow-500/70 to-yellow-600/70 text-white/90 transition-all text-sm font-medium hover:shadow-md hover:shadow-yellow-800/30 hover:from-yellow-500/80 hover:to-yellow-600/80"
            >
              Mint
            </motion.button>
          )}
          {shareable && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onShare}
              className="flex-1 py-2 px-4 rounded bg-gradient-to-r from-[#f2a311]/70 to-[#e09006]/70 text-white/90 transition-all text-sm font-medium hover:shadow-md hover:shadow-[#e09006]/30 hover:from-[#f2a311]/80 hover:to-[#e09006]/80"
            >
              Share
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="flex-1 py-2 px-4 rounded bg-white/10 text-white/90 hover:bg-white/20 hover:shadow-inner
                     transition-all text-sm font-medium"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
