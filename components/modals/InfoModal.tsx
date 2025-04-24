import { motion } from "framer-motion";
import Image from "next/image";

interface InfoModalProps {
  title: string;
  icon?: React.ReactNode;
  onCancel: () => void;
  options?: {
    titleColor?: string;
    messageColor?: string;
  };
  children: React.ReactNode;
}

export default function InfoModal({
  title,
  icon,
  children,
  onCancel,
  options,
}: InfoModalProps) {
  return (
    <div className="fixed inset-0 max-w-md mx-auto bg-black/50 flex items-center justify-center z-[60]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#7E4E31] p-4 rounded-lg max-w-sm w-full mx-4 border border-[#8B5E3C]/50"
      >
        <div className="flex flex-row items-center gap-2 mb-4">
          {
            // if icon is a string, render an image
            typeof icon === "string" ? (
              <Image src={icon} alt={title} width={24} height={24} />
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
        </div>
        {children}
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
    </div>
  );
}
