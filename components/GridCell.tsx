"use client";

import { motion } from "framer-motion";
import { useGame } from "../context/GameContext";
import { CropType, SeedType } from "../types/game";
import CropSprite from "./CropSprite";
import FloatingNumber from "./animations/FloatingNumber";
import { useState, useRef } from "react";
import { DbGridCell } from "@/supabase/types";
import { CROP_DATA } from "@/lib/game-constants";
import Confetti from "./animations/Confetti";
import { createPortal } from "react-dom";

interface GridCellProps {
  cell: DbGridCell;
}

interface SeedDetailPopupProps {
  cell: DbGridCell;
  onFertilize: () => void;
  hasFertilizer: boolean;
  onClose: () => void;
}

function SeedDetailPopup({
  cell,
  onFertilize,
  hasFertilizer,
  onClose,
}: SeedDetailPopupProps) {
  const { state } = useGame();
  const seedData = state.items.find(
    (seed) => seed.slug === `${cell.cropType}-seeds`
  );
  const cropData = CROP_DATA[cell.cropType as CropType];
  const plantedAt = new Date(cell.plantedAt!);
  const timeLeft = Math.max(
    0,
    (plantedAt.getTime() + cropData.growthTime - Date.now()) / 1000
  );
  const minutesLeft = Math.ceil(timeLeft / 60);

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

        <div className="space-y-3 text-white/80 text-xs">
          <p>Growth Time: {cropData.growthTime / 1000 / 60} minutes</p>
          <p>Planted at: {plantedAt.toLocaleTimeString()}</p>
          {!cell.isReadyToHarvest && (
            <p>Harvest in: {minutesLeft} minutes</p>
          )}
          {cell.isReadyToHarvest && (
            <p className="text-[#FFB938] font-medium">Ready to harvest!</p>
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
    selectedSeed,
    selectedFertilizer,
    setSelectedFertilizer,
    isActionInProgress,
  } = useGame();
  const [showFloating, setShowFloating] = useState(false);
  const [floatingPosition, setFloatingPosition] = useState({ x: 0, y: 0 });
  const [harvestedExp, setHarvestedExp] = useState<number | null>(null);
  const [harvestedAmount, setHarvestedAmount] = useState<number | null>(null);
  const [harvestedCropType, setHarvestedCropType] = useState<CropType | null>(
    null
  );
  const cellRef = useRef<HTMLDivElement>(null);
  const [isDragOver] = useState(false);
  const [showLevelUpConfetti, setShowLevelUpConfetti] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const isReadyToHarvest =
    cell.isReadyToHarvest ||
    (cell.plantedAt &&
      new Date(cell.plantedAt).getTime() +
        CROP_DATA[cell.cropType as CropType].growthTime <
        Date.now());

  const isValidFertilizerTarget = cell.plantedAt && !isReadyToHarvest;

  const { state } = useGame();

  const hasFertilizer = state.inventory.some(
    (item) => item.item.slug === "fertilizer"
  );

  const handleClick = async () => {
    if (isActionInProgress) return;

    if (selectedFertilizer && isValidFertilizerTarget) {
      await fertilize({ x: cell.x, y: cell.y });
      setSelectedFertilizer(null);
      return;
    }

    if (cell.plantedAt && !isReadyToHarvest) {
      setShowPopup(true);
      return;
    }

    if (cell.plantedAt && isReadyToHarvest) {
      if (cellRef.current) {
        const rect = cellRef.current.getBoundingClientRect();
        const cropType = cell.cropType as CropType;
        const harvestResult = await harvestCrop({
          x: cell.x,
          y: cell.y,
        });

        if (!harvestResult) {
          return;
        }

        if (harvestResult.rewards?.didLevelUp) {
          setShowLevelUpConfetti(true);
          setTimeout(() => {
            setShowLevelUpConfetti(false);
          }, 3000);
        }

        setFloatingPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });

        setHarvestedExp(harvestResult.rewards?.xp || 0);
        setHarvestedAmount(harvestResult.rewards?.amount || 0);
        setHarvestedCropType(cropType);
        setShowFloating(true);

        setTimeout(() => {
          setShowFloating(false);
          setHarvestedExp(null);
          setHarvestedAmount(null);
          setHarvestedCropType(null);
        }, 1500);
      }
    } else if (selectedSeed && !cell.plantedAt) {
      await plantSeed({
        x: cell.x,
        y: cell.y,
        seedType: selectedSeed,
      });
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
    if (!cell.plantedAt) {
      await plantSeed({ x: cell.x, y: cell.y, seedType });
    }
  };

  const handleFertilize = async () => {
    if (hasFertilizer) {
      await fertilize({ x: cell.x, y: cell.y });
      setShowPopup(false);
    }
  };

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
        className={`
          grid-cell
          aspect-square rounded-xl relative
          ${
            isActionInProgress
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
          }
          ${
            selectedFertilizer && isValidFertilizerTarget
              ? "border-4 border-yellow-400 shadow-lg"
              : ""
          }
          ${selectedFertilizer && !isValidFertilizerTarget ? "opacity-50" : ""}
          ${
            selectedSeed && !cell.plantedAt
              ? "border-4 border-green-400 shadow-lg"
              : ""
          }
          ${selectedSeed && cell.plantedAt ? "opacity-50" : ""}
          ${!cell.plantedAt ? "drop-target" : ""}
          ${isDragOver ? "dragover" : ""}
          transition-all duration-200
        `}
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
        {showPopup && cell.plantedAt && !isReadyToHarvest && (
          <SeedDetailPopup
            cell={cell}
            onFertilize={handleFertilize}
            hasFertilizer={hasFertilizer}
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
                  readyToHarvest: !!isReadyToHarvest,
                }
              : undefined
          }
        />

        {/* Fertilizer Hover Effect */}
        {selectedFertilizer && isValidFertilizerTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-yellow-400/20 rounded-lg flex items-center justify-center"
          >
            <span className="text-2xl">🧪</span>
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
        {showFloating && (
          <>
            <FloatingNumber
              number={harvestedExp || 0}
              x={floatingPosition.x}
              y={floatingPosition.y - 20}
              type="xp"
            />
            <FloatingNumber
              number={harvestedAmount || 0}
              x={floatingPosition.x}
              y={floatingPosition.y + 20}
              type="crop"
              cropType={harvestedCropType!}
            />
          </>
        )}
      </motion.div>
    </>
  );
}
