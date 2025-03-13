import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { Separator } from "../ui/separator";
import { useAccount, useWriteContract } from "wagmi";
import { NFT_OG_BASE_SEPOLIA_ABI } from "@/lib/contracts/og-nft/abi";
import { useGetMerkleProof } from "@/hooks/use-get-merkle-proof";
import { useEffect, useState } from "react";
import { NFT_OG_BASE_SEPOLIA_ADDRESS } from "@/lib/contracts/constants";
import { merkleValues } from "@/lib/contracts/og-nft/merkle-root/merkleValues";
import Confetti from "../animations/Confetti";

interface MintOgModalProps {
  onCancel: () => void;
}

export default function MintOgModal({ onCancel }: MintOgModalProps) {
  const { writeContract, isError, error, isPending, isSuccess } =
    useWriteContract();
  const { address } = useAccount();
  const [merkleProof, setMerkleProof] = useState<`0x${string}`[] | null>(null);
  const { mutate: getMerkleProof } = useGetMerkleProof({ setMerkleProof });
  const [nftId, setNftId] = useState<number>(-1);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (address) {
      const userEntry = merkleValues.find(
        ([addr]) => addr.toLowerCase() === address.toLowerCase()
      );
      if (userEntry) {
        const userNftId = parseInt(userEntry[1], 10);
        setNftId(userNftId);
      } else {
        setNftId(-1);
      }
    }
  }, [address]);

  const handleMint = async () => {
    if (address) {
      getMerkleProof({
        address,
        nftId,
      });
    }
  };

  useEffect(() => {
    if (merkleProof && merkleProof.length > 0) {
      try {
        writeContract({
          abi: NFT_OG_BASE_SEPOLIA_ABI,
          address: NFT_OG_BASE_SEPOLIA_ADDRESS,
          functionName: "mint",
          args: [BigInt(nftId), merkleProof],
        });
      } catch (error) {
        console.error("Error minting OG NFT:", error);
      }
    }
  }, [nftId, merkleProof, writeContract]);

  useEffect(() => {
    if (isSuccess) {
      setShowConfetti(true);
    }
  }, [isSuccess]);

  return (
    <>
      {showConfetti && <Confetti title="MINTED!" />}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 100 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              type: "spring",
              damping: 15,
              stiffness: 200,
            },
          }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="flex flex-col gap-4 bg-gradient-to-br from-[#8B5E3C] to-[#6A4123] p-6 rounded-lg max-w-sm w-full mx-4 border border-[#8B5E3C]/50 
          [box-shadow:0_0_50px_rgba(234,179,8,0.3)] relative"
        >
          <button
            onClick={onCancel}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full 
                    bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
            aria-label="Close"
          >
            <X size={14} />
          </button>

          <div className="flex flex-row items-center gap-2">
            <h3 className={`text-white/90 font-bold text-lg m-auto`}>
              Farville OG Badge
            </h3>
          </div>
          <div className="flex flex-col gap-4 my-4">
            <div className="relative mx-auto">
              <motion.div
                animate={{
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-8 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-gradient-radial from-yellow-400 via-yellow-500/30 to-transparent 
        blur-xl -z-10"
                style={{
                  transform: "translateX(-50%) translateY(60%)",
                }}
              />

              {/* New pulsing yellow shadow around image */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px 8px rgba(234, 179, 8, 0.5)",
                    "0 0 40px 15px rgba(234, 179, 8, 0.7)",
                    "0 0 20px 8px rgba(234, 179, 8, 0.5)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-1/2 left-1/2 w-52 h-52 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-yellow-400/10 blur-md -z-5"
              />

              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative w-56 h-56 rounded-xl border-8 border-yellow-400/40"
              >
                <Image
                  src={`/images/badge/og.png`}
                  alt={`OG Badge Minting`}
                  layout="fill"
                  className="rounded-lg [animation:rotate_20s_linear_infinite] 
           [filter:drop-shadow(0_0_10px_rgba(234,179,8,0.5))]"
                />
              </motion.div>
            </div>
          </div>
          <div className="flex flex-col gap-4 mb-2">
            <span className="text-yellow-300/90 text-[10px] text-center">
              A symbol of honor, proving your participation in Farville Alpha.
            </span>
            <Separator className="w-[80%] m-auto bg-yellow-500/50" />
            <span className="text-white/70 text-[8px] text-center px-2">
              Mint your badge and get a special look to show off in the
              leaderboards!
            </span>
            {isError && (
              <span className="bg-red-500 text-red-200 text-[8px] p-2 rounded">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(error.cause as any).details || "Error minting badge."}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleMint}
              disabled={!address || nftId === -1 || isPending}
              className={`flex-1 py-2 px-4 rounded bg-yellow-500/20 text-yellow-400 ${
                !address || nftId === -1 || isPending
                  ? "text-yellow-400/50 cursor-not-allowed bg-yellow-500/10"
                  : "hover:bg-yellow-500/30"
              } ${
                isSuccess
                  ? "bg-green-500 text-green-200 cursor-not-allowed"
                  : ""
              }
          transition-colors text-sm font-medium border border-yellow-500/30 flex items-center justify-center gap-2`}
            >
              {isPending
                ? "Minting..."
                : isSuccess
                ? "Minted Successfully!"
                : "Mint"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
