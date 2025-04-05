"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useBalance, useSwitchChain } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getWalletBalance } from "@/lib/lifi";
import sdk from "@farcaster/frame-sdk";

import { useGame } from "@/context/GameContext";
import { useGetImageDescription } from "@/hooks/use-get-image-description";
import { useGenerateMidjourneyImage } from "@/hooks/use-generate-midjourney-image";
import { useGetMidjourneyImage } from "@/hooks/use-get-midjourney-image";
import { usePinata } from "@/hooks/use-pinata";
import { useGetBackendSignature } from "@/hooks/use-get-backend-signature";
import { useUpdateMintPfpUser } from "@/hooks/use-update-mint-pfp-user";

import { motion } from "framer-motion";
import { Check, X, ZoomInIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Confetti from "@/components/animations/Confetti";

// Daimo Pay
import {
  PaymentBouncedEvent,
  PaymentCompletedEvent,
  PaymentStartedEvent,
} from "@daimo/common";
import { DaimoPayButton } from "@daimo/pay";
import { base, mainnet } from "viem/chains";

import {
  BASE_SCAN_BASE_URL,
  PFP_NFT_BASE_ADDRESS,
  BASE_USDC_ADDRESS,
  BASE_DEGEN_ADDRESS,
} from "@/lib/contracts/constants";
import {
  cn,
  formatNumberWithSuffix,
  getPfpNftTxCalldata,
  mintedCollectibleFlexCardComposeCastUrl,
} from "@/lib/utils";
import { CollectibleStatus } from "@/types/game";

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
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [confirmedSelection, setConfirmedSelection] = useState(false);

  const [paymentStarted, setPaymentStarted] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [finalTxHash, setFinalTxHash] = useState<string | null>(null);

  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const selectedCollectible = useMemo(
    () => state.collectibles.find((collectible) => collectible.id === 1),
    [state.collectibles]
  );

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

  // Step 1: Get image description from openai
  const { mutate: getImageDescription } = useGetImageDescription({
    setImageDescription: setPfpDescription,
    setImageDescriptionLoading: setPfpDescriptionLoading,
  });

  // Step 2: Generate midjourney image
  const { mutate: generateMidjourneyImage } = useGenerateMidjourneyImage({
    setMidjourneyTaskId,
    setIsLoading,
  });

  // Step 3: Get midjourney image
  const { mutate: getMidjourneyImage } = useGetMidjourneyImage({
    setMidjourneyImageUrl,
    setMidjourneyImageUrls,
    setIsLoading,
  });

  // Step 4: On confirm selection, upload to pinata
  const { mutate: uploadPinata } = usePinata({
    setMetadataCID: setPinataMetadataCID,
    setConfirmedSelection,
  });

  // Step 5: Once pinata has uploaded, get backend signature to mint
  const { mutate: getBackendSignature } = useGetBackendSignature({
    setBackendSignature,
    setIsLoading,
  });

  // Step 6: Update mint pfp user with tx hash
  const { mutate: updateMintPfpUser } = useUpdateMintPfpUser();

  // needed for Step 5. Construct mint tx calldata once the backend signature is ready
  const txCalldata = useMemo(() => {
    if (!backendSignature || !pinataMetadataCID || !address) return null;
    return getPfpNftTxCalldata({
      address,
      fid: BigInt(state.user.fid),
      priceInUSD: selectedPrice,
      pinataMetadataCID: pinataMetadataCID,
      backendSignature: backendSignature,
    });
  }, [
    address,
    state.user.fid,
    selectedPrice,
    pinataMetadataCID,
    backendSignature,
  ]);

  // ETH balance on base to send tx
  const { data: balance } = useBalance({
    address,
    chainId: base.id,
  });

  // USD balance of wallet
  const { data: tokenBalancesData } = useQuery({
    queryKey: ["tokenBalances", address],
    queryFn: async () => {
      if (address) {
        const x = await getWalletBalance(address);
        return x;
      }
      return {
        totalBalanceUSD: 0,
        tokenBalances: {},
      };
    },
    enabled: !!address,
  });

  // Check if user has enough ETH balance to mint
  const hasEnoughEthBalance = useMemo(() => {
    if (!balance || !address) return false;
    const requiredEth = BigInt(0);
    return BigInt(balance.value) > requiredEth;
  }, [balance, address]);

  // Check if user has enough USD balance to mint
  const hasEnoughUSDBalance = useMemo(() => {
    if (!tokenBalancesData || !tokenBalancesData.totalBalanceUSD || !address)
      return false;
    return tokenBalancesData.totalBalanceUSD >= selectedPrice;
  }, [tokenBalancesData, address, selectedPrice]);

  // On page load, update image generation state
  useEffect(() => {
    if (selectedCollectible && selectedCollectible.userHasCollectibles) {
      switch (selectedCollectible.userHasCollectibles.status) {
        case CollectibleStatus.Minted:
          if (selectedCollectible.userHasCollectibles.txHash) {
            setFinalTxHash(selectedCollectible.userHasCollectibles.txHash);
          }
        case CollectibleStatus.Uploaded:
          if (selectedCollectible.userHasCollectibles.mintedMetadataUrl) {
            setSelectedImageUrl(
              selectedCollectible.userHasCollectibles.mintedImageUrl
            );
            const metadataCID =
              selectedCollectible.userHasCollectibles.mintedMetadataUrl.split(
                "https://gateway.pinata.cloud/ipfs/"
              )[1];
            setPinataMetadataCID(metadataCID);
          }
        case CollectibleStatus.Generated:
          if (
            selectedCollectible.userHasCollectibles.generatedImageUrls &&
            selectedCollectible.userHasCollectibles.generatedImageUrls.length >
              0
          ) {
            setMidjourneyImageUrl(
              selectedCollectible.userHasCollectibles.generatedImageUrls[0]
            );
            setMidjourneyImageUrls(
              selectedCollectible.userHasCollectibles.generatedImageUrls.slice(
                1
              )
            );
          }
        case CollectibleStatus.Pending:
          if (selectedCollectible.userHasCollectibles.generatedTaskId) {
            setMidjourneyTaskId(
              selectedCollectible.userHasCollectibles.generatedTaskId
            );
          }
      }
    }
  }, [selectedCollectible]);

  // Check if user can generate image
  const canGenerate = useMemo(() => {
    const isNullOrPendingStatus =
      (selectedCollectible && !selectedCollectible.userHasCollectibles) ||
      (selectedCollectible &&
        selectedCollectible.userHasCollectibles &&
        selectedCollectible.userHasCollectibles.status ===
          CollectibleStatus.Pending);
    return (
      !pfpDescriptionLoading &&
      pfpDescription &&
      address &&
      isNullOrPendingStatus
    );
  }, [pfpDescriptionLoading, pfpDescription, address, selectedCollectible]);

  // Check if user can mint
  const canMint = useMemo(() => {
    if (!selectedCollectible || !selectedCollectible.userHasCollectibles)
      return false;
    const status = selectedCollectible.userHasCollectibles.status;
    return (
      address &&
      (status === CollectibleStatus.Pending ||
        status === CollectibleStatus.Generated ||
        status === CollectibleStatus.Uploaded) &&
      midjourneyImageUrl &&
      !finalTxHash
    );
  }, [address, selectedCollectible, midjourneyImageUrl, finalTxHash]);

  // get pfp description from openai
  useEffect(() => {
    const loadPfpDescription = async () => {
      if (userPfp) {
        setPfpDescriptionLoading(true);
        getImageDescription({ imageUrl: userPfp });
      }
    };
    // if no pfp description, and user has a pfp, and farvilleAvatar is not pending, load pfp description
    const isNullOrPendingStatus =
      (selectedCollectible && !selectedCollectible.userHasCollectibles) ||
      (selectedCollectible &&
        selectedCollectible.userHasCollectibles &&
        selectedCollectible.userHasCollectibles.status ===
          CollectibleStatus.Pending);
    if (!pfpDescription && userPfp && isNullOrPendingStatus) {
      loadPfpDescription();
    }
  }, [userPfp, selectedCollectible]);

  // if user is not on base, switch to base
  useEffect(() => {
    if (chainId !== base.id) {
      switchChain({
        chainId: base.id,
      });
    }
  }, [chainId, switchChain]);

  // Step 2. handle generate image
  const handleGenerate = async () => {
    if (canGenerate && pfpDescription && !midjourneyTaskId) {
      setIsLoading(true);
      generateMidjourneyImage({
        prompt: pfpDescription,
        fid: state.user.fid,
        collectibleId: selectedCollectible?.id ?? 1,
      });
    }
  };

  // Step 3. handle get image
  const handleGetImage = async () => {
    if (midjourneyTaskId && selectedCollectible) {
      setIsLoading(true);
      getMidjourneyImage({
        taskId: midjourneyTaskId,
        fid: state.user.fid.toString(),
        collectibleId: selectedCollectible.id.toString() ?? "1",
      });
    }
  };

  // Step 4. handle confirm selection
  const handleConfirmSelection = async () => {
    if (selectedImageUrl) {
      setIsLoading(true);
      uploadPinata({
        imageUrl: selectedImageUrl,
        fid: state.user.fid,
        collectibleId: selectedCollectible?.id ?? 1,
      });
    }
  };

  // Step 5. handle get backend signature
  useEffect(() => {
    if (pinataMetadataCID && address && selectedImageUrl && !finalTxHash) {
      getBackendSignature({
        address,
        nftId: state.user.fid,
        tokenURI: pinataMetadataCID,
      });
    }
  }, [address, pinataMetadataCID, getBackendSignature, state.user.fid]);

  /*
  !finalTxHash &&
      !mintTxHash &&
      selectedImageUrl &&
      address &&
      pinataMetadataCID &&
      chainId === base.id &&
      backendSignature &&
      selectedPrice > 0
      */

  // Step 6. mint handle daimo events: PaymentStarted, PaymentCompleted, PaymentBounced
  const handlePaymentStarted = (e: PaymentStartedEvent) => {
    console.log("Payment started", e);
    setPaymentStarted(true);
  };
  const handlePaymentCompleted = async (e: PaymentCompletedEvent) => {
    console.log("[handlePaymentCompleted] txHash", e.txHash, "daimo event", e);

    setPaymentCompleted(true);
    setPaymentStarted(false);
    updateMintPfpUser({
      collectibleId: selectedCollectible?.id ?? 1,
      txHash: e.txHash,
    });
    setFinalTxHash(e.txHash);
    setShowConfetti(true);
  };
  const handlePaymentBounced = (e: PaymentBouncedEvent) => {
    console.error("Payment bounced", e);
    setPaymentStarted(false);
    setPaymentCompleted(false);
    setShowConfetti(false);

    setErrorMessage(
      "There was an error processing your payment. You received back your amount in $USDC on your wallet address. Try again."
    );
  };

  // Step 7. handle share mint
  const handleShareMint = async () => {
    const { castUrl } = mintedCollectibleFlexCardComposeCastUrl(
      state.user.fid,
      selectedCollectible?.id.toString() ?? "",
      selectedCollectible?.name ?? ""
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
              {finalTxHash ? (
                <CustomImage
                  key={finalTxHash}
                  imageUrl={
                    selectedImageUrl ?? "/images/badge/farville-avatar.png"
                  }
                  alt={`User Pfp Generation`}
                  selected={true}
                  onSelect={() => {}}
                />
              ) : midjourneyImageUrls ? (
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
            {errorMessage && (
              <span className="bg-red-500 text-red-200 text-[8px] p-2 rounded">
                {errorMessage}
              </span>
            )}
            {address !== undefined &&
              !!tokenBalancesData &&
              (!hasEnoughEthBalance || !hasEnoughUSDBalance) && (
                <span className="bg-red-500 text-red-200 text-[8px] p-2 rounded">
                  Insufficient {!hasEnoughEthBalance ? "ETH" : "USD"} balance to
                  mint. Please add some {hasEnoughEthBalance ? "USD" : "ETH"} to
                  your wallet.
                </span>
              )}
          </div>
          <div className="flex flex-col gap-3">
            {/* PAY PRICE */}
            {selectedCollectible &&
            selectedCollectible.userHasCollectibles &&
            (selectedCollectible.userHasCollectibles.status ===
              CollectibleStatus.Uploaded ||
              selectedCollectible.userHasCollectibles.status ===
                CollectibleStatus.Generated ||
              (selectedCollectible.userHasCollectibles.status ===
                CollectibleStatus.Pending &&
                midjourneyImageUrl)) ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-full flex flex-row items-center justify-between gap-2">
                  <span className="text-white/70 text-lg">Pay</span>
                  {/* USDC balance */}
                  <div className="w-full flex items-center justify-end gap-2">
                    <span className="flex flex-row items-center gap-1 text-white/70 text-[8px]">
                      You have{" "}
                      {tokenBalancesData &&
                      tokenBalancesData.totalBalanceUSD > BigInt(0)
                        ? formatNumberWithSuffix(
                            tokenBalancesData.totalBalanceUSD
                          )
                        : "0"}{" "}
                      USD
                    </span>
                    <UsdcLogo />
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
            {finalTxHash ? (
              <button
                onClick={handleShareMint}
                className={`flex-1 py-2 px-4 rounded bg-[#179ef9]/20 text-[#179ef9] hover:bg-[#179ef9]/30 transition-colors text-sm font-medium border border-[#179ef9]/30 flex items-center justify-center gap-2`}
              >
                Share
              </button>
            ) : (!midjourneyTaskId &&
                selectedCollectible &&
                !selectedCollectible.userHasCollectibles) ||
              (selectedCollectible &&
                selectedCollectible.userHasCollectibles &&
                selectedCollectible.userHasCollectibles.status ===
                  CollectibleStatus.Pending &&
                !midjourneyTaskId) ? (
              <button
                disabled={!canGenerate || isLoading}
                onClick={handleGenerate}
                className={`flex-1 py-2 px-4 rounded ${
                  !canGenerate
                    ? "bg-[#179ef9]/10 text-[#179ef9]/50 cursor-not-allowed"
                    : "bg-[#179ef9]/20 text-[#179ef9] hover:bg-[#179ef9]/30"
                } 
                  transition-colors text-sm font-medium border border-[#179ef9]/30 flex items-center justify-center gap-2`}
              >
                {pfpDescriptionLoading
                  ? "Loading..."
                  : isLoading
                  ? "Generating..."
                  : "Generate"}
              </button>
            ) : (midjourneyTaskId &&
                !midjourneyImageUrls &&
                selectedCollectible &&
                !selectedCollectible.userHasCollectibles) ||
              (selectedCollectible &&
                selectedCollectible.userHasCollectibles &&
                selectedCollectible.userHasCollectibles.status ===
                  CollectibleStatus.Pending &&
                midjourneyTaskId &&
                !midjourneyImageUrl) ? (
              <button
                disabled={isLoading}
                onClick={handleGetImage}
                className={`flex-1 py-2 px-4 rounded bg-[#179ef9]/20 text-[#179ef9] hover:bg-[#179ef9]/30 transition-colors text-sm font-medium border border-[#179ef9]/30 flex items-center justify-center gap-2`}
              >
                {isLoading ? "Fetching..." : "Get Image"}
              </button>
            ) : canMint ? (
              <div className="w-full flex flex-col gap-2 items-center pb-4">
                <DaimoPayButton.Custom
                  appId={process.env.NEXT_PUBLIC_DAIMO_PAY_ID!}
                  metadata={{
                    userId: state.user.fid.toString(),
                    selectedPrice: selectedPrice.toString(),
                    pinataMetadataCID: pinataMetadataCID ?? "",
                  }}
                  preferredChains={[base.id, mainnet.id]}
                  preferredTokens={[
                    { chain: 8453, address: BASE_USDC_ADDRESS },
                    { chain: 8453, address: BASE_DEGEN_ADDRESS },
                  ]}
                  toAddress={PFP_NFT_BASE_ADDRESS}
                  toChain={base.id}
                  toUnits={BigInt(selectedPrice * 10 ** 6).toString()}
                  toToken={BASE_USDC_ADDRESS}
                  toCallData={txCalldata as `0x${string}`}
                  closeOnSuccess
                  onPaymentStarted={handlePaymentStarted}
                  onPaymentCompleted={handlePaymentCompleted}
                  onPaymentBounced={handlePaymentBounced}
                >
                  {({ show }) => (
                    <Button
                      variant="default"
                      className={cn(
                        "w-full flex-1 py-2 px-4 rounded-[5px]",
                        !canMint
                          ? "text-yellow-400/50 cursor-not-allowed bg-yellow-500/10"
                          : "text-[#5C4121] bg-yellow-500",
                        paymentCompleted
                          ? "bg-green-500 text-green-200 cursor-not-allowed"
                          : ""
                      )}
                      onClick={() => {
                        if (!confirmedSelection) {
                          handleConfirmSelection();
                        } else if (paymentCompleted) {
                          handleShareMint();
                        } else {
                          show();
                        }
                      }}
                      disabled={
                        !selectedImageUrl || paymentStarted || paymentCompleted
                      }
                    >
                      {!selectedImageUrl
                        ? "Select an image"
                        : !confirmedSelection
                        ? isLoading
                          ? "Confirming..."
                          : "Confirm selection"
                        : paymentStarted
                        ? "Minting..."
                        : paymentCompleted
                        ? "Minted Successfully!"
                        : "Mint"}
                    </Button>
                  )}
                </DaimoPayButton.Custom>
              </div>
            ) : null}
            {!address && (
              <span className="text-center text-[9px] text-white/70 border border-white/70 rounded w-fit px-4 py-2 m-auto mt-1 xs:mt-2">
                Please connect a wallet to mint the badge.
              </span>
            )}

            {paymentCompleted && finalTxHash && (
              <p
                className="text-white/70 text-[8px] text-center underline cursor-pointer"
                onClick={async () => {
                  await sdk.actions.openUrl(
                    BASE_SCAN_BASE_URL + `/tx/${finalTxHash}`
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

const UsdcLogo = () => {
  return (
    <svg className="w-[20px] h-[20px]" viewBox="0 0 2000 2000">
      <path
        d="M1000 2000c554.17 0 1000-445.83 1000-1000S1554.17 0 1000 0 0 445.83 0 1000s445.83 1000 1000 1000z"
        fill="#2775ca"
      />
      <path
        d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67 20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z"
        fill="#fff"
      />
      <path
        d="M787.5 1595.83c-325-116.66-491.67-479.16-370.83-800 62.5-175 200-308.33 370.83-370.83 16.67-8.33 25-20.83 25-41.67V325c0-16.67-8.33-29.17-25-33.33-4.17 0-12.5 0-16.67 4.16-395.83 125-612.5 545.84-487.5 941.67 75 233.33 254.17 412.5 487.5 487.5 16.67 8.33 33.34 0 37.5-16.67 4.17-4.16 4.17-8.33 4.17-16.66v-58.34c0-12.5-12.5-29.16-25-37.5zM1229.17 295.83c-16.67-8.33-33.34 0-37.5 16.67-4.17 4.17-4.17 8.33-4.17 16.67v58.33c0 16.67 12.5 33.33 25 41.67 325 116.66 491.67 479.16 370.83 800-62.5 175-200 308.33-370.83 370.83-16.67 8.33-25 20.83-25 41.67V1700c0 16.67 8.33 29.17 25 33.33 4.17 0 12.5 0 16.67-4.16 395.83-125 612.5-545.84 487.5-941.67-75-237.5-258.34-416.67-487.5-491.67z"
        fill="#fff"
      />
    </svg>
  );
};
