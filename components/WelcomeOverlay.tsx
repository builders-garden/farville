"use client";

import { motion } from "framer-motion";
import { useAudio } from "../context/AudioContext";
import { useState, useEffect } from "react";
import { GridCell as GridCellType, Crop, CropType } from "../lib/types/game";
import CropSprite from "./CropSprite";
import Image from "next/image";
import sdk from "@farcaster/frame-sdk";
import { useFrameContext } from "../context/FrameContext";
import { CROPS } from "../lib/game-constants";
import FloatingNumber from "./animations/FloatingNumber";
import { warpcastComposeCastUrl } from "../lib/utils";
import { DbUser } from "../supabase/types";
import Link from "next/link";
import { WHITELISTED_FIDS } from "../lib/whitelist";

// Demo version of CropSprite that shows seconds instead of minutes/hours
function DemoCropSprite({ crop }: { crop?: Crop }) {
  return (
    <>
      <CropSprite crop={crop} isDemo={true} />
    </>
  );
}

// At the top of the file, add this interface
interface DemoGridCell extends GridCellType {
  justHarvested?: boolean;
  harvestAnimation?: {
    x: number;
    y: number;
    type: CropType;
    amount: number;
  };
}

// Add this constant at the top with other constants
const DEMO_GROWTH_TIME = 9000; // 9 seconds total (3 seconds per stage)

