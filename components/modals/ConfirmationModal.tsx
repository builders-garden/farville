import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmDisabled?: boolean;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmDisabled = false,
  isLoading = false,
}: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 max-w-md mx-auto bg-black/50 flex items-center justify-center z-[60]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#7E4E31] p-6 rounded-lg max-w-sm w-full mx-4 border border-[#8B5E3C]/50"
      >
        <h3 className="text-white/90 font-bold text-lg mb-2">{title}</h3>
        <p className="text-white/70 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 rounded bg-white/10 text-white/90 hover:bg-white/20 
                     transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 px-4 rounded bg-[#FFB938] text-[#7E4E31] hover:bg-[#ffc65c] 
                 transition-colors text-sm font-medium flex items-center justify-center ${
                   confirmDisabled || isLoading
                     ? "opacity-50 cursor-not-allowed hover:bg-[#FFB938]"
                     : ""
                 }`}
            disabled={confirmDisabled || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Leaving...</span>
              </>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
