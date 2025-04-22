import { useGame } from "@/context/GameContext";
import { useGetMerkleProof } from "@/hooks/use-get-merkle-proof";
import { useUpdateMintOgUser } from "@/hooks/use-update-mint-og-user";
import {
  BASE_SCAN_BASE_URL,
  NFT_OG_BASE_ADDRESS,
  OG_FIDS_LIST,
} from "@/lib/contracts/constants";
import { NFT_OG_BASE_ABI } from "@/lib/contracts/og-nft/abi";
import { merkleValues } from "@/lib/contracts/og-nft/merkle-root/merkleValues";
import { missingUsers } from "@/lib/contracts/og-nft/merkle-root/missingUsers";
import { mintedOgFlexCardComposeCastUrl } from "@/lib/utils";
import sdk from "@farcaster/frame-sdk";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { base } from "viem/chains";
import {
  useAccount,
  useBalance,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import Confetti from "../animations/Confetti";
import { Separator } from "../ui/separator";

interface MintOgModalProps {
  onCancel: () => void;
}

export default function MintOgModal({ onCancel }: MintOgModalProps) {
  const { address } = useAccount();
  const [merkleProof, setMerkleProof] = useState<`0x${string}`[] | null>(null);
  const { mutate: getMerkleProof } = useGetMerkleProof({ setMerkleProof });
  const [nftId, setNftId] = useState<number>(-1);
  const [showConfetti, setShowConfetti] = useState(false);
  const { state } = useGame();
  const [isLoading, setIsLoading] = useState(false);
  const { chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const missingUsersKeys = Object.keys(missingUsers).map((key) => Number(key));
  const isUserFidMissing = missingUsersKeys.includes(state.user.fid);

  const { data: balance } = useBalance({
    address,
    chainId: base.id,
  });

  const hasInsufficientBalance = !balance || balance.value <= BigInt(0);

  useEffect(() => {
    if (chainId !== base.id) {
      switchChain({
        chainId: base.id,
      });
    }
  }, [chainId, switchChain]);

  const {
    writeContract,
    isError,
    error,
    isPending,
    data: txHash,
  } = useWriteContract();
  const {
    isLoading: isReceiptLoading,
    isSuccess: isReceiptSuccess,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: txHash !== undefined,
    },
  });
  const { mutate: updateMintOgUser } = useUpdateMintOgUser();

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
      setIsLoading(true);
      getMerkleProof({
        address,
        nftId,
      });
    }
  };

  useEffect(() => {
    setIsLoading(false);
    if (merkleProof && merkleProof.length > 0 && chainId === base.id) {
      try {
        writeContract({
          abi: NFT_OG_BASE_ABI,
          address: NFT_OG_BASE_ADDRESS,
          functionName: "mint",
          args: [BigInt(nftId), merkleProof],
          chainId: base.id,
        });
      } catch (error) {
        console.error("Error minting OG NFT:", error);
      }
    }
  }, [nftId, merkleProof, writeContract, chainId]);

  useEffect(() => {
    if (isReceiptSuccess) {
      updateMintOgUser({
        nftId,
      });
      setShowConfetti(true);
    }
  }, [isReceiptSuccess]);

  const handleShareMint = async () => {
    const { castUrl } = mintedOgFlexCardComposeCastUrl(state.user.fid);
    await sdk.actions.composeCast(castUrl);
  };

  const userIsEligibleButWrongAddress =
    address &&
    OG_FIDS_LIST.includes(state.user.fid) &&
    !merkleValues.find(
      ([addr]) => addr.toLowerCase() === address?.toLowerCase()
    );

  return (
    <>
      {showConfetti && <Confetti title="MINTED!" />}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: 20,
          }}
          transition={{
            duration: 0.2,
            ease: [0.4, 0, 0.2, 1], // Custom easing for smooth animation
          }}
          className="flex flex-col gap-4 bg-gradient-to-br from-[#8B5E3C] to-[#6A4123] p-6 rounded-lg max-w-sm w-full mx-4 border border-[#8B5E3C]/50 
          [box-shadow:0_0_50px_rgba(234,179,8,0.3)] relative will-change-transform"
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
                  fill
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
            {isError &&
              /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
              !String((error.cause as any)?.details).includes("rejected") && (
                <span className="bg-red-500 text-red-200 text-[8px] p-2 rounded">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(error.cause as any).details || "Error minting badge."}
                </span>
              )}
            {isReceiptError && (
              <span className="bg-red-500 text-red-200 text-[8px] p-2 rounded">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(receiptError.cause as any).details || "Tx to mint failed."}
              </span>
            )}
            {hasInsufficientBalance && state.user.mintedOG === false && (
              <span className="bg-red-500 text-red-200 text-[8px] p-2 rounded">
                Insufficient ETH balance to mint. Please add some ETH to your
                wallet.
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {!isUserFidMissing && state.user.mintedOG ? (
              <button
                onClick={handleShareMint}
                className={`flex-1 py-2 px-4 rounded bg-[#179ef9]/20 text-[#179ef9] hover:bg-[#179ef9]/30 transition-colors text-sm font-medium border border-[#179ef9]/30 flex items-center justify-center gap-2`}
              >
                Share
              </button>
            ) : (
              <button
                onClick={handleMint}
                disabled={
                  isLoading ||
                  !address ||
                  nftId === -1 ||
                  isPending ||
                  isReceiptLoading ||
                  state.user.mintedOG ||
                  isUserFidMissing ||
                  hasInsufficientBalance
                }
                className={`${
                  isUserFidMissing && "opacity-70"
                } flex-1 py-2 px-4 rounded bg-yellow-500/20 text-yellow-400 ${
                  !address ||
                  nftId === -1 ||
                  isLoading ||
                  isPending ||
                  isReceiptLoading ||
                  state.user.mintedOG ||
                  isUserFidMissing ||
                  hasInsufficientBalance
                    ? "text-yellow-400/50 cursor-not-allowed bg-yellow-500/10"
                    : "hover:bg-yellow-500/30"
                } ${
                  isReceiptSuccess
                    ? "bg-green-500 text-green-200 cursor-not-allowed"
                    : ""
                }
          transition-colors text-sm font-medium border border-yellow-500/30 flex items-center justify-center gap-2`}
              >
                {isLoading || isPending || isReceiptLoading
                  ? "Minting..."
                  : isReceiptSuccess
                  ? "Minted Successfully!"
                  : state.user.mintedOG
                  ? "Already Minted"
                  : "Mint"}
              </button>
            )}
            {isUserFidMissing && (
              <span className="text-center text-[9px] text-white/70 border border-white/70 rounded w-fit px-4 py-2 m-auto mt-2">
                You are eligible, but you need to link a wallet first. Enable
                your Warpcast Wallet, or contact limone.eth!
              </span>
            )}
            {!state.user.mintedOG && !address && (
              <span className="text-center text-[9px] text-white/70 border border-white/70 rounded w-fit px-4 py-2 m-auto mt-2">
                Please connect a wallet to mint the badge.
              </span>
            )}
            {!state.user.mintedOG && userIsEligibleButWrongAddress && (
              <span className="text-center text-[9px] text-white/70 border border-white/70 rounded w-fit px-4 py-2 m-auto mt-2">
                You are eligible to mint the badge, but your current connected
                wallet was not verified on Farcaster at the time of the
                snapshot. Please change wallet to mint the badge or contact
                Farville team.
              </span>
            )}
            {isReceiptSuccess && txHash && (
              <p
                className="text-white/70 text-[8px] text-center underline cursor-pointer"
                onClick={async () => {
                  await sdk.actions.openUrl(
                    BASE_SCAN_BASE_URL + `/tx/${txHash}`
                  );
                }}
              >
                View transaction on BaseScan
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