// Add this constant near the top with other constants
const SEED_ANIMATION = {
  y: [0, -4, 0],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// Add this CSS constant near the top with other constants
const PIXEL_BORDER = `
  border: 2px solid #000;
  box-shadow: -4px 0 0 0 #000, 4px 0 0 0 #000, 0 -4px 0 0 #000, 0 4px 0 0 #000`;

export default function WelcomeOverlay({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const { startBackgroundMusic, playSound, stopBackgroundMusic } = useAudio();
  const [selectedSeed, setSelectedSeed] = useState<CropType | null>(null);
  const [musicStarted, setMusicStarted] = useState(false);
  const { safeAreaInsets } = useFrameContext();
  const [showShareButton, setShowShareButton] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const { isSDKLoaded, context } = useFrameContext();
  const [user, setUser] = useState<DbUser | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isSDKLoaded) {
      if (context?.user.fid) {
        if (WHITELISTED_FIDS.includes(context.user.fid)) {
          setShowPreview(true);
        }
      }
    }
  }, [isSDKLoaded, context]);

  useEffect(() => {
    async function getUserIfExist(fid: number) {
      try {
        const res = await fetch(`/api/user?fid=${fid}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const userData = await res.json();
        setUser(userData.data);
      } catch (error) {
        console.error(error);
      }
    }
    if (context) {
      getUserIfExist(context.user.fid);
    }
  }, [context]);

  useEffect(() => {
    if (user) {
      setShowShareButton(true);
    }
  }, [user]);

  // Add helper function to start music
  const startMusic = () => {
    if (!musicStarted && !isMuted) {
      startBackgroundMusic();
      setMusicStarted(true);
    }
  };

  // Update the state type
  const [demoCells, setDemoCells] = useState<DemoGridCell[]>(
    Array(9)
      .fill(null)
      .map((_, index) => ({
        x: index % 3,
        y: Math.floor(index / 3),
        tilled: true,
        crop: undefined,
        id: `demo-${index}`,
        justHarvested: false,
      }))
  );

  // Handle cell clicks
  const handleCellClick = (index: number) => {
    startMusic();
    setDemoCells((prev) => {
      const newCells = [...prev];
      const cell = newCells[index];

      if (!cell.crop && !cell.justHarvested && selectedSeed) {
        // Plant selected crop
        playSound("plant");
        cell.crop = {
          type: selectedSeed,
          plantedAt: Date.now(),
          growthStage: 0,
          readyToHarvest: false,
          growthTime: 9000,
        };
      } else if (cell.crop?.readyToHarvest) {
        // Get cell position for animation
        const cellElement = document.querySelector(
          `[data-cell-index="${index}"]`
        );
        if (cellElement) {
          const rect = cellElement.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          // Add harvest animation data
          cell.harvestAnimation = {
            x: centerX,
            y: centerY,
            type: cell.crop.type,
            amount: Math.floor(Math.random() * 3) + 1, // Random amount between 1-3
          };
        }

        // Harvest the crop and keep the soil tilled
        playSound("harvest");
        cell.crop = undefined;
        cell.justHarvested = true;

        // Remove the justHarvested flag and animation after a short delay
        setTimeout(() => {
          setDemoCells((prev) => {
            const newCells = [...prev];
            const cell = newCells[index];
            cell.justHarvested = false;
            cell.harvestAnimation = undefined;
            return newCells;
          });
        }, 1500);
      }

      return newCells;
    });
  };

  // Update growth stages
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoCells((prev) => {
        const newCells = [...prev];
        newCells.forEach((cell) => {
          if (cell.crop && !cell.crop.readyToHarvest) {
            const elapsed = Date.now() - cell.crop.plantedAt;
            // Each stage takes 3 seconds (total 9 seconds)
            const growthStage = Math.min(
              Math.floor(elapsed / (DEMO_GROWTH_TIME / 3)),
              3
            );

            cell.crop.growthStage = growthStage;
            cell.crop.readyToHarvest = growthStage === 3;
          }
        });
        return newCells;
      });
    }, 100); // Update more frequently for smoother progress bar

    return () => clearInterval(interval);
  }, []);

  // Add this function to handle mute toggle
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (isMuted) {
      startBackgroundMusic();
      setMusicStarted(true);
    } else {
      stopBackgroundMusic();
      setMusicStarted(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        marginTop: safeAreaInsets.top,
        marginBottom: safeAreaInsets.bottom,
        marginLeft: safeAreaInsets.left,
        marginRight: safeAreaInsets.right,
      }}
      className="fixed inset-0 w-full h-full z-[100] flex flex-col items-center justify-center gap-2 bg-black"
    >
      {/* Full-screen background image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/welcome.png"
          alt="Background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={100}
        />
      </div>

      {/* Semi-transparent gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/10" />

      {/* Content container */}
      <div className="relative z-20 flex flex-col items-center gap-2 w-full max-w-md p-4">
        {/* FarVille title */}
        <div className="flex flex-col text-center items-center gap-2">
          <h1 className="text-white/90 text-4xl font-bold [text-shadow:_2px_2px_4px_rgb(0_0_0_/_50%)]">
            FarVille
          </h1>
          <p className="text-white/70 text-sm [text-shadow:_1px_1px_2px_rgb(0_0_0_/_50%)]">
            Plant, grow, and harvest crops with frens!
          </p>
        </div>
        {/* Seed Selection Toolbar */}
        <div className="flex gap-2 mt-4">
          {CROPS.map(({ type, seedIcon, name }) => (
            <motion.div
              key={type}
              onClick={() => {
                startMusic();
                setSelectedSeed(type);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={SEED_ANIMATION}
              className={`
                relative w-14 h-14 rounded-lg flex flex-col items-center justify-center cursor-pointer
                bg-[#3d7a37] border-2
                ${
                  selectedSeed === type
                    ? "border-yellow-400"
                    : "border-[#2d5a27]"
                }
                hover:border-yellow-400/50 transition-colors
              `}
            >
              <Image
                src={seedIcon}
                alt={name}
                width={24}
                height={24}
                className="object-contain"
              />
              <span className={`text-[6px] text-white mt-0.5`}>{name}</span>

              {/* Update tooltip text */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-black/75 text-white text-[8px] px-2 py-1 rounded whitespace-nowrap">
                Click to select!
              </div>
            </motion.div>
          ))}
        </div>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-2">
          {demoCells.map((cell, index) => (
            <motion.div
              key={cell.id}
              data-cell-index={index}
              onClick={() => handleCellClick(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                w-20 h-20 rounded-lg relative cursor-pointer
                transition-colors duration-200
              `}
              style={{
                backgroundImage: cell.tilled ? "var(--soil-pattern)" : "none",
                backgroundSize: "4px 4px",
              }}
            >
              <DemoCropSprite crop={cell.crop} />
              {cell.harvestAnimation && (
                <FloatingNumber
                  number={cell.harvestAnimation.amount}
                  x={cell.harvestAnimation.x}
                  y={cell.harvestAnimation.y}
                  type="crop"
                  cropType={cell.harvestAnimation.type}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Presave Button */}
        {!showShareButton ? (
          <motion.button
            whileHover={{
              scale: 1.08,
              rotate: [-1, 1, -1],
              transition: {
                rotate: {
                  repeat: Infinity,
                  duration: 0.5,
                },
              },
            }}
            whileTap={{ scale: 0.92 }}
            animate={{
              y: [0, -10, 0],
              boxShadow: [
                "0 0 60px rgba(16,185,129,0.9), 0 0 60px rgba(34,197,94,0.8)",
                "0 0 80px rgba(16,185,129,1), 0 0 80px rgba(34,197,94,1)",
                "0 0 60px rgba(16,185,129,0.9), 0 0 60px rgba(34,197,94,0.8)",
              ],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            onClick={async () => {
              startMusic();
              await sdk.actions.addFrame();
              setShowShareButton(true);
              // onStart();
            }}
            className={`
            mt-8 px-16 py-4 
            bg-white text-emerald-600 
            rounded-none text-2xl font-bold
            hover:bg-emerald-100
            [image-rendering:pixelated]
            shadow-[0_0_60px_rgba(16,185,129,0.9),0_0_60px_rgba(34,197,94,0.8)]
            hover:shadow-[0_0_100px_rgba(16,185,129,1),0_0_100px_rgba(34,197,94,1)]
            transition-all duration-300
          `}
            style={{
              border: PIXEL_BORDER,
              imageRendering: "pixelated",
              textShadow: "3px 3px 0px rgba(0,0,0,0.3)",
            }}
          >
            Presave
          </motion.button>
        ) : (
          <div className="flex flex-col items-center mt-4">
            <p className="text-center text-yellow-300/90 text-[10px] w-3/4 [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)]">
              Invite friends and earn special rewards!
            </p>
            <motion.button
              whileHover={{
                scale: 1.08,
                rotate: [-1, 1, -1],
                transition: {
                  rotate: {
                    repeat: Infinity,
                    duration: 0.5,
                  },
                },
              }}
              whileTap={{ scale: 0.92 }}
              animate={{
                y: [0, -10, 0],
                boxShadow: [
                  "0 0 60px rgba(16,185,129,0.9), 0 0 60px rgba(34,197,94,0.8)",
                  "0 0 80px rgba(16,185,129,1), 0 0 80px rgba(34,197,94,1)",
                  "0 0 60px rgba(16,185,129,0.9), 0 0 60px rgba(34,197,94,0.8)",
                ],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              onClick={async () => {
                const url = warpcastComposeCastUrl();
                await sdk.actions.openUrl(url);
              }}
              className={`
            mt-4 px-16 py-4 
            bg-white text-emerald-600 
            rounded-none text-2xl font-bold
            hover:bg-emerald-100
            [image-rendering:pixelated]
            shadow-[0_0_60px_rgba(16,185,129,0.9),0_0_60px_rgba(34,197,94,0.8)]
            hover:shadow-[0_0_100px_rgba(16,185,129,1),0_0_100px_rgba(34,197,94,1)]
            transition-all duration-300
          `}
              style={{
                border: PIXEL_BORDER,
                imageRendering: "pixelated",
                textShadow: "3px 3px 0px rgba(0,0,0,0.3)",
              }}
            >
              Share
            </motion.button>
          </div>
        )}
        <div className="mt-2">
          <span className=" text-white/90 text-sm [text-shadow:_1px_1px_2px_rgb(0_0_0_/_80%)]">
            Early Access in Jan 2025!
          </span>
        </div>
        {showPreview && (
          <motion.button
            onClick={onComplete}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="px-8 py-2 text-xl font-bold text-white bg-transparent border-none cursor-pointer
              [text-shadow:_0_0_5px_#fff,_0_0_10px_#22c55e]
              hover:[text-shadow:_0_0_8px_#fff,_0_0_15px_#22c55e]
              transition-all duration-300"
          >
            Preview
          </motion.button>
        )}
      </div>

      {/* Add the sound control button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleMuteToggle}
        className="absolute top-4 right-4 z-30 transition-colors text-2xl [text-shadow:_0_0_20px_rgba(255,255,255,0.9)]"
      >
        {isMuted ? "🔇" : "🔊"}
      </motion.button>

      {/* Referral leaderboard */}
      <Link href="/leaderboard">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-4 left-4 z-30 transition-colors text-2xl [text-shadow:_0_0_20px_rgba(255,255,255,0.9)]"
        >
          🏆
        </motion.button>
      </Link>
    </motion.div>
  );
}
