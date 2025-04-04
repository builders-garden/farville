import "react-medium-image-zoom/dist/styles.css";
import Zoom from "react-medium-image-zoom";
import { useGame } from "@/context/GameContext";
import { useGetBackendSignature } from "@/hooks/use-get-backend-signature";
import {
  BASE_SCAN_BASE_URL,
  NFT_OG_BASE_ADDRESS,
} from "@/lib/contracts/constants";
import { cn, mintedCollectibleFlexCardComposeCastUrl } from "@/lib/utils";
import sdk from "@farcaster/frame-sdk";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
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
import { useUpdateMintPfpUser } from "@/hooks/use-update-mint-pfp-user";
import { CollectibleStatus } from "@/types/game";
import { useGenerateMidjourneyImage } from "@/hooks/use-generate-midjourney-image";
import { useGetMidjourneyImage } from "@/hooks/use-get-midjourney-image";
import { PFP_NFT_ABI } from "@/lib/contracts/pfp-nft/abi";
import { getLatestETHPrice } from "@/lib/lifi";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

interface MintCollectibleModalProps {
  onCancel: () => void;
}

export default function MintCollectibleModal({
  onCancel,
}: MintCollectibleModalProps) {
  const { state } = useGame();
  const { address } = useAccount();
  const [backendSignature, setBackendSignature] = useState<
    `0x${string}` | null
  >(null);
  const [midjourneyTaskId, setMidjourneyTaskId] = useState<string | null>(null);
  const [midjourneyImageUrl, setMidjourneyImageUrl] = useState<string | null>(
    null
  );
  const [selectedPrice, setSelectedPrice] = useState<number>(1);
  const [midjourneyImageUrls, setMidjourneyImageUrls] = useState<
    string[] | null
  >(null);
  const { mutate: getBackendSignature } = useGetBackendSignature({
    setBackendSignature,
  });
  const { mutate: generateMidjourneyImage } = useGenerateMidjourneyImage({
    setMidjourneyTaskId,
  });
  const { mutate: getMidjourneyImage } = useGetMidjourneyImage({
    setMidjourneyImageUrl,
    setMidjourneyImageUrls,
  });
  const { data: ethPrice = 0 } = useQuery({
    queryKey: ["eth-price"],
    queryFn: getLatestETHPrice,
    refetchInterval: 1800, // Refetch every half minute in milliseconds
  });

  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [nftId] = useState<number>(-1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({
    address,
    chainId: base.id,
  });

  const [pfpDescription, setPfpDescription] = useState<string | null>(null);
  const [pfpDescriptionLoading, setPfpDescriptionLoading] = useState(false);

  const farvilleAvatarCollectible = useMemo(
    () => state.collectibles.find((collectible) => collectible.id === 1),
    [state.collectibles]
  );

  useEffect(() => {
    console.log(
      farvilleAvatarCollectible,
      "user has collectibles",
      farvilleAvatarCollectible?.userHasCollectibles
    );
    if (
      farvilleAvatarCollectible &&
      farvilleAvatarCollectible.userHasCollectibles
    ) {
      switch (farvilleAvatarCollectible.userHasCollectibles.status) {
        case CollectibleStatus.Pending:
          if (farvilleAvatarCollectible.userHasCollectibles.generatedTaskId) {
            setMidjourneyTaskId(
              farvilleAvatarCollectible.userHasCollectibles.generatedTaskId
            );
          }
          break;
        case CollectibleStatus.Generated:
          if (
            farvilleAvatarCollectible.userHasCollectibles.generatedImageUrls &&
            farvilleAvatarCollectible.userHasCollectibles.generatedImageUrls
              .length > 0
          ) {
            setMidjourneyImageUrl(
              farvilleAvatarCollectible.userHasCollectibles
                .generatedImageUrls[0]
            );
            setMidjourneyImageUrls(
              farvilleAvatarCollectible.userHasCollectibles.generatedImageUrls.slice(
                1
              )
            );
          }
          break;
      }
    }
  }, [farvilleAvatarCollectible]);

  const userPfp = useMemo(() => {
    let avatarUrl = state.user.avatarUrl;
    if (avatarUrl) {
      if (
        avatarUrl.endsWith("/rectcrop3") ||
        avatarUrl.endsWith("/original") ||
        avatarUrl.endsWith("/public")
      ) {
        avatarUrl = avatarUrl.replace(
          "/rectcrop3",
          "/anim=false,fit=contain,f=auto,w=512"
        );
        avatarUrl = avatarUrl.replace(
          "/public",
          "/anim=false,fit=contain,f=auto,w=512"
        );
        avatarUrl = avatarUrl.replace(
          "/original",
          "/anim=false,fit=contain,f=auto,w=512"
        );
      }
    }
    return avatarUrl;
  }, [state.user.avatarUrl]);

  // get pfp description from openai
  useEffect(() => {
    const loadPfpDescription = async () => {
      if (userPfp) {
        setPfpDescriptionLoading(true);
        fetch(`/api/pfp-nft-text`, {
          method: "POST",
          body: JSON.stringify({ imageUrl: userPfp }),
        })
          .then((res) => res.json())
          .then((data) => {
            setPfpDescription(data.description);
            setPfpDescriptionLoading(false);
          })
          .catch((err) => {
            console.error("Error fetching pfp description:", err);
            setPfpDescriptionLoading(false);
          });
      }
    };
    if (!pfpDescription && userPfp) {
      loadPfpDescription();
    }
  }, [userPfp]);

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
  const { mutate: updateMintPfpUser } = useUpdateMintPfpUser();

  const handleGenerate = async () => {
    if (pfpDescription) {
      setIsLoading(true);
      generateMidjourneyImage({
        prompt: pfpDescription,
        fid: state.user.fid,
        collectibleId: farvilleAvatarCollectible?.id ?? 1,
      });
    }
  };

  const handleGetImage = async () => {
    if (midjourneyTaskId && farvilleAvatarCollectible) {
      setIsLoading(true);
      getMidjourneyImage({
        taskId: midjourneyTaskId,
        fid: state.user.fid.toString(),
        collectibleId: farvilleAvatarCollectible.id.toString() ?? "1",
      });
    }
  };

  const handleMint = async () => {
    if (address && selectedImageUrl) {
      setIsLoading(true);
      getBackendSignature({
        address,
        nftId: state.user.fid,
        tokenURI: selectedImageUrl,
      });
    }
  };

  useEffect(() => {
    setIsLoading(false);
    if (
      address &&
      selectedImageUrl &&
      chainId === base.id &&
      backendSignature &&
      backendSignature.length > 0 &&
      ethPrice > 0 &&
      selectedPrice > 0
    ) {
      try {
        writeContract({
          abi: PFP_NFT_ABI,
          address: NFT_OG_BASE_ADDRESS,
          functionName: "mint",
          // address, tokenId, price, tokenIdURI, signature
          args: [
            address,
            BigInt(state.user.fid),
            BigInt(selectedPrice / ethPrice),
            selectedImageUrl,
            backendSignature,
          ],
          chainId: base.id,
        });
      } catch (error) {
        console.error("Error minting Pfp NFT:", error);
      }
    }
  }, [
    nftId,
    backendSignature,
    writeContract,
    chainId,
    selectedPrice,
    ethPrice,
  ]);

  useEffect(() => {
    if (isReceiptSuccess) {
      updateMintPfpUser({
        nftId,
      });
      setShowConfetti(true);
    }
  }, [isReceiptSuccess]);

  const handleShareMint = async () => {
    const { castUrl } = mintedCollectibleFlexCardComposeCastUrl(
      state.user.fid,
      farvilleAvatarCollectible?.id.toString() ?? "",
      farvilleAvatarCollectible?.name ?? ""
    );
    await sdk.actions.openUrl(castUrl);
  };

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
              Farville Avatar
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
              {midjourneyImageUrls ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {midjourneyImageUrls?.map((imageUrl) => (
                    <CustomImage
                      key={imageUrl}
                      imageUrl={imageUrl}
                      alt={`User Pfp Generation`}
                      selected={selectedImageUrl === imageUrl}
                      onSelect={() => setSelectedImageUrl(imageUrl)}
                    />
                  ))}
                </div>
              ) : (
                <>
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
                    className="relative w-56 h-56 rounded-2xl border-8 border-yellow-400/40"
                  >
                    <Image
                      src={userPfp ?? `/images/badge/og.png`}
                      fill
                      alt={`User Pfp Generation`}
                      className="rounded-lg [animation:rotate_20s_linear_infinite] 
         [filter:drop-shadow(0_0_10px_rgba(234,179,8,0.5))]"
                    />
                  </motion.div>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 mb-2">
            <span className="text-yellow-300/90 text-[10px] text-center">
              Pick your farmer. Make it yours.
            </span>
            <Separator className="w-[80%] m-auto bg-yellow-500/50" />
            <span className="text-white/70 text-[8px] text-center">
              Choose a custom avatar to represent you and climb the leaderboards
              in style.
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
            {/* PRICE */}
            {(farvilleAvatarCollectible &&
              farvilleAvatarCollectible.userHasCollectibles &&
              farvilleAvatarCollectible.userHasCollectibles.status ===
                CollectibleStatus.Generated) ||
            midjourneyImageUrl ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-full flex flex-row items-center justify-between gap-2">
                  <span className="w-full text-white/70 text-lg">Pay</span>
                  <p className="flex gap-1 w-full text-white/70 text-[8px] items-center justify-end">
                    {Number(selectedPrice).toFixed(0)} USD{" "}
                    <span className="text-[6px]">&#8776;</span>{" "}
                    {Number(selectedPrice / ethPrice).toFixed(5)} ETH
                  </p>
                </div>
                <div className="flex flex-row items-center justify-between gap-2 w-full">
                  <div className="w-full relative flex flex-row items-center gap-2">
                    {[1, 3, 5].map((price) => (
                      <Button
                        key={`mint-price-${price}`}
                        variant="ghost"
                        onClick={() => setSelectedPrice(price)}
                        className={cn(
                          "text-md px-3 w-full rounded-xl text-white font-semibold",
                          selectedPrice === price
                            ? "bg-[#8A5F3C] opacity-100 border-2 border-white/80"
                            : "bg-[#8A5F3C] hover:bg-[#8A5F3C]/80 hover:text-white/80 opacity-80 border-2 border-transparent hover:border-white/80"
                        )}
                      >
                        ${price}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
            {/* SHARE, already minted */}
            {farvilleAvatarCollectible &&
            farvilleAvatarCollectible.userHasCollectibles &&
            farvilleAvatarCollectible.userHasCollectibles.status ===
              CollectibleStatus.Minted ? (
              <button
                onClick={handleShareMint}
                className={`flex-1 py-2 px-4 rounded bg-[#179ef9]/20 text-[#179ef9] hover:bg-[#179ef9]/30 transition-colors text-sm font-medium border border-[#179ef9]/30 flex items-center justify-center gap-2`}
              >
                Share
              </button>
            ) : farvilleAvatarCollectible &&
              farvilleAvatarCollectible.userHasCollectibles &&
              farvilleAvatarCollectible.userHasCollectibles.status ===
                CollectibleStatus.Pending &&
              !midjourneyTaskId ? (
              <button
                disabled={pfpDescriptionLoading || !pfpDescription}
                onClick={handleGenerate}
                className={`flex-1 py-2 px-4 rounded bg-[#179ef9]/20 text-[#179ef9] hover:bg-[#179ef9]/30 transition-colors text-sm font-medium border border-[#179ef9]/30 flex items-center justify-center gap-2`}
              >
                Generate
              </button>
            ) : farvilleAvatarCollectible &&
              farvilleAvatarCollectible.userHasCollectibles &&
              farvilleAvatarCollectible.userHasCollectibles.status ===
                CollectibleStatus.Pending &&
              midjourneyTaskId &&
              !midjourneyImageUrl ? (
              <button
                onClick={handleGetImage}
                className={`flex-1 py-2 px-4 rounded bg-[#179ef9]/20 text-[#179ef9] hover:bg-[#179ef9]/30 transition-colors text-sm font-medium border border-[#179ef9]/30 flex items-center justify-center gap-2`}
              >
                Get Image
              </button>
            ) : (farvilleAvatarCollectible &&
                farvilleAvatarCollectible.userHasCollectibles &&
                farvilleAvatarCollectible.userHasCollectibles.status ===
                  CollectibleStatus.Generated) ||
              midjourneyImageUrl ? (
              <button
                onClick={handleMint}
                disabled={
                  isLoading ||
                  !address ||
                  !selectedImageUrl ||
                  isPending ||
                  isReceiptLoading ||
                  hasInsufficientBalance
                }
                className={`flex-1 py-2 px-4 rounded ${
                  isLoading ||
                  !address ||
                  !selectedImageUrl ||
                  isPending ||
                  isReceiptLoading ||
                  hasInsufficientBalance
                    ? "text-yellow-400/50 cursor-not-allowed bg-yellow-500/10"
                    : "bg-yellow-500 text-yellow-500/20"
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
            ) : null}
            {!state.user.mintedOG && !address && (
              <span className="text-center text-[9px] text-white/70 border border-white/70 rounded w-fit px-4 py-2 m-auto mt-2">
                Please connect a wallet to mint the badge.
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

const CustomImage = ({
  imageUrl,
  alt,
  selected,
  onSelect,
}: {
  imageUrl: string;
  alt: string;
  selected: boolean;
  onSelect: () => void;
}) => {
  return (
    <div
      className="flex flex-col gap-2 px-2 py-1 items-center justify-center cursor-pointer"
      onClick={onSelect}
    >
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(
          "relative rounded-2xl border-8 border-yellow-400/20 size-32",
          selected && "border-green-400/80"
        )}
      >
        {selected && (
          <Check className="absolute -top-3 -right-3 bg-green-400 text-white rounded-full p-1 z-10" />
        )}
        <Zoom>
          <Image
            src={imageUrl ?? `/images/badge/og.png`}
            alt={alt}
            fill
            className="rounded-lg [animation:rotate_20s_linear_infinite] 
           [filter:drop-shadow(0_0_10px_rgba(234,179,8,0.5))]"
          />
        </Zoom>
      </motion.div>
    </div>
  );
};
