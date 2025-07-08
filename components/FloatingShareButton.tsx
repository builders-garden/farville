import { motion } from "motion/react";
import { Share2 } from "lucide-react";

export const FloatingShareButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 px-3 h-10 rounded-full bg-[#FFB938] text-[#5c4121] 
                 flex items-center justify-center gap-2 shadow-lg hover:bg-[#ffc65c] transition-colors
                 z-50 text-xs"
    >
      Share
      <Share2 size={16} />
    </motion.button>
  );
};
