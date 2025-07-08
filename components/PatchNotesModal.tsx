import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

interface PatchNotesModalProps {
  onClose: () => void;
}

export default function PatchNotesModal({ onClose }: PatchNotesModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 max-w-md mx-auto bg-black/50 flex items-center justify-center z-[99] p-4 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg p-4 sm:p-6 max-w-lg w-full mx-auto relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700"
          >
            <X size={20} className="sm:w-6 sm:h-6 w-5 h-5" />
          </button>

          <h2 className="text-xl sm:text-2xl font-bold mt-2 sm:mt-4 mb-3 sm:mb-4">
            Patch Note
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <p className="text-sm sm:text-base text-gray-700">Apr 12th</p>
            <ul className="text-xs sm:text-sm list-disc list-inside space-y-1.5 sm:space-y-2 text-gray-700">
              <li>
                Yesterday we had to go offline for a bit to fix a sneaky
                leaderboard bug
              </li>
              <li>
                We rolled the game back to{" "}
                <span className="text-red-500">2AM UTC (Apr 11th)</span>
              </li>
              <li>
                Any progress made between{" "}
                <span className="text-red-500">2AM</span> and{" "}
                <span className="text-red-500">11PM UTC (Apr 11)</span> is now
                lost in the multiverse
              </li>
              <li>
                To make up for it,{" "}
                <span className="text-green-500">
                  all players received extra fertilizers
                </span>{" "}
                based on their grid size —{" "}
                <span className="text-blue-500">to help speed things up!</span>
              </li>
              <li>The leaderboard is now fair and functioning</li>
              <li>
                Farville is back online and stable — time to jump back in!
              </li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
