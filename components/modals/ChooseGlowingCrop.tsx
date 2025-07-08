import { UserItem } from "@/hooks/use-user-items";
import { motion } from "motion/react";
import Image from "next/image";

interface InfoModalProps {
  specialCrops: UserItem[];
  onChooseCrop: (crop: UserItem) => void;
  onCancel: () => void;
}

export default function ChooseGlowingCrop({
  specialCrops,
  onChooseCrop,
  onCancel,
}: InfoModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#7E4E31] p-6 rounded-lg max-w-sm w-full mx-4 border border-[#8B5E3C]/50"
      >
        <div className="flex flex-row items-center gap-2 mb-4">
          <h3 className={`text-white/90 font-bold text-lg`}>Glowing Crops</h3>
          {
            <Image
              src="/images/special/gold.png"
              alt="gold ingot"
              width={44}
              height={44}
            />
          }
        </div>
        {/* here the list of user special crops to choose from */}
        <div className="flex flex-col gap-4 my-4 text-white/80 text-[10px]">
          <p>Choose here a glowing crop to display on your profile.</p>
          <hr className="w-full opacity-30" />
          <p className="text-white/80 text-[12px] font-bold">Available crops</p>
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto no-scrollbar">
            {specialCrops.map((crop) => (
              <div
                key={crop.itemId}
                className="flex flex-row items-center justify-between py-2 px-1 rounded-md 
                   hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => {
                  onChooseCrop(crop);
                  onCancel();
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex flex-row items-center gap-2">
                  <div className="relative w-8 h-8">
                    <Image
                      src={`/images/crop/${crop.item.slug}.png`}
                      alt={crop.item.name}
                      fill
                    />
                  </div>
                  <p>{crop.item.name}</p>
                </div>
                <p>
                  x<span className="ml-1">{crop.quantity}</span>
                </p>
              </div>
            ))}
          </div>
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
    </div>
  );
}
