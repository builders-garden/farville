import { UserItem } from "@/hooks/use-user-items";
import { Item } from "@prisma/client";
import { useState } from "react";
import Image from "next/image";
import { Slider } from "@/components/ui/slider";

interface RequestItemProps {
  item: Item;
  userItem?: UserItem;
  handleRequest: () => void;
  requestQuantity: number;
  setRequestQuantity: (quantity: number) => void;
  onClose: () => void;
}

const maxRequestAmount = 10; // Define the maximum request amount

export function RequestItem({
  item,
  userItem,
  handleRequest,
  requestQuantity,
  setRequestQuantity,
  onClose,
}: RequestItemProps) {
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);

  const handleCreateRequest = () => {
    setIsCreatingRequest(true);
    handleRequest();
  };

  return (
    <div className="w-full my-2 p-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-3 mb-4">
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
          <h3 className="text-white/90 font-bold text-md">{item.name}</h3>
          <p className="text-white/70 text-sm">
            Required Level: {item.requiredLevel}
          </p>
        </div>
      </div>

      <p className="text-white/80 mb-4">{item.description}</p>

      <div className="flex flex-col gap-3">
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
              <span className="text-white/80 text-sm">Request quantity:</span>
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
              onValueChange={(value) => setRequestQuantity(value[0])}
              className="cursor-pointer"
              disabled={isCreatingRequest}
            />

            <p className="text-white/70 text-xs text-right">
              Max: {maxRequestAmount}
            </p>
          </div>
        </div>

        <div className="flex gap-2 text-xs">
          <button
            onClick={() => {
              onClose(); // Close the request modal
            }}
            className="flex-1 border-2 border-[#FFB938] text-[#FFB938] px-4 py-2 rounded-lg font-bold
                   hover:bg-[#FFB938]/10 transition-colors relative"
            disabled={isCreatingRequest}
          >
            Back
          </button>
          <button
            onClick={handleCreateRequest}
            disabled={isCreatingRequest}
            className="flex-1 bg-[#FFB938] text-[#7E4E31] px-4 py-2 rounded-lg font-bold 
                   hover:bg-[#ffc661] transition-colors"
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
        </div>
      </div>
    </div>
  );
}
