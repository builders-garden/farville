import { motion } from "framer-motion";
import Image from "next/image";
import { DbItem } from "@/supabase/types";

type SelectedItemDetails = {
  id: number;
  name: string;
  icon: string;
  buyPrice: number | null;
  harvestXp?: number;
  description: string | null;
  growthTime?: number;
  cropData: DbItem;
};

interface ItemDetailsModalProps {
  selectedItem: SelectedItemDetails;
  onClose: () => void;
}

export default function ItemDetailsModal({
  selectedItem,
  onClose,
}: ItemDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#6d4c2c] p-6 rounded-lg max-w-sm w-full mx-4 border border-[#8B5E3C]/50"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <motion.img
              src={`/images${selectedItem.icon}`}
              alt={selectedItem.name}
              className="w-12 h-12 object-contain"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <h3 className="text-white/90 font-bold text-lg">
              {selectedItem.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white/90"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-amber-500/90 text-[10px] text-center">
            Each {selectedItem.cropData.name} sells for{" "}
            {selectedItem.cropData.sellPrice}
            <span className="text-sm mb-1">🪙</span>
          </p>

          <div className="grid grid-cols-2 gap-3">
            {selectedItem.buyPrice && (
              <div className="flex flex-col bg-[#8B5E3C]/30 p-3 rounded gap-2 items-center">
                <p className="text-white/60">Buy Price</p>
                <p className="flex items-center gap-1 text-white/90 font-medium">
                  <span className="text-sm mb-1">🪙</span>
                  {selectedItem.buyPrice}
                </p>
              </div>
            )}
            {selectedItem.cropData.icon && (
              <div className="flex flex-col bg-[#8B5E3C]/30 p-3 rounded gap-2 items-center">
                <p className="text-white/60">Yield</p>
                <div className="flex flex-row items-center gap-1 text-white/90 font-medium">
                  1-3{" "}
                  <Image
                    width={16}
                    height={16}
                    src={`/images${selectedItem.cropData.icon}`}
                    alt={selectedItem.name}
                    className="w-4 h-4 object-contain"
                  />
                </div>
              </div>
            )}
            {selectedItem.harvestXp && (
              <div className="flex flex-col bg-[#8B5E3C]/30 p-3 rounded gap-2 items-center">
                <p className="text-white/60">Harvest XP</p>
                <p className="flex items-center gap-1 text-white/90 font-medium">
                  <span className="text-sm mb-1">⭐</span>
                  {selectedItem.harvestXp}
                </p>
              </div>
            )}
            {selectedItem.growthTime && (
              <div className="flex flex-col bg-[#8B5E3C]/30 p-3 rounded gap-2 items-center">
                <p className="text-white/60">Growth Time</p>
                <p className="flex items-center gap-1 text-white/90 font-medium">
                  <span className="text-sm mb-1">⏳</span>
                  {selectedItem.growthTime}hr
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
