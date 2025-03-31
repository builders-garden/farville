import { UserItem } from "@/hooks/use-user-items";
import { motion } from "framer-motion";
import Image from "next/image";
import { DbItem } from "@/supabase/types";
import { Slider } from "@/components/ui/slider";
import { useEffect, useState } from "react";

interface ItemDetailsPopupProps {
  item: DbItem;
  userItem?: UserItem;
  onClose: () => void;
  onRequest: () => void;
  onUse?: () => void;
  requestQuantity: number;
  onRequestQuantityChange: (quantity: number) => void;
  onShareRequest?: () => void;
  onCopyRequest: () => void;
  urlReady: boolean;
}

export default function ItemDetailsPopup({
  item,
  userItem,
  onClose,
  onRequest,
  onUse,
  requestQuantity,
  onRequestQuantityChange,
  onShareRequest,
  onCopyRequest,
  urlReady,
}: ItemDetailsPopupProps) {
  const [copied, setCopied] = useState(false);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);

  const maxRequestAmount = item.category === "perk" ? 1 : 10;

  const handleCopy = () => {
    if (urlReady) {
      onCopyRequest();
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const handleCreateRequest = () => {
    setIsCreatingRequest(true);
    onRequest();
  };

  useEffect(() => {
    if (urlReady) {
      setIsCreatingRequest(false);
    }
  }, [urlReady]);

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

        <div className="flex flex-col gap-3">
          {item.category !== "perk" && (
            <>
              <div className="bg-[#6d4c2c] rounded-lg p-4 mb-2">
                <div className="flex justify-between items-center mb-3">
                  <div className="w-full flex justify-between items-center gap-2">
                    <span className="text-white/80 text-sm">In inventory:</span>
                    <span className="text-white font-bold text-md bg-[#5A4129] px-2 py-0.5 rounded">
                      {userItem?.quantity || 0}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 text-sm">
                      Request quantity:
                    </span>
                    <span className="text-[#FFB938] font-bold text-lg">
                      {requestQuantity}
                    </span>
                  </div>

                  <Slider
                    variant="yellow-brown"
                    value={[requestQuantity]}
                    min={1}
                    max={maxRequestAmount}
                    step={1}
                    onValueChange={(value) => onRequestQuantityChange(value[0])}
                    className="cursor-pointer"
                    disabled={isCreatingRequest}
                  />

                  <p className="text-white/70 text-xs text-right">
                    Max: {maxRequestAmount}
                  </p>
                </div>
              </div>

              {!urlReady ? (
                <button
                  onClick={handleCreateRequest}
                  disabled={isCreatingRequest}
                  className="flex-1 bg-[#FFB938] text-[#7E4E31] px-4 py-2 rounded-lg font-bold 
                     hover:bg-[#ffc661] transition-colors relative"
                >
                  {isCreatingRequest ? (
                    <div className="flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-t-transparent border-[#7E4E31] rounded-full animate-spin mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    "Create Request"
                  )}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    className="flex-1 bg-[#FFB938] text-[#7E4E31] px-4 py-2 rounded-lg font-bold
                   hover:bg-[#ffc661] transition-colors relative"
                    onClick={handleCopy}
                    disabled={!urlReady}
                  >
                    {copied ? "Copied!" : "Copy"}
                    {copied && (
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-green-500 text-white rounded-lg flex items-center justify-center"
                      >
                        Copied!
                      </motion.span>
                    )}
                  </button>
                  <button
                    className="flex-1 bg-[#FFB938] text-[#7E4E31] px-4 py-2 rounded-lg font-bold 
                     hover:bg-[#ffc661] transition-colors"
                    onClick={onShareRequest}
                  >
                    Share
                  </button>
                </div>
              )}
            </>
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
