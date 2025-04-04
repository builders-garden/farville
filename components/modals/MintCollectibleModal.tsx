import { useGame } from "@/context/GameContext";
import { useGetBackendSignature } from "@/hooks/use-get-backend-signature";
import {
  BASE_SCAN_BASE_URL,
  PFP_NFT_BASE_ADDRESS,
  BASE_USDC_ADDRESS,
} from "@/lib/contracts/constants";
import {
  cn,
  formatNumberWithSuffix,
  mintedCollectibleFlexCardComposeCastUrl,
} from "@/lib/utils";
import sdk from "@farcaster/frame-sdk";
import { motion } from "framer-motion";
import { Check, X, ZoomInIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { base } from "viem/chains";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useAccount,
  useBalance,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { erc20Abi } from "viem";
import Confetti from "../animations/Confetti";
import { Separator } from "../ui/separator";
import { useUpdateMintPfpUser } from "@/hooks/use-update-mint-pfp-user";
import { CollectibleStatus } from "@/types/game";
import { useGenerateMidjourneyImage } from "@/hooks/use-generate-midjourney-image";
import { useGetMidjourneyImage } from "@/hooks/use-get-midjourney-image";
import { PFP_NFT_ABI } from "@/lib/contracts/pfp-nft/abi";
import { Button } from "@/components/ui/button";
import { usePinata } from "@/hooks/use-pinata";

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
  const [selectedPrice, setSelectedPrice] = useState<number>(3);
  const [pfpDescription, setPfpDescription] = useState<string | null>(null);
  const [pfpDescriptionLoading, setPfpDescriptionLoading] = useState(false);
  const [pinataMetadataCID, setPinataMetadataCID] = useState<string | null>(
    null
  );
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
  const { mutate: uploadPinata } = usePinata({
    setMetadataCID: setPinataMetadataCID,
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
  const { data: usdcBalance } = useReadContract({
    abi: erc20Abi,
    address: BASE_USDC_ADDRESS,
    functionName: "balanceOf",
    args: [address!],
    query: {
      enabled: address !== undefined,
    },
  });

  const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: BASE_USDC_ADDRESS,
    functionName: "allowance",
    args: [address!, PFP_NFT_BASE_ADDRESS],
    query: {
      enabled: address !== undefined,
    },
  });

  const { data: allowanceTxHash, writeContract: writeContractAllowance } =
    useWriteContract();

  const allowanceTxResult = useWaitForTransactionReceipt({
    hash: allowanceTxHash,
  });

  useEffect(() => {
    if (allowanceTxResult.isSuccess) {
      refetchAllowance();
    }
  }, [allowanceTxResult.isSuccess, refetchAllowance]);

  const farvilleAvatarCollectible = useMemo(
    () => state.collectibles.find((collectible) => collectible.id === 1),
    [state.collectibles]
  );

  useEffect(() => {
    if (
      farvilleAvatarCollectible &&
      farvilleAvatarCollectible.userHasCollectibles
    ) {
      switch (farvilleAvatarCollectible.userHasCollectibles.status) {
        case CollectibleStatus.Uploaded:
          if (farvilleAvatarCollectible.userHasCollectibles.mintedMetadataUrl) {
            const metadataCID =
              farvilleAvatarCollectible.userHasCollectibles.mintedMetadataUrl.split(
                "https://gateway.pinata.cloud/ipfs/"
              )[1];
            setPinataMetadataCID(metadataCID);
          }
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
        case CollectibleStatus.Pending:
          if (farvilleAvatarCollectible.userHasCollectibles.generatedTaskId) {
            setMidjourneyTaskId(
              farvilleAvatarCollectible.userHasCollectibles.generatedTaskId
            );
          }
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
    if (
      !pfpDescription &&
      userPfp &&
      ((farvilleAvatarCollectible &&
        !farvilleAvatarCollectible.userHasCollectibles) ||
        (farvilleAvatarCollectible &&
          farvilleAvatarCollectible.userHasCollectibles &&
          farvilleAvatarCollectible.userHasCollectibles.status ===
            CollectibleStatus.Pending))
    ) {
      loadPfpDescription();
    }
  }, [userPfp, farvilleAvatarCollectible?.userHasCollectibles]);

  const hasInsufficientBalance = !balance || balance.value <= BigInt(0);

  useEffect(() => {
    if (chainId !== base.id) {
      switchChain({
        chainId: base.id,
      });
    }
  }, [chainId, switchChain]);

  const {
    writeContract: writeContractMint,
    isError,
    error,
    isPending,
    data: mintTxHash,
  } = useWriteContract();

  const {
    isLoading: isReceiptLoading,
    isSuccess: isReceiptSuccess,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: mintTxHash,
    query: {
      enabled: mintTxHash !== undefined,
    },
  });
  const { mutate: updateMintPfpUser } = useUpdateMintPfpUser();

  const hasEnoughUsdcBalance = useMemo(() => {
    if (!usdcBalance || !address) return false;
    const requiredUsdc = BigInt(Math.ceil(selectedPrice * 10 ** 6));
    return BigInt(usdcBalance) >= requiredUsdc;
  }, [usdcBalance, address, selectedPrice]);

  const hasEnoughUsdcAllowance = useMemo(() => {
    if (!usdcAllowance || !address) return false;
    const requiredAllowance = BigInt(Math.ceil(selectedPrice * 10 ** 6));
    return BigInt(usdcAllowance) >= requiredAllowance;
  }, [usdcAllowance, address, selectedPrice]);

  const handleGenerate = async () => {
    if (pfpDescription && !midjourneyTaskId) {
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
      uploadPinata({
        imageUrl: selectedImageUrl,
        fid: state.user.fid,
        collectibleId: farvilleAvatarCollectible?.id ?? 1,
      });
    }
  };

  const handleApprove = async () => {
    try {
      if (address) {
        writeContractAllowance({
          address: BASE_USDC_ADDRESS,
          abi: erc20Abi,
          functionName: "approve",
          args: [PFP_NFT_BASE_ADDRESS, BigInt(selectedPrice * 10 ** 6)],
        });
      }
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (pinataMetadataCID && address) {
      getBackendSignature({
        address,
        nftId: state.user.fid,
        tokenURI: pinataMetadataCID,
      });
    }
  }, [address, pinataMetadataCID, getBackendSignature, state.user.fid]);

  useEffect(() => {
    if (
      !mintTxHash &&
      selectedImageUrl &&
      address &&
      pinataMetadataCID &&
      chainId === base.id &&
      backendSignature &&
      selectedPrice > 0
    ) {
      console.log("minting pfp nft");
      console.log({
        address,
        fid: state.user.fid,
        price: BigInt(selectedPrice * 10 ** 6),
        pinataMetadataCID,
        backendSignature,
      });
      try {
        writeContractMint({
          abi: PFP_NFT_ABI,
          address: PFP_NFT_BASE_ADDRESS,
          functionName: "mint",
          // address, tokenId, price, tokenIdURI, signature
          args: [
            address,
            BigInt(state.user.fid),
            BigInt(selectedPrice * 10 ** 6),
            pinataMetadataCID,
            backendSignature,
          ],
          chainId: base.id,
        });
      } catch (error) {
        console.error("Error minting Pfp NFT:", error);
      }
    }
  }, [nftId, backendSignature, writeContractMint, chainId, selectedPrice]);

  useEffect(() => {
    if (isReceiptSuccess && mintTxHash) {
      updateMintPfpUser({
        collectibleId: farvilleAvatarCollectible?.id ?? 1,
        txHash: mintTxHash,
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
          className="flex flex-col gap-2 xs:gap-4 bg-gradient-to-br from-[#8B5E3C] to-[#6A4123] p-4 xs:p-6 rounded-lg max-w-sm w-full mx-4 border border-[#8B5E3C]/50 
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
                    className="relative w-48 h-48 xs:w-56 xs:h-56 rounded-2xl border-8 border-yellow-400/40"
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
          <div className="flex flex-col gap-2 xs:gap-4 mb-2">
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
            {address !== undefined &&
              hasInsufficientBalance &&
              state.user.mintedOG === false && (
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
                  <span className="text-white/70 text-lg">Pay</span>
                  {/* USDC logo */}
                  <div className="w-full flex items-center justify-end gap-2">
                    {usdcBalance && usdcBalance > BigInt(0) ? (
                      <span className="flex flex-row items-center gap-1 text-white/70 text-[8px]">
                        You have{" "}
                        {formatNumberWithSuffix(Number(usdcBalance) / 10 ** 6)}{" "}
                        USDC
                      </span>
                    ) : null}
                    <svg
                      id="Layer_1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 223.57616 223.57615"
                      className="size-[1rem]"
                    >
                      <path
                        id="Logo"
                        className="cls-1"
                        fill="#2775ca"
                        fillRule="evenodd"
                        strokeWidth="0px"
                        d="m111.78808,0c61.73902,0,111.78809,50.04906,111.78809,111.78808s-50.04907,111.78808-111.78809,111.78808S0,173.5271,0,111.78808,50.04906,0,111.78808,0Z"
                      />
                      <path
                        className="cls-2"
                        fill="#fff"
                        d="m137.33056,33.07349c-2.52071-.80531-4.582.69089-4.582,3.33742h0v6.5087c0,1.77458,1.33752,3.79422,3.00338,4.40489,26.7568,9.80009,45.9037,35.51836,45.9037,65.62837s-19.1469,55.8274-45.9037,65.62792c-1.82719.66942-3.00338,2.45891-3.00338,4.40534h0v6.50826c0,2.64609,2.06128,4.14273,4.582,3.33742,33.81349-10.80356,58.29859-42.48165,58.29859-79.87893s-24.4851-69.07583-58.29859-79.87938Zm-46.50253,3.33742c0-2.64653-2.06128-4.14273-4.582-3.33742-33.81392,10.80355-58.29901,42.48166-58.29901,79.87938s24.4851,69.07538,58.29901,79.87893c2.52071.80532,4.582-.69133,4.582-3.33742h0v-6.50826c0-1.77502-1.33751-3.79509-3.00381-4.40534-26.75637-9.80052-45.90369-35.51836-45.90369-65.62792s19.14732-55.82828,45.90369-65.62837c1.6663-.61067,3.00381-2.63031,3.00381-4.40489h0v-6.5087Zm24.45353,20.64792h-6.98654c-1.92933,0-3.49349,1.56372-3.49349,3.49305h0v10.82283c-13.85076,1.96923-22.80477,11.18671-22.80477,23.01169,0,15.3062,9.25299,21.24543,28.78346,23.87355,13.24974,2.17044,17.02116,5.02389,17.02116,12.56453,0,7.53803-6.39953,12.56411-15.42018,12.56411-12.19761,0-16.21146-5.33734-17.69189-12.24584-.35071-1.63649-1.75222-2.83284-3.42598-2.83284h-7.96896c-2.00736,0-3.57678,1.8079-3.23177,3.78545,2.02928,11.62815,9.49717,20.15998,24.73892,22.22785h0v11.03019c0,1.92934,1.56416,3.49349,3.49349,3.49349h6.98654c1.92933,0,3.49349-1.56416,3.49349-3.49349h0v-11.03589c14.42855-2.29188,23.64691-12.33614,23.64691-24.75032,0-16.33334-9.93819-21.81709-29.12935-24.44301-14.16333-2.05646-16.9028-5.36977-16.9028-11.99508,0-6.28073,4.79594-10.73735,14.04891-10.73735,8.3692,0,13.18223,2.92096,15.17074,9.6563.44365,1.50322,1.78861,2.56587,3.35627,2.56587h7.34908c2.04901,0,3.64429-1.88331,3.20678-3.88584-2.3265-10.64398-9.50023-17.03124-20.74655-19.04606h0v-11.13014c0-1.92933-1.56416-3.49305-3.49349-3.49305h0Z"
                      />
                    </svg>
                  </div>
                </div>
                {/* SELECT MINT PRICE */}
                <div className="w-full flex flex-row items-center justify-between gap-2">
                  <div className="w-full relative flex flex-row items-center gap-2">
                    {[1, 3, 5].map((price) => (
                      <Button
                        key={`mint-price-${price}`}
                        variant="ghost"
                        onClick={() => setSelectedPrice(price)}
                        className={cn(
                          "text-md px-3 w-full rounded-md text-white font-semibold",
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

            {/* BIG BUTTON */}
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
            ) : (!midjourneyTaskId &&
                farvilleAvatarCollectible &&
                !farvilleAvatarCollectible.userHasCollectibles) ||
              (farvilleAvatarCollectible &&
                farvilleAvatarCollectible.userHasCollectibles &&
                farvilleAvatarCollectible.userHasCollectibles.status ===
                  CollectibleStatus.Pending &&
                !midjourneyTaskId) ? (
              <button
                disabled={pfpDescriptionLoading || !pfpDescription || !address}
                onClick={handleGenerate}
                className={`flex-1 py-2 px-4 rounded ${
                  pfpDescriptionLoading || !pfpDescription || !address
                    ? "bg-[#179ef9]/10 text-[#179ef9]/50 cursor-not-allowed"
                    : "bg-[#179ef9]/20 text-[#179ef9] hover:bg-[#179ef9]/30"
                } 
                  transition-colors text-sm font-medium border border-[#179ef9]/30 flex items-center justify-center gap-2`}
              >
                Generate
              </button>
            ) : (midjourneyTaskId &&
                farvilleAvatarCollectible &&
                !farvilleAvatarCollectible.userHasCollectibles) ||
              (farvilleAvatarCollectible &&
                farvilleAvatarCollectible.userHasCollectibles &&
                farvilleAvatarCollectible.userHasCollectibles.status ===
                  CollectibleStatus.Pending &&
                midjourneyTaskId &&
                !midjourneyImageUrl) ? (
              <button
                onClick={handleGetImage}
                className={`flex-1 py-2 px-4 rounded bg-[#179ef9]/20 text-[#179ef9] hover:bg-[#179ef9]/30 transition-colors text-sm font-medium border border-[#179ef9]/30 flex items-center justify-center gap-2`}
              >
                Get Image
              </button>
            ) : !hasEnoughUsdcAllowance ? (
              <button
                onClick={handleApprove}
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
                    : "text-[#5C4121] bg-yellow-500"
                } ${
                  isReceiptSuccess
                    ? "bg-green-500 text-green-200 cursor-not-allowed"
                    : ""
                }
          transition-colors text-sm font-medium border border-yellow-500/30 flex items-center justify-center gap-2`}
              >
                {!selectedImageUrl
                  ? "Select an image"
                  : isLoading || isPending || isReceiptLoading
                  ? "Approving..."
                  : isReceiptSuccess
                  ? "Approved Successfully!"
                  : state.user.mintedOG
                  ? "Already Minted"
                  : "Approve"}
              </button>
            ) : hasEnoughUsdcBalance &&
              hasEnoughUsdcAllowance &&
              farvilleAvatarCollectible &&
              farvilleAvatarCollectible.userHasCollectibles &&
              (farvilleAvatarCollectible.userHasCollectibles.status ===
                CollectibleStatus.Generated ||
                farvilleAvatarCollectible.userHasCollectibles.status ===
                  CollectibleStatus.Uploaded) &&
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
                    : "text-[#5C4121] bg-yellow-500"
                } ${
                  isReceiptSuccess
                    ? "bg-green-500 text-green-200 cursor-not-allowed"
                    : ""
                }
          transition-colors text-sm font-medium border border-yellow-500/30 flex items-center justify-center gap-2`}
              >
                {!selectedImageUrl
                  ? "Select an image"
                  : isLoading || isPending || isReceiptLoading
                  ? "Minting..."
                  : isReceiptSuccess
                  ? "Minted Successfully!"
                  : state.user.mintedOG
                  ? "Already Minted"
                  : "Mint"}
              </button>
            ) : null}
            {!state.user.mintedOG && !address && (
              <span className="text-center text-[9px] text-white/70 border border-white/70 rounded w-fit px-4 py-2 m-auto mt-1 xs:mt-2">
                Please connect a wallet to mint the badge.
              </span>
            )}

            {isReceiptSuccess && mintTxHash && (
              <p
                className="text-white/70 text-[8px] text-center underline cursor-pointer"
                onClick={async () => {
                  await sdk.actions.openUrl(
                    BASE_SCAN_BASE_URL + `/tx/${mintTxHash}`
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
      className="relative flex flex-col gap-2 px-2 py-1 items-center justify-center cursor-pointer"
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
          "relative rounded-2xl border-8 border-yellow-400/20 size-28 xs:size-32",
          selected && "border-green-400/80"
        )}
      >
        {selected && (
          <Check className="absolute -top-3 -right-3 bg-green-400 text-white rounded-full p-1 z-10" />
        )}
        <Image
          src={imageUrl ?? `/images/badge/og.png`}
          alt={alt}
          fill
          className="rounded-lg [animation:rotate_20s_linear_infinite] 
           [filter:drop-shadow(0_0_10px_rgba(234,179,8,0.5))] cursor-normal"
        />
        <Dialog>
          <DialogTrigger asChild>
            <div className="absolute right-0 bottom-3 items-center justify-center flex">
              <div className="w-full h-full flex items-center justify-center size-8 bg-white/70 p-1 rounded-full cursor-zoom-in">
                <ZoomInIcon className="size-4 text-black" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="w-full h-full">
            <DialogTitle className="sr-only">{alt}</DialogTitle>
            <DialogDescription className="sr-only">{alt}</DialogDescription>
            <Image
              src={imageUrl ?? `/images/badge/og.png`}
              alt={alt}
              fill
              className="object-contain"
            />
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};
