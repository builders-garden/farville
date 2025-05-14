"use client";

import { useAudio } from "@/context/AudioContext";
import { useUserXp } from "@/hooks/use-user-xp";
import { CROP_DATA, SPEED_BOOST } from "@/lib/game-constants";
import {
  formatTime,
  getBoostTime,
  getGrowthTimeBasedOnMode,
} from "@/lib/utils";
import { UserGridCell } from "@prisma/client";
import { motion } from "framer-motion";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { useGame } from "../context/GameContext";
import { ActionType, CropType, PerkType, SeedType } from "../lib/types/game";
import CropSprite from "./CropSprite";
import Confetti from "./animations/Confetti";
import FloatingNumber from "./animations/FloatingNumber";
import { useNextStep } from "nextstepjs";

interface GridCellProps {
  cell: UserGridCell;
}

interface SeedDetailPopupProps {
  cell: UserGridCell;
  onFertilize: () => void;
  hasFertilizer: boolean;
  onBoost: (boostType: PerkType) => void;
  onClose: () => void;
}

function SeedDetailPopup({
  cell,
  onFertilize,
  hasFertilizer,
  onBoost,
  onClose,
}: SeedDetailPopupProps) {
  const { state, remainingUses, mode } = useGame();
  const seedData = state.items.find(
    (seed) => seed.slug === `${cell.cropType}-seeds`
  );

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
          type: boostType as PerkType,
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

  const formattedGrowthTime = formatTime(
    getGrowthTimeBasedOnMode(cell.cropType as CropType, mode) / 1000
  );
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
        {!cell.isReadyToHarvest &&
          hasBoost &&
          canBoost &&
          boostData &&
          remainingUses > 0 && (
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
    mode,
    addGridOperation,
    // fertilize,
    selectedSeed,
    selectedPerk,
    setSelectedSeed,
    setSelectedPerk,
    showLevelUpConfetti,
    floatingNumbers,
    setFloatingNumbers,
    remainingUses,
    setRemainingUses,
    state,
    updateGridCells,
    updateUserItems,
    updateUserWeeklyStats,
  } = useGame();
  const { currentTour, currentStep, setCurrentStep } = useNextStep();
  const { addUserXpsAndCheckLevelUp } = useUserXp();
  const { playSound } = useAudio();
  const cellRef = useRef<HTMLDivElement>(null);
  const [showPopup, setShowPopup] = useState(false);

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

  const hasFertilizer = state.inventory.some(
    (item) => item.item.slug === "fertilizer"
  );

  const handleBoost = async (boostType: SeedType | PerkType | undefined) => {
    const boostItem = state.inventory.find(
      (item) => item.item.slug === boostType
    );
    if (boostItem) {
      playSound("fertilize");

      addGridOperation({
        action: ActionType.ApplyPerk,
        itemSlug: boostType,
        cells: [{ x: cell.x, y: cell.y }],
        mode,
      });

      updateGridCells([
        {
          x: cell.x,
          y: cell.y,
          harvestAt: new Date(
            new Date(cell.harvestAt!).getTime() -
              getBoostTime(boostType as PerkType, mode)
          ),
          speedBoostedAt: new Date(),
          mode,
        },
      ]);

      updateUserItems([
        {
          itemId: boostItem.item.id,
          quantity: remainingUses - 1,
          item: {
            ...boostItem.item,
            category: "perk",
          },
        },
      ]);

      setRemainingUses(remainingUses - 1);
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
      if (!cell.plantedAt) {
        toast.loading("To plant a seed, pick one from the list below", {
          id: `${cell.x}-${cell.y}-planting`,
          position: "top-center",
          style: {
            backgroundColor: "#fff",
            color: "#000",
          },
          icon: "🌱",
        });
        setTimeout(() => {
          toast.dismiss(`${cell.x}-${cell.y}-planting`);
        }, 3000);
      }
      return;
    }
    try {
      if (
        isPerkIncompatible ||
        ((selectedSeed || selectedPerk) && remainingUses <= 0)
      ) {
        return;
      }

      if (
        selectedPerk &&
        selectedPerk.item.slug !== "fertilizer" &&
        isValidSpeedBoostTarget
      ) {
        playSound("fertilize");

        addGridOperation({
          action: ActionType.ApplyPerk,
          itemSlug: selectedPerk.item.slug as SeedType | PerkType,
          cells: [{ x: cell.x, y: cell.y }],
          mode,
        });

        const itemSlug = selectedPerk.item.slug as PerkType;
        const boostTime = getBoostTime(itemSlug, mode);

        updateGridCells([
          {
            x: cell.x,
            y: cell.y,
            harvestAt: new Date(
              new Date(cell.harvestAt!).getTime() - boostTime
            ),
            speedBoostedAt: new Date(),
            mode,
          },
        ]);

        updateUserItems([
          {
            itemId: selectedPerk.itemId,
            quantity: remainingUses - 1,
            item: {
              ...selectedPerk.item,
              category: "perk",
            },
          },
        ]);

        setRemainingUses(remainingUses - 1);
        if (remainingUses <= 1) {
          setSelectedPerk(null);
        }
        return;
      }

      if (
        selectedPerk &&
        selectedPerk.item.slug === "fertilizer" &&
        isValidFertilizerTarget
      ) {
        playSound("fertilize");

        addGridOperation({
          action: ActionType.Fertilize,
          cells: [{ x: cell.x, y: cell.y }],
          mode,
        });

        updateGridCells([
          {
            x: cell.x,
            y: cell.y,
            harvestAt: new Date(),
            speedBoostedAt: new Date(),
            mode,
          },
        ]);

        updateUserItems([
          {
            itemId: selectedPerk.itemId,
            quantity: remainingUses - 1,
            item: {
              ...selectedPerk.item,
              category: "perk",
            },
          },
        ]);

        setRemainingUses(remainingUses - 1);
        if (remainingUses <= 1) {
          setSelectedPerk(null);
        }
        if (currentTour === "mainTour" && currentStep === 3) {
          setCurrentStep(4);
          setSelectedPerk(null);
        }
        return;
      }

      if (cell.plantedAt && !isReadyToHarvest) {
        setShowPopup(true);
        return;
      }

      if (cell.plantedAt && isReadyToHarvest) {
        if (cellRef.current) {
          playSound("harvest");

          addGridOperation({
            action: ActionType.Harvest,
            cells: [{ x: cell.x, y: cell.y }],
            mode,
          });

          updateGridCells([
            {
              x: cell.x,
              y: cell.y,
              cropType: null,
              plantedAt: null,
              harvestAt: null,
              speedBoostedAt: null,
              isReadyToHarvest: false,
              mode,
            },
          ]);

          const cropXP = CROP_DATA[cell.cropType as CropType].rewardXP;
          const newFloatingNumber = {
            x: cell.y * 32, // TODO: Adjust multiplier based on your grid cell size
            y: cell.x * 32,
            gridX: cell.y,
            gridY: cell.x,
            exp: cropXP,
            cropType: cell.cropType as CropType,
            id: Math.random().toString(),
          };
          setFloatingNumbers((prev) => [...prev, newFloatingNumber]);

          addUserXpsAndCheckLevelUp(cropXP);
          updateUserWeeklyStats({
            currentScore: state.weeklyStats.currentScore + cropXP,
          });
          if (currentTour === "mainTour" && currentStep === 4) {
            setCurrentStep(5);
          }
        }
        return;
      }

      if (selectedSeed && !cell.plantedAt) {
        const item = state.seeds.find(
          (item) => item.item?.slug === selectedSeed
        );

        if (!item) {
          throw new Error("Seed item not found");
        }

        addGridOperation({
          action: ActionType.Plant,
          itemSlug: selectedSeed,
          cells: [{ x: cell.x, y: cell.y }],
          mode,
        });

        updateGridCells([
          {
            x: cell.x,
            y: cell.y,
            cropType: selectedSeed.replace("-seeds", "") as CropType,
            plantedAt: new Date(),
            harvestAt: new Date(
              Date.now() +
                getGrowthTimeBasedOnMode(
                  selectedSeed.replace("-seeds", "") as CropType,
                  mode
                )
            ),
            isReadyToHarvest: false,
            mode,
          },
        ]);

        updateUserItems([
          {
            itemId: item.item.id,
            quantity: item.quantity - 1,
            item: {
              ...item.item,
              category: "seed",
            },
          },
        ]);

        playSound("plant");

        setRemainingUses(Math.max(0, remainingUses - 1));
        if (remainingUses <= 1) {
          setSelectedSeed(null);
        }
        if (currentTour === "mainTour" && currentStep === 1) {
          setCurrentStep(2);
        }
      }
    } catch (error) {
      console.error("Planting failed:", error);
    }
  };

  const handleFertilize = async () => {
    const fertilizerItem = state.inventory.find(
      (item) => item.item.slug === "fertilizer"
    );
    if (hasFertilizer && fertilizerItem) {
      playSound("fertilize");

      addGridOperation({
        action: ActionType.Fertilize,
        cells: [{ x: cell.x, y: cell.y }],
        mode,
      });

      updateGridCells([
        {
          x: cell.x,
          y: cell.y,
          harvestAt: new Date(),
          speedBoostedAt: new Date(),
          mode,
        },
      ]);

      updateUserItems([
        {
          itemId: fertilizerItem.item.id,
          quantity: remainingUses - 1,
          item: {
            ...fertilizerItem.item,
            category: "fertilizer",
          },
        },
      ]);

      setRemainingUses(remainingUses - 1);
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
    transition-all duration-200
  `;

  return (
    <div id={`grid-cell-${cell.x}-${cell.y}`}>
      {showLevelUpConfetti && <Confetti title="LEVEL UP!" />}
      <motion.div
        ref={cellRef}
        onClick={handleClick}
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
                }
              : undefined
          }
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
            </Fragment>
          ))}
      </motion.div>
    </div>
  );
}
