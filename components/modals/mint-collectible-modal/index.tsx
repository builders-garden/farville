"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
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
import { Download, Share2, X } from "lucide-react";
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
  getPfpNftTxCalldata,
  mintedCollectibleFlexCardComposeCastUrl,
} from "@/lib/utils";
import { CollectibleStatus } from "@/types/game";
import { CustomImage } from "./custom-image";
import { SelectMintPrice } from "./select-mint-price";
import { env } from "@/lib/env";
import { DbUserHasCollectible } from "@/supabase/types";
import { useUpdateUserAvatar } from "@/hooks/use-update-user-avatar";
import { Checkbox } from "@/components/ui/checkbox";

interface MintCollectibleModalProps {
  onCancel: () => void;
}

export default function MintCollectibleModal({
  onCancel,
}: MintCollectibleModalProps) {
  const { state, updateUserCollectibles, refetchUser } = useGame();
  const { address } = useAccount();

  // Step 1
  const [pfpDescription, setPfpDescription] = useState<string | null>(null);
  const [pfpDescriptionLoading, setPfpDescriptionLoading] = useState(false);

  // Step 2
  const [midjourneyTaskId, setMidjourneyTaskId] = useState<string | null>(null);

  // Step 3
  const [midjourneyImageUrl, setMidjourneyImageUrl] = useState<string | null>(
    null
  );
  const [midjourneyImageUrls, setMidjourneyImageUrls] = useState<
    string[] | null
  >(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [confirmedSelection, setConfirmedSelection] = useState(false);

  // Step 4
  const [pinataMetadataCID, setPinataMetadataCID] = useState<string | null>(
    null
  );

  // Step 5
  const [backendSignature, setBackendSignature] = useState<
    `0x${string}` | null
  >(null);
  const [txCalldata, setTxCalldata] = useState<string>("0x");

  // Step 6
  const [selectedPrice, setSelectedPrice] = useState<number>(3);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [finalTxHash, setFinalTxHash] = useState<string | null>(null);
  const [updatedUserAvatar, setUpdatedUserAvatar] = useState<boolean>(false);

  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const selectedCollectible = useMemo(
    () => state.collectibles.find((collectible) => collectible.id === 1),
    [state.collectibles]
  );

  const [dontShowAgain, setDontShowAgain] = useLocalStorage(
    `dontShowAgainModalCollectible-${
      selectedCollectible ? selectedCollectible.id : 1
    }`,
    false
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

  function handleUpdateStateCollectibles(
    userHasCollectibles: DbUserHasCollectible
  ) {
    const collectible = state.collectibles.find(
      (collectible) => collectible.id === userHasCollectibles.collectibleId
    );
    if (collectible) {
      const updatedCollectible = {
        ...collectible,
        userHasCollectibles,
      };
      const updatedCollectibles = state.collectibles.map((c) =>
        c.id === collectible.id ? updatedCollectible : c
      );
      updateUserCollectibles(updatedCollectibles);
    }
  }

  // Step 1: Get image description from openai
  const { mutate: getImageDescription } = useGetImageDescription({
    setImageDescription: setPfpDescription,
    setImageDescriptionLoading: setPfpDescriptionLoading,
    handleUpdateStateCollectibles,
  });

  // Step 2: Generate midjourney image
  const { mutate: generateMidjourneyImage } = useGenerateMidjourneyImage({
    setMidjourneyTaskId,
    setIsLoading,
    handleUpdateStateCollectibles,
    setErrorMessage,
  });

  // Step 3: Get midjourney image
  const { mutate: getMidjourneyImage } = useGetMidjourneyImage({
    setMidjourneyImageUrl,
    setMidjourneyImageUrls,
    setIsLoading,
    handleUpdateStateCollectibles,
  });

  // Step 4: On confirm selection, upload to pinata
  const { mutate: uploadPinata } = usePinata({
    setPinataMetadataCID,
    setConfirmedSelection,
    handleUpdateStateCollectibles,
  });

  // Step 5: Once pinata has uploaded, get backend signature to mint
  const { mutate: getBackendSignature } = useGetBackendSignature({
    setBackendSignature,
    setIsLoading,
  });

  const handleSuccessMint = (hash: string | null) => {
    setFinalTxHash(hash);
    if (hash) {
      setShowConfetti(true);
    }
  };

  // Step 6: Update mint pfp user with tx hash
  const { mutate: updateMintPfpUser } = useUpdateMintPfpUser({
    handleUpdateStateCollectibles,
    handleSuccessMint,
  });

  // Step 7: Update user with selected collectible as avatar
  const { mutate: updateUserAvatar } = useUpdateUserAvatar({
    setIsLoading,
    setUpdatedUserAvatar,
    refetchUser,
  });

  // needed for Step 5. Construct mint tx calldata once the backend signature is ready
  useEffect(() => {
    if (!backendSignature || !pinataMetadataCID || !address) return;
    const newTxCalldata = getPfpNftTxCalldata({
      address,
      fid: BigInt(state.user.fid),
      priceInUSD: selectedPrice,
      pinataMetadataCID: pinataMetadataCID,
      backendSignature: backendSignature,
    });
    setTxCalldata(newTxCalldata);
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
            setPaymentCompleted(true);
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
            if (metadataCID) {
              setPinataMetadataCID(metadataCID);
              setConfirmedSelection(true);
            }
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
        case CollectibleStatus.Description:
          if (selectedCollectible.userHasCollectibles.pfpDescription) {
            setPfpDescription(
              selectedCollectible.userHasCollectibles.pfpDescription
            );
          }
      }
    }
  }, [selectedCollectible]);

  // Check if select mint price should be shown
  const showSelectMintPrice = useMemo(() => {
    if (!selectedCollectible || !selectedCollectible.userHasCollectibles)
      return false;
    const status = selectedCollectible.userHasCollectibles.status;
    return (
      selectedCollectible &&
      selectedCollectible.userHasCollectibles &&
      status === CollectibleStatus.Uploaded
    );
  }, [selectedCollectible]);

  // Check if generate button should be shown
  const showGenerateButton = useMemo(() => {
    if (!selectedCollectible || !selectedCollectible.userHasCollectibles)
      return true;
    const status = selectedCollectible?.userHasCollectibles?.status;
    return (
      selectedCollectible &&
      selectedCollectible.userHasCollectibles &&
      (status === CollectibleStatus.Pending ||
        status === CollectibleStatus.Description) &&
      !midjourneyTaskId
    );
  }, [midjourneyTaskId, selectedCollectible]);

  // Check if user can generate image
  const canGenerate = useMemo(() => {
    return (
      pfpDescription &&
      address &&
      selectedCollectible &&
      selectedCollectible.userHasCollectibles &&
      selectedCollectible.userHasCollectibles.status ===
        CollectibleStatus.Description
    );
  }, [pfpDescriptionLoading, pfpDescription, address, selectedCollectible]);

  // Check if get image button should be shown
  const showGetImageButton = useMemo(() => {
    if (!selectedCollectible || !selectedCollectible.userHasCollectibles)
      return false;
    return (
      selectedCollectible.userHasCollectibles.status ===
        CollectibleStatus.Pending &&
      midjourneyTaskId &&
      !midjourneyImageUrl
    );
  }, [midjourneyImageUrl, midjourneyTaskId, selectedCollectible]);

  // Check if confirm selection button should be shown
  const showConfirmSelectionButton = useMemo(() => {
    if (!selectedCollectible || !selectedCollectible.userHasCollectibles)
      return false;
    const status = selectedCollectible.userHasCollectibles.status;
    return (
      address &&
      (status === CollectibleStatus.Generated ||
        status === CollectibleStatus.Uploaded) &&
      midjourneyImageUrl
    );
  }, [address, midjourneyImageUrl, selectedCollectible]);

  // Check if user can mint
  const canMint = useMemo(() => {
    if (!selectedCollectible || !selectedCollectible.userHasCollectibles)
      return false;
    const status = selectedCollectible.userHasCollectibles.status;
    return (
      address &&
      (status === CollectibleStatus.Generated ||
        status === CollectibleStatus.Uploaded) &&
      midjourneyImageUrl &&
      selectedImageUrl &&
      !finalTxHash &&
      !paymentStarted &&
      !paymentCompleted
    );
  }, [
    address,
    selectedCollectible,
    midjourneyImageUrl,
    finalTxHash,
    selectedImageUrl,
    paymentStarted,
    paymentCompleted,
  ]);

  // get pfp description from openai
  useEffect(() => {
    const loadPfpDescription = async () => {
      if (userPfp) {
        setPfpDescriptionLoading(true);
        try {
          getImageDescription({
            imageUrl: userPfp,
            fid: state.user.fid,
            collectibleId: selectedCollectible?.id ?? 1,
          });
        } catch (error) {
          console.error(error);
          setErrorMessage(
            "Failed to generate image description. Please try again."
          );
        }
      }
    };
    // if no pfp description, and user has a pfp, and farvilleAvatar is not pending, load pfp description
    if (
      !pfpDescription &&
      userPfp &&
      selectedCollectible &&
      !selectedCollectible.userHasCollectibles
    ) {
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
      try {
        generateMidjourneyImage({
          prompt: pfpDescription,
          fid: state.user.fid,
          collectibleId: selectedCollectible?.id ?? 1,
        });
      } catch (error) {
        console.error(error);
        setErrorMessage("Failed to generate image. Please try again.");
      }
    }
  };

  // Step 3. handle get image
  useEffect(() => {
    if (!selectedCollectible || !selectedCollectible.userHasCollectibles)
      return;
    const status = selectedCollectible.userHasCollectibles.status;
    if (
      status === CollectibleStatus.Pending &&
      midjourneyTaskId &&
      !midjourneyImageUrl
    ) {
      // periodically check if midjourney image is ready
      const retryInterval = 5000;
      const interval = setInterval(() => {
        try {
          getMidjourneyImage({
            taskId: midjourneyTaskId,
            fid: state.user.fid.toString(),
            collectibleId: selectedCollectible.id.toString(),
          });
        } catch (error) {
          console.error(error);
          setErrorMessage("Failed to generate image. Please try again.");
        }
      }, retryInterval);
      return () => clearInterval(interval);
    }
  }, [
    midjourneyTaskId,
    selectedCollectible,
    midjourneyImageUrl,
    getMidjourneyImage,
    state.user.fid,
  ]);

  // Step 4. handle confirm selection
  const handleConfirmSelection = async () => {
    if (selectedImageUrl) {
      setIsLoading(true);
      try {
        uploadPinata({
          imageUrl: selectedImageUrl,
          fid: state.user.fid,
          collectibleId: selectedCollectible?.id ?? 1,
        });
      } catch (error) {
        console.error(error);
        setErrorMessage("Failed to upload image. Please try again.");
      }
    }
  };

  // Step 5. handle get backend signature
  useEffect(() => {
    if (pinataMetadataCID && address) {
      try {
        getBackendSignature({
          address,
          nftId: state.user.fid,
          tokenURI: pinataMetadataCID,
        });
      } catch (error) {
        console.error(error);
        setErrorMessage("Failed to get backend signature. Please try again.");
      }
    }
  }, [address, pinataMetadataCID, state.user.fid]);

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
      selectedCollectible?.id.toString() ?? ""
    );
    await sdk.actions.openUrl(castUrl);
  };

  // Check if select collectible should be shown
  const showSelectCollectibleAsAvatar = useMemo(() => {
    if (!selectedCollectible || !selectedCollectible.userHasCollectibles)
      return false;
    const status = selectedCollectible.userHasCollectibles.status;
    return (
      selectedCollectible &&
      selectedCollectible.userHasCollectibles &&
      status === CollectibleStatus.Minted &&
      !!selectedCollectible.userHasCollectibles.mintedImageUrl
    );
  }, [selectedCollectible]);

  const handleSetCollectibleAsAvatar = () => {
    if (updatedUserAvatar) return;
    setIsLoading(true);
    if (!state.user.selectedAvatarUrl) {
      try {
        updateUserAvatar({
          collectibleId: selectedCollectible?.id.toString() ?? "1",
        });
      } catch (error) {
        console.error(error);
        setErrorMessage(
          "Failed to set collectible as avatar. Please try again."
        );
      }
    } else {
      try {
        updateUserAvatar({
          reset: true,
        });
      } catch (error) {
        console.error(error);
        setErrorMessage(
          "Failed to reset collectible as avatar. Please try again."
        );
      }
    }
  };

  const handleDownloadImage = async () => {
    // handle the download of the image from url to user storage
    if (!selectedCollectible || !selectedCollectible.userHasCollectibles) {
      setErrorMessage("Failed to download image. Please try again.");
      return;
    }
    const imageUrl = selectedCollectible.userHasCollectibles.mintedImageUrl;
    if (imageUrl) {
      try {
        await sdk.actions.openUrl(imageUrl);
      } catch (error) {
        console.error(error);
        setErrorMessage("Failed to open image URL. Please try again.");
      }
    } else {
      setErrorMessage("Failed to download image. Please try again.");
    }
  };

  const isFinalState =
    finalTxHash ||
    selectedCollectible?.userHasCollectibles?.status ===
      CollectibleStatus.Uploaded;

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
          className="flex flex-col gap-4 xs:gap-6 bg-gradient-to-br from-[#8B5E3C] to-[#6A4123] p-4 xs:p-6 rounded-lg max-w-sm w-full mx-4 border border-[#8B5E3C]/50 
          [box-shadow:0_0_50px_rgba(234,179,8,0.3)] relative will-change-transform overflow-y-auto max-h-[90vh] no-scrollbar"
        >
          <button
            onClick={onCancel}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full 
                    bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
            aria-label="Close"
          >
            <X size={14} />
          </button>

          <div className="flex flex-row items-center">
            <h3 className={`text-white/90 font-bold text-md xs:text-lg m-auto`}>
              Farville Avatar
            </h3>
          </div>
          <div className="flex flex-col gap-4">
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
              {isFinalState ? (
                <CustomImage
                  key={finalTxHash}
                  imageUrl={
                    selectedImageUrl ?? "/images/badge/farville-avatar.png"
                  }
                  alt={`Selected Pfp Generation`}
                  selected={false}
                  onSelect={() => {}}
                  confirmedSelection={confirmedSelection}
                  isAlone={true}
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
                      confirmedSelection={confirmedSelection}
                      isAlone={false}
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
          <div className="flex flex-col gap-2">
            {isFinalState ? (
              <>
                <span className="text-yellow-300/90 text-[10px] text-center">
                  Mama I&apos;m a Farmer!
                </span>
                <Separator className="w-[80%] m-auto bg-yellow-500/50" />
                <span className="text-white/70 text-[8px] text-center">
                  Show the world your Farville avatar!
                </span>
              </>
            ) : (
              <>
                <span className="text-yellow-300/90 text-[10px] text-center">
                  Pick your farmer. Make it yours.
                </span>
                <Separator className="w-[80%] m-auto bg-yellow-500/50" />
                <span className="text-white/70 text-[8px] text-center">
                  Choose a custom avatar to represent you and climb the
                  leaderboards in style.
                </span>
              </>
            )}
            {errorMessage && (
              <span className="bg-red-500 text-red-200 text-[8px] p-2 rounded">
                {errorMessage}
              </span>
            )}
            {!isFinalState &&
              address !== undefined &&
              !!tokenBalancesData &&
              (!hasEnoughEthBalance || !hasEnoughUSDBalance) && (
                <span className="bg-red-500 text-red-200 text-[8px] p-2 rounded">
                  Insufficient {!hasEnoughEthBalance ? "ETH" : "USD"} balance to
                  mint. Please add some {hasEnoughEthBalance ? "USD" : "ETH"} to
                  your wallet.
                </span>
              )}
          </div>
          <div className="flex flex-col gap-3 mt-0">
            {/* PAY PRICE */}
            {showSelectMintPrice ? (
              <SelectMintPrice
                totalBalanceUSD={tokenBalancesData?.totalBalanceUSD ?? 0}
                selectedPrice={selectedPrice}
                setSelectedPrice={setSelectedPrice}
              />
            ) : null}

            {/* Set minted collectible as avatar */}
            {showSelectCollectibleAsAvatar ? (
              <Button
                onClick={handleSetCollectibleAsAvatar}
                className="w-full flex-1 py-2 px-4 rounded-[5px] text-[#5C4121] bg-yellow-500 hover:bg-yellow-500/80 hover:text-[#5C4121]"
                disabled={isLoading || updatedUserAvatar}
              >
                {isLoading
                  ? "Setting..."
                  : updatedUserAvatar
                  ? "Done!"
                  : state.user.selectedAvatarUrl
                  ? "Use Warpcast PFP"
                  : "Set as avatar"}
              </Button>
            ) : null}

            {/* BIG BUTTON Generate/Get Image/Select/Confirm/Mint/Share */}
            {finalTxHash ? (
              <div className="flex w-full gap-2">
                <Button
                  onClick={handleShareMint}
                  className={`w-full flex py-1 px-2 xs:py-2 xs:px-4 rounded-[5px] bg-[#179ef9]/20 text-[#179ef9] hover:bg-[#179ef9]/30 transition-colors text-[9px] xs:text-xs font-medium border border-[#179ef9]/30 items-center justify-center gap-2`}
                >
                  <Share2
                    size={18}
                    className="w-3 h-3 xs:w-4 xs:h-4"
                  />
                  Share
                </Button>
                <Button
                  onClick={handleDownloadImage}
                  variant="outline"
                  className="w-full flex py-1 px-2 xs:py-2 xs:px-4 rounded-[5px] bg-transparent hover:bg-[#179ef9]/10 border-2 border-[#179ef9]/20 text-[#179ef9] hover:text-[#179ef9]/80 text-[9px] xs:text-xs font-medium items-center justify-center gap-2"
                >
                  <Download
                    size={18}
                    className="w-3 h-3 xs:w-4 xs:h-4"
                  />
                  Download
                </Button>
              </div>
            ) : showGenerateButton ? (
              <div className="relative flex flex-col gap-2">
                <button
                  disabled={!canGenerate || isLoading || pfpDescriptionLoading}
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
                    ? "Starting..."
                    : "Generate"}
                </button>
                {!pfpDescriptionLoading && isLoading ? (
                  <p className="text-white/70 text-[8px] text-center">
                    Wait, do not close this page.
                  </p>
                ) : null}
              </div>
            ) : showGetImageButton ? (
              <div className="relative flex flex-col gap-2">
                <motion.button
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  disabled
                  className="flex-1 py-2 px-4 rounded bg-[#179ef9]/20 text-[#179ef9] hover:bg-[#179ef9]/30 transition-colors text-sm font-medium border border-[#179ef9]/30 flex items-center justify-center gap-2"
                >
                  Generating...
                </motion.button>
                <p className="text-white/70 text-[8px] text-center">
                  This may take a while &#126; 2 minutes.
                  <br />
                  You can close and check it later in Profile page &gt;
                  Collectibles.
                </p>
              </div>
            ) : showConfirmSelectionButton ? (
              <div className="w-full flex flex-col gap-2 items-center">
                <DaimoPayButton.Custom
                  appId={env.NEXT_PUBLIC_DAIMO_PAY_ID}
                  metadata={{
                    userId: state.user.fid.toString(),
                    pinataMetadataCID: pinataMetadataCID ?? "",
                  }}
                  preferredChains={[base.id, mainnet.id]}
                  preferredTokens={[
                    { chain: base.id, address: BASE_USDC_ADDRESS },
                    { chain: base.id, address: BASE_DEGEN_ADDRESS },
                  ]}
                  toAddress={PFP_NFT_BASE_ADDRESS}
                  toChain={base.id}
                  toUnits={selectedPrice.toString()}
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
                          : "text-[#5C4121] bg-yellow-500 hover:bg-yellow-500/80 hover:text-[#5C4121]",
                        paymentCompleted &&
                          "bg-green-500 text-green-200 cursor-not-allowed"
                      )}
                      onClick={() => {
                        if (!confirmedSelection) {
                          handleConfirmSelection();
                        } else {
                          show();
                        }
                      }}
                      disabled={
                        isLoading ||
                        (confirmedSelection
                          ? !canMint && txCalldata === "0x"
                          : !canMint)
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

            {!address && !paymentCompleted && !finalTxHash && (
              <span className="text-center text-[9px] text-white/70 border border-white/70 rounded w-fit px-4 py-2 m-auto mt-1 xs:mt-2">
                Please connect a wallet to mint the badge.
              </span>
            )}

            {paymentCompleted && finalTxHash ? (
              <>
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
              </>
            ) : null}
          </div>

          <div className="flex w-full justify-center items-center gap-3 mt-2">
            <Checkbox
              id="dontShowAgain"
              checked={dontShowAgain}
              onCheckedChange={() => {
                setDontShowAgain((prev) => !prev);
              }}
              className="size-4 border-white/80 data-[state=checked]:bg-white/80 data-[state=checked]:text-[#1D1D1D]/80"
            />
            <label
              htmlFor="dontShowAgain"
              className="text-[7px] font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white/80"
            >
              Don&apos;t show this again
            </label>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
