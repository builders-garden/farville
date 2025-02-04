"use client";

import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { CropType, SeedType } from "../types/game";
import CropSprite from "./CropSprite";
import FloatingNumber from "./animations/FloatingNumber";
import { useState, useRef, useEffect, useMemo, Fragment } from "react";
import { DbGridCell } from "@/supabase/types";
import { CROP_DATA, SPEED_BOOST } from "@/lib/game-constants";
import Confetti from "./animations/Confetti";
import { createPortal } from "react-dom";
import { formatTime } from "@/lib/utils";

interface GridCellProps {
  cell: DbGridCell;
}

interface SeedDetailPopupProps {
  cell: DbGridCell;
  onFertilize: () => void;
  hasFertilizer: boolean;
  onBoost: (boostType: string) => void;
  onClose: () => void;
}

function SeedDetailPopup({
  cell,
  onFertilize,
  hasFertilizer,
  onBoost,
  onClose,
}: SeedDetailPopupProps) {
  const { state } = useGame();
  const seedData = state.items.find(
    (seed) => seed.slug === `${cell.cropType}-seeds`
  );
  const cropData = CROP_DATA[cell.cropType as CropType];
  const plantedAt = new Date(cell.plantedAt!);
  const harvestAt = useMemo(() => new Date(cell.harvestAt!), [cell.harvestAt]);
  const timeLeft = Math.max(0, (harvestAt.getTime() - Date.now()) / 1000);

  const [countdown, setCountdown] = useState<string>(formatTime(timeLeft));

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeft = Math.max(
        0,
        (harvestAt.getTime() - Date.now()) / 1000
      );
      setCountdown(formatTime(newTimeLeft));
    }, 1000);

    return () => clearInterval(interval);
  }, [harvestAt]);

  const getBoostType = () => {
    const cropType = cell.cropType as CropType;
    for (const [boostType, data] of Object.entries(SPEED_BOOST)) {
      if (data.applyTo.includes(cropType)) {
        return {
          type: boostType,
          multiplier: data.boost,
          duration: data.duration,
        };
      }
    }
    return null;
  };

  const boostData = getBoostType();
  const hasBoost = state.perks.some(
    (item) => item.item.slug === boostData?.type
  );
  const canBoost =
    boostData &&
    !cell.isReadyToHarvest &&
    (!cell.speedBoostedAt ||
      new Date(cell.speedBoostedAt).getTime() + boostData?.duration <
        Date.now());

  const boostTimeLeft = cell.speedBoostedAt
    ? Math.max(
        0,
        (new Date(cell.speedBoostedAt).getTime() +
          (boostData?.duration || 0) -
          Date.now()) /
          1000 /
          60
      )
    : 0;

  const formattedGrowthTime = formatTime(cropData.growthTime / 1000);
  const formattedPlantAt =
    plantedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
    " " +
    plantedAt.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
  const formattedBoostTimeLeft = formatTime(boostTimeLeft * 60);

  return createPortal(
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#7E4E31] p-6 rounded-lg max-w-sm w-full mx-4 border-2 border-[#8B5E3C] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-2 right-2 text-white/80 hover:text-white text-xl font-bold"
        >
          ×
        </button>

        <div className="flex items-center gap-4 mb-4">
          <img
            src={`/images${seedData?.icon}`}
            alt={seedData?.name}
            className="w-9 h-9 object-contain"
          />
          <h3 className="text-white/90 font-bold text-xl">{seedData?.name}</h3>
        </div>

        <div className="space-y-3 text-white/80 text-xs mb-2">
          <p>Growth Time: {formattedGrowthTime}</p>
          <p>Planted at: {formattedPlantAt}</p>
          {!cell.isReadyToHarvest && <p>Harvest in: {countdown}</p>}
          {cell.isReadyToHarvest && (
            <p className="text-[#FFB938] font-medium">Ready to harvest!</p>
          )}
          {cell.speedBoostedAt && boostTimeLeft > 0 && (
            <p className="text-[#2196F3]">
              Boost ends in: {formattedBoostTimeLeft}
            </p>
          )}
        </div>

        {!cell.isReadyToHarvest && hasFertilizer && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFertilize();
            }}
            className="w-full mt-4 bg-[#FFB938] text-[#7E4E31] py-2 px-4 rounded-lg font-bold 
                     hover:bg-[#ffc661] transition-colors"
          >
            Fertilize
          </button>
        )}
        {!cell.isReadyToHarvest && hasBoost && canBoost && boostData && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBoost(boostData.type);
            }}
            className="w-full mt-2 bg-[#2196F3] text-white py-2 px-4 rounded-lg font-bold 
                     hover:bg-[#1976D2] transition-colors"
          >
            Boost ({boostData.multiplier}x)
          </button>
        )}
      </div>
    </motion.div>,
    document.body
  );
}

