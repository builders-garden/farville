import { UserItem } from "@/hooks/use-user-items";
import { motion } from "framer-motion";
import Image from "next/image";
import { DbItem } from "@/supabase/types";

interface ItemDetailsPopupProps {
  item: DbItem;
  userItem?: UserItem;
  onClose: () => void;
  onRequest: () => void;
  onUse?: () => void;
  requestQuantity: number;
  onRequestQuantityChange: (quantity: number) => void;
}

export default function ItemDetailsPopup({
  item,
  userItem,
  onClose,
  onRequest,
  onUse,
  requestQuantity,
  onRequestQuantityChange,
}: ItemDetailsPopupProps) {
  const maxRequestAmount = [9, 24, 25].includes(item.id) ? 1 : 5;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
      onClick={onClose}
    >
      <div
        className="bg-[#7E4E31] p-6 rounded-lg max-w-sm w-full mx-4 border-2 border-[#8B5E3C]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-4">
          {item.icon.startsWith("/") ? (
            <Image
              src={`/images${item.icon}`}
              alt={item.name}
              width={36}
              height={36}
              className="object-contain"
            />
          ) : (
            <span className="text-4xl">{item.icon}</span>
          )}
          <div>
            <h3 className="text-white/90 font-bold text-xl">{item.name}</h3>
            <p className="text-white/70 text-sm">
              Required Level: {item.requiredLevel}
            </p>
          </div>
        </div>

        <p className="text-white/80 mb-4">{item.description}</p>
        <p className="text-white/90 mb-6">Owned: {userItem?.quantity || 0}</p>

        <div className="flex items-center justify-center gap-4 p-4">
          <button
            onClick={() =>
              onRequestQuantityChange(Math.max(1, requestQuantity - 1))
            }
            className="w-8 h-8 bg-[#6d4c2c] rounded-full flex items-center justify-center text-white/90
                     hover:bg-[#5d3c1c] transition-colors"
          >
            -
          </button>
          <span className="text-white/90 font-bold text-lg">
            {requestQuantity}
          </span>
          <button
            onClick={() =>
              onRequestQuantityChange(
                Math.min(maxRequestAmount, requestQuantity + 1)
              )
            }
            className="w-8 h-8 bg-[#6d4c2c] rounded-full flex items-center justify-center text-white/90
                     hover:bg-[#5d3c1c] transition-colors"
          >
            +
          </button>
        </div>

        <p className="text-white/70 text-[10px] text-center mb-4">
          You can request max {maxRequestAmount} {item.name} at a time
        </p>

        <div className="flex flex-col gap-3">
          {(item.category !== "perk" || item.id === 9) && (
            <button
              onClick={onRequest}
              className="flex-1 bg-[#FFB938] text-[#7E4E31] px-4 py-2 rounded-lg font-bold 
                       hover:bg-[#ffc661] transition-colors"
            >
              Request on FC
            </button>
          )}
          {onUse && (
            <button
              onClick={onUse}
              disabled={!userItem?.quantity}
              className="flex-1 bg-[#4CAF50] text-white px-4 py-2 rounded-lg font-bold 
                       hover:bg-[#45a049] transition-colors"
            >
              Use
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
