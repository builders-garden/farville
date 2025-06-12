import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGame } from "@/context/GameContext";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import InventoryItem from "@/components/InventoryItem";
import { Item } from "@prisma/client";
import { RequestItem } from "./request-item";
import { useCreateRequest } from "@/hooks/game-actions/use-create-request";
import { Mode } from "@/lib/types/game";
import { useClanOperations } from "@/hooks/game-actions/use-clan-operations";

interface ClanRequestsFloatingButtonsProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  refetchClan: () => void;
}

type RequestOperation = "askForDonation" | "newRequest";

export function ClanRequestsFloatingButtons({
  isExpanded,
  setIsExpanded,
  refetchClan,
}: ClanRequestsFloatingButtonsProps) {
  const [selectedOperation, setSelectedOperation] =
    useState<RequestOperation | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [requestQuantity, setRequestQuantity] = useState(1);

  const { state } = useGame();
  const { mutate: createRequest } = useCreateRequest();
  const { shareRequestToClan } = useClanOperations();

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
  };

  const findUserItem = (itemSlug: string) => {
    const userItem = state.items.find((item) => item.slug === itemSlug);
    if (!userItem) return undefined;

    const userInventoryItem = [
      ...state.seeds,
      ...state.crops,
      ...state.perks,
    ].find((ui) => ui.item.slug === itemSlug);

    return userInventoryItem;
  };

  const renderCategorySection = (
    category: string,
    icon: string,
    title: string
  ) => {
    const filteredItems = state.items.filter(
      (item) => item.category === category
    );

    // Get the appropriate collection based on category
    const userItems =
      category === "seed"
        ? state.seeds
        : category === "crop"
        ? state.crops
        : category === "special-crop"
        ? state.specialCrops
        : state.perks;

    const isImageUrl = icon.startsWith("http") || icon.startsWith("/");

    return (
      <div>
        <motion.h3
          className="text-white/90 font-bold text-md mb-4 flex items-center gap-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          {isImageUrl ? (
            <Image src={icon} alt={title} width={28} height={28} />
          ) : (
            <span className="text-2xl mt-[-4px]">{icon}</span>
          )}
          {title}
        </motion.h3>
        <div className="grid grid-cols-6 gap-4 md:grid-cols-8">
          {filteredItems.map((item) => {
            const userItem = userItems.find((ui) => ui.item.slug === item.slug);
            const quantity = userItem?.quantity || 0;

            return (
              <InventoryItem
                key={item.id}
                item={item}
                quantity={quantity}
                onClick={() => {
                  if (category !== "special-crop") {
                    handleItemClick(item);
                  }
                }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const handleCreateRequest = () => {
    if (!selectedItem || !state.clan) return;

    try {
      if (selectedOperation === "askForDonation") {
        shareRequestToClan(
          {
            itemId: selectedItem.id,
            quantity: requestQuantity,
            clanId: state.clan.clanId, // always ensure clanId is defined
          },
          {
            onSuccess: () => {
              console.log("Donation request shared successfully");
              setSelectedItem(null);
              setRequestQuantity(1);
              setSelectedOperation(null);
            },
            onError: (error) => {
              console.error("Error sharing donation request:", error);
            },
          }
        );
      } else {
        createRequest(
          {
            itemId: selectedItem.id,
            quantity: requestQuantity,
            mode: Mode.Classic,
          },
          {
            onSuccess: async (data) => {
              console.log("Request created successfully");
              shareRequestToClan({
                requestId: data.id,
                // @ts-expect-error clanId is always defined
                clanId: state.clan.clanId,
              });
              setSelectedItem(null);
              setRequestQuantity(1);
              setSelectedOperation(null);
            },
            onError: (error) => {
              console.error("Error creating request:", error);
            },
          }
        );
      }

      refetchClan();
    } catch (error) {
      console.error("Error creating request:", error);
    }
  };

  return (
    <>
      <Dialog>
        <div className="fixed bottom-6 right-4 flex flex-col gap-3 items-end">
          {isExpanded ? (
            <>
              <DialogTrigger asChild>
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedOperation("askForDonation");
                    setIsExpanded(false);
                  }}
                  className="px-4 py-2 rounded-full bg-[#FFB938] text-[#7E4E31] 
          flex items-center justify-center gap-2 shadow-lg hover:bg-[#ffc65c] transition-colors"
                  aria-label="Ask for a donation"
                >
                  <Plus size={20} />
                  <span className="font-medium text-xs">
                    Ask for a donation
                  </span>
                </motion.button>
              </DialogTrigger>

              <DialogTrigger asChild>
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedOperation("newRequest");
                    setIsExpanded(false);
                  }}
                  className="px-4 py-2 rounded-full bg-[#FFB938] text-[#7E4E31] 
          flex items-center justify-center gap-2 shadow-lg hover:bg-[#ffc65c] transition-colors"
                  aria-label="New Request"
                >
                  <Plus size={20} />
                  <span className="font-medium text-xs">New Request</span>
                </motion.button>
              </DialogTrigger>
            </>
          ) : null}

          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-4 rounded-full bg-[#FFB938] text-[#7E4E31] 
            flex items-center justify-center gap-2 shadow-lg hover:bg-[#ffc65c] transition-colors"
            aria-label="Ask"
          >
            {isExpanded ? <Minus size={20} /> : <Plus size={20} />}
          </motion.button>
        </div>

        <DialogContent className="w-[360px] bg-[#7E4E31] border-[#8B5E3C]/50 rounded-lg p-4">
          <DialogHeader className="gap-2 mb-2">
            <DialogTitle className="text-white/90">Clan Requests</DialogTitle>
            <DialogDescription className="text-white/80 text-xs flex flex-col gap-2">
              <span>
                {selectedOperation === "askForDonation"
                  ? "Tell your clan members that you need items."
                  : "Send a request to your clan for items you need."}
              </span>
              <span>Pick an item and specify the quantity you need.</span>
            </DialogDescription>
          </DialogHeader>

          {!selectedItem ? (
            <div className="flex flex-col gap-2 w-full mx-auto space-y-8">
              {renderCategorySection("seed", "🌱", "Seeds")}
              {renderCategorySection("crop", "🌾", "Crops")}
            </div>
          ) : (
            <RequestItem
              item={selectedItem}
              requestQuantity={requestQuantity}
              setRequestQuantity={setRequestQuantity}
              userItem={findUserItem(selectedItem.slug)}
              handleRequest={handleCreateRequest}
              onClose={() => {
                setSelectedItem(null);
                setRequestQuantity(1);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
