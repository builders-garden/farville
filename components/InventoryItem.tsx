import { motion } from "framer-motion";
import { DbItem } from "@/supabase/types";

interface InventoryItemProps {
  item: DbItem;
  quantity: number;
  onClick: () => void;
}

export default function InventoryItem({
  item,
  quantity,
  onClick,
}: InventoryItemProps) {
  return (
    <motion.div
      className="bg-[#6d4c2c] aspect-square rounded-lg relative flex items-center justify-center
                 shadow-lg hover:shadow-xl transition-shadow duration-200
                 border-2 border-[#8B5E3C] cursor-pointer"
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
    >
      <motion.img
        src={`/images${item.icon}`}
        alt={`${item.name} ${item.category}`}
        className="w-8 h-8 object-contain"
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.div
        className="absolute -top-2 -right-2 bg-[#FFB938] text-[#7E4E31] text-xs px-2 py-0.5 
               rounded-full font-bold shadow-md border border-[#7E4E31]"
        animate={{
          scale: quantity > 0 ? [1, 1.1, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {quantity}
      </motion.div>
    </motion.div>
  );
}