export default function GridCell({ cell }: GridCellProps) {
  const {
    plantSeed,
    harvestCrop,
    fertilize,
    applyPerk,
    selectedSeed,
    selectedPerk,
    setSelectedSeed,
    setSelectedPerk,
    showLevelUpConfetti,
    floatingNumbers,
    remainingUses,
    setRemainingUses,
  } = useGame();
  const cellRef = useRef<HTMLDivElement>(null);
  const [isDragOver] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isReadyToHarvest =
    cell.isReadyToHarvest ||
    (cell.plantedAt &&
      cell.harvestAt &&
      Date.now() > new Date(cell.harvestAt).getTime());

  const isValidFertilizerTarget = cell.plantedAt && !isReadyToHarvest;
  const isValidSpeedBoostTarget =
    cell.plantedAt &&
    !isReadyToHarvest &&
    (!cell.speedBoostedAt ||
      new Date(cell.speedBoostedAt).getTime() + 1000 * 60 * 60 * 2 <
        Date.now()) &&
    selectedPerk &&
    SPEED_BOOST[
      selectedPerk.item.slug as keyof typeof SPEED_BOOST
    ]?.applyTo?.includes(cell.cropType as CropType);

  const isPerkIncompatible =
    selectedPerk &&
    selectedPerk.item.slug !== "fertilizer" &&
    (!SPEED_BOOST[
      selectedPerk.item.slug as keyof typeof SPEED_BOOST
    ]?.applyTo?.includes(cell.cropType as CropType) ||
      (cell.speedBoostedAt &&
        new Date(cell.speedBoostedAt).getTime() + 1000 * 60 * 60 * 2 >=
          Date.now()));

  const { state } = useGame();

  const hasFertilizer = state.inventory.some(
    (item) => item.item.slug === "fertilizer"
  );

  const handleBoost = async (boostType: string) => {
    const boostItem = state.inventory.find(
      (item) => item.item.slug === boostType
    );
    if (boostItem) {
      applyPerk({
        x: cell.x,
        y: cell.y,
        itemSlug: boostType,
        item: boostItem,
        setIsLoading,
      });
      setShowPopup(false);
    }
  };

  const handleClick = async () => {
    if (
      !cell.plantedAt &&
      !isReadyToHarvest &&
      !selectedSeed &&
      !selectedPerk
    ) {
      return;
    }
    try {
      setIsLoading(true);
      if (
        isPerkIncompatible ||
        ((selectedSeed || selectedPerk) && remainingUses <= 0)
      ) {
        console.log("Early return due to:", {
          isPerkIncompatible,
          selectedSeed,
          selectedPerk,
          remainingUses,
        });
        setIsLoading(false);
        return;
      }
      if (
        selectedPerk &&
        ((selectedPerk.item.slug === "fertilizer" && isValidFertilizerTarget) ||
          (selectedPerk.item.slug !== "fertilizer" && isValidSpeedBoostTarget))
      ) {
        applyPerk({
          x: cell.x,
          y: cell.y,
          itemSlug: selectedPerk.item.slug,
          item: selectedPerk,
          setIsLoading,
        });
        setRemainingUses(remainingUses - 1);
        if (remainingUses <= 1) {
          setSelectedPerk(null);
        }
        return;
      }

      if (cell.plantedAt && !isReadyToHarvest) {
        setShowPopup(true);
        setIsLoading(false);
        return;
      }

      if (cell.plantedAt && isReadyToHarvest) {
        if (cellRef.current) {
          harvestCrop({
            x: cell.x,
            y: cell.y,
            setIsLoading,
          });
        }
        return;
      }

      if (selectedSeed && !cell.plantedAt) {
        console.log("Attempting to plant:", {
          x: cell.x,
          y: cell.y,
          seedType: selectedSeed,
        });

        const item = state.seeds.find((item) => item.item?.slug === selectedSeed);

        if (!item) {
          throw new Error("Seed item not found");
        }

        plantSeed({
          x: cell.x,
          y: cell.y,
          seedType: selectedSeed,
          item: item,
          setIsLoading,
        });

        setRemainingUses(Math.max(0, remainingUses - 1));
        if (remainingUses <= 1) {
          setSelectedSeed(null);
        }
      }
    } catch (error) {
      console.error("Planting failed:", error);
    } finally {
      // setIsLoading(false)
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!cell.plantedAt) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const seedType = e.dataTransfer.getData("seedType") as SeedType;
    const seedItem = state.seeds.find((item) => item.item?.slug === seedType);
    if (!seedItem) {
      throw new Error("Seed item not found");
    }
    if (!cell.plantedAt) {
      plantSeed({ x: cell.x, y: cell.y, seedType, item: seedItem, setIsLoading });
    }
  };

  const handleFertilize = async () => {
    if (hasFertilizer) {
      fertilize({ x: cell.x, y: cell.y, setIsLoading });
      setShowPopup(false);
    }
  };

  const cellClassName = `
    grid-cell
    aspect-square rounded-xl relative
    ${
      isPerkIncompatible ||
      ((selectedSeed || selectedPerk) && remainingUses <= 0)
        ? "cursor-not-allowed opacity-50"
        : "cursor-pointer"
    }
    ${
      selectedPerk && (isValidFertilizerTarget || isValidSpeedBoostTarget)
        ? "border-4 border-yellow-400 shadow-lg"
        : ""
    }
    ${
      (selectedPerk && !isValidFertilizerTarget && !isValidSpeedBoostTarget) ||
      isPerkIncompatible
        ? "opacity-30 bg-gray-800 pointer-events-none cursor-not-allowed"
        : ""
    }
    ${
      selectedSeed && !cell.plantedAt
        ? "border-4 border-green-400 shadow-lg"
        : ""
    }
    ${
      selectedSeed && cell.plantedAt
        ? "opacity-50 pointer-events-none cursor-not-allowed"
        : ""
    }
    ${!cell.plantedAt ? "drop-target" : ""}
    ${isDragOver ? "dragover" : ""}
    ${isLoading ? "pointer-events-none" : ""}
    transition-all duration-200
  `;

  return (
    <>
      {showLevelUpConfetti && <Confetti />}
      <motion.div
        ref={cellRef}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-x={cell.x}
        data-y={cell.y}
        className={cellClassName}
        initial={false}
        animate={{
          scale: isReadyToHarvest ? [1, 1.02, 1] : 1,
        }}
        transition={{
          duration: 1,
          repeat: isReadyToHarvest ? Infinity : 0,
          repeatType: "reverse",
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 rounded-sm flex items-center justify-center z-50">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        {showPopup && cell.plantedAt && !isReadyToHarvest && (
          <SeedDetailPopup
            cell={cell}
            onFertilize={handleFertilize}
            hasFertilizer={hasFertilizer}
            onBoost={handleBoost}
            onClose={() => setShowPopup(false)}
          />
        )}

        <CropSprite
          crop={
            cell.cropType
              ? {
                  type: cell.cropType as CropType,
                  plantedAt: cell.plantedAt
                    ? new Date(cell.plantedAt).getTime()
                    : 0,
                  readyToHarvest:
                    !!isReadyToHarvest ||
                    (!!cell.harvestAt &&
                      Date.now() >= new Date(cell.harvestAt).getTime()),
                  harvestAt: cell.harvestAt
                    ? new Date(cell.harvestAt).getTime()
                    : undefined,
                  speedBoostedAt: cell.speedBoostedAt
                    ? new Date(cell.speedBoostedAt).getTime()
                    : 0,
                  yieldBoost: cell.yieldBoost || 0,
                }
              : undefined
          }
          isLoading={isLoading}
        />

        {/* Fertilizer/Speed Boost Hover Effect */}
        {selectedPerk &&
          ((selectedPerk.item.slug === "fertilizer" &&
            isValidFertilizerTarget) ||
            (selectedPerk.item.slug !== "fertilizer" &&
              isValidSpeedBoostTarget)) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-yellow-400/20 rounded-lg flex items-center justify-center"
            >
              <img
                src={`/images${selectedPerk.item.icon}`}
                className="w-8 h-8"
              />
            </motion.div>
          )}

        {/* Seed Planting Hover Effect */}
        {selectedSeed && !cell.plantedAt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-green-400/20 rounded-lg flex items-center justify-center"
          >
            <motion.img
              src={`/images/${
                state.items.find((item) => item.slug === selectedSeed)?.icon
              }`}
              alt={selectedSeed}
              className="w-8 h-8 object-contain opacity-75"
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        )}

        {/* Floating Numbers */}
        {floatingNumbers
          .filter((num) => num.gridX === cell.x && num.gridY === cell.y)
          .map((numbers) => (
            <Fragment key={numbers.id}>
              <FloatingNumber
                number={numbers.exp}
                x={numbers.x}
                y={numbers.y - 5}
                type="xp"
              />
              <FloatingNumber
                number={numbers.amount}
                x={numbers.x}
                y={numbers.y + 5}
                type="crop"
                cropType={numbers.cropType}
              />
            </Fragment>
          ))}
      </motion.div>
    </>
  );
}
