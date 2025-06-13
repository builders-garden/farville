import { useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useClanOperations } from "@/hooks/game-actions/use-clan-operations";
import { useGame } from "@/context/GameContext";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAccount, useBalance } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getWalletBalance } from "@/lib/lifi";
import { cn } from "@/lib/utils";
import { base } from "viem/chains";
import {
  BASE_USDC_ADDRESS,
  BG_MULTISIG_ADDRESS,
  BASE_SCAN_BASE_URL,
} from "@/lib/contracts/constants";
import { env } from "@/lib/env";
import sdk from "@farcaster/frame-sdk";
import { PaymentCompletedEvent } from "@daimo/pay-common";
import { DaimoPayButton } from "@daimo/pay";
import { CLAN_CREATION_COST_USD } from "@/lib/game-constants";

interface CreateClanModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  refetchClan: () => void;
}

export default function CreateClanModal({
  onClose,
  onSuccess,
  refetchClan,
}: CreateClanModalProps) {
  const { state } = useGame();
  const userLevel = state.level;
  const { address } = useAccount();

  const [name, setName] = useState("");
  const [motto, setMotto] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [requiredLevel, setRequiredLevel] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<
    "idle" | "creating" | "success"
  >("idle");
  const [error, setError] = useState("");

  // Payment states
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [finalTxHash, setFinalTxHash] = useState("");
  const [paymentHandled, setPaymentHandled] = useState(false);

  const { createClan } = useClanOperations(refetchClan);

  // USD balance of wallet
  const { data: tokenBalancesData, isLoading: tokenBalancesIsLoading } =
    useQuery({
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

  // ETH balance on base to send tx
  const { data: balance } = useBalance({
    address,
    chainId: base.id,
  });

  // Check if user has enough ETH balance for transaction
  const hasEnoughEthBalance = useMemo(() => {
    if (!balance || !address) return false;
    const requiredEth = BigInt(0);
    return BigInt(balance.value) > requiredEth;
  }, [balance, address]);

  // Check if user has enough USD balance for payment
  const hasEnoughUSDBalance = useMemo(() => {
    if (!tokenBalancesData || !tokenBalancesData.totalBalanceUSD || !address)
      return false;
    return tokenBalancesData.totalBalanceUSD >= CLAN_CREATION_COST_USD;
  }, [tokenBalancesData, address]);

  const walletBalance = tokenBalancesData?.totalBalanceUSD || 0;

  // Reset state when modal opens
  useEffect(() => {
    if (walletBalance < CLAN_CREATION_COST_USD && !tokenBalancesIsLoading) {
      setError(
        `You need at least $${CLAN_CREATION_COST_USD} in your wallet to create a clan. Please add funds.`
      );
    } else if (walletBalance >= CLAN_CREATION_COST_USD) {
      setError("");
    }
  }, [walletBalance, tokenBalancesIsLoading]);

  const handlePaymentStarted = useCallback(() => {
    setPaymentHandled(false);
    setPaymentStarted(true);
    setError("");
  }, []);

  const handlePaymentCompleted = useCallback(
    (e: PaymentCompletedEvent) => {
      if (paymentHandled) return; // Prevent duplicate handling

      if (!address) {
        setError("Wallet address is not available.");
        setPaymentCompleted(false);
        return;
      }

      setPaymentCompleted(true);
      setPaymentStarted(false);
      setFinalTxHash(e.txHash);
      setPaymentHandled(true);

      // Now create the clan with the transaction hash
      setIsSubmitting(true);
      setSubmitState("creating");

      createClan(
        {
          name,
          motto,
          isPublic,
          txHash: e.txHash,
          paymentId: e.paymentId,
          ...(imageUrl && { imageUrl }),
          ...(requiredLevel && { requiredLevel }),
        },
        {
          onSuccess: () => {
            setSubmitState("success");
            if (onSuccess) {
              onSuccess();
            }
            setTimeout(() => {
              onClose();
            }, 1000);
          },
          onError: (error) => {
            console.error("Error creating clan:", error);
            setError("Failed to create clan. Please try again.");
            setIsSubmitting(false);
            setSubmitState("idle");
            setPaymentCompleted(false);
            setPaymentHandled(false);
          },
        }
      );
    },
    [
      paymentHandled,
      address,
      name,
      motto,
      isPublic,
      imageUrl,
      requiredLevel,
      createClan,
      onSuccess,
      onClose,
    ]
  );

  const handlePaymentBounced = useCallback(() => {
    setPaymentStarted(false);
    setPaymentCompleted(false);
    setPaymentHandled(false);
    setError(
      "There was an error processing your payment. You received back your amount in $USDC on your wallet address. Try again."
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      setError("Clan name is required");
      return;
    }

    if (!address) {
      setError("Please connect your wallet to create a clan");
      return;
    }

    if (walletBalance < CLAN_CREATION_COST_USD) {
      setError(
        `You need at least $${CLAN_CREATION_COST_USD} in your wallet to create a clan`
      );
      return;
    }

    // Payment will be handled by DaimoPayButton
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#7E4E31] p-6 rounded-lg max-w-sm w-full mx-4 border border-[#8B5E3C]/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white/90 font-bold text-lg flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            New Clan
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full 
                    bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Wallet Balance and Cost Display */}
          {address && (
            <div className="bg-[#4A341A] p-3 rounded-lg border border-[#8B5E3C]/10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">Cost to create clan:</span>
                <span className="text-[#FFB938] font-bold">
                  ${CLAN_CREATION_COST_USD} USDC
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-white/70">Your balance:</span>
                <span
                  className={cn(
                    "font-bold",
                    walletBalance >= CLAN_CREATION_COST_USD
                      ? "text-green-400"
                      : "text-red-400"
                  )}
                >
                  {tokenBalancesIsLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin inline" />
                  ) : (
                    `$${walletBalance.toFixed(2)}`
                  )}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-md p-2 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-white/80 text-sm font-medium">
              Name*
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Clan name"
              className="w-full bg-[#5A4129] border border-[#8B5E3C] text-white/90 rounded-md px-3 py-2 placeholder:text-white/40 focus:outline-none focus:border-[#FFB938]"
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-white/80 text-sm font-medium">
              Motto
            </label>
            <input
              type="text"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              placeholder="Clan slogan"
              className="w-full bg-[#5A4129] border border-[#8B5E3C] text-white/90 rounded-md px-3 py-2 placeholder:text-white/40 focus:outline-none focus:border-[#FFB938]"
              maxLength={40}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-white/80 text-sm font-medium">
              Image URL
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Optional clan image"
              className="w-full bg-[#5A4129] border border-[#8B5E3C] text-white/90 rounded-md px-3 py-2 placeholder:text-white/40 focus:outline-none focus:border-[#FFB938]"
            />
            {imageUrl && (
              <div className="relative h-20 w-20 mx-auto mt-2 rounded-md border-2 border-[#8B5E3C] overflow-hidden bg-[#5A4129] flex items-center justify-center">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                  onError={() => setImageUrl("")}
                />
              </div>
            )}
          </div>

          {userLevel > 1 && (
            <div className="space-y-2">
              <label className="block text-white/80 text-sm font-medium">
                Min Level
              </label>
              <select
                value={requiredLevel || ""}
                onChange={(e) =>
                  setRequiredLevel(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="w-full bg-[#5A4129] border border-[#8B5E3C] text-white/90 rounded-md px-3 py-2 focus:outline-none focus:border-[#FFB938]"
              >
                <option value="">None</option>
                {Array.from(
                  { length: Math.min(userLevel - 1, 19) },
                  (_, i) => i + 2
                ).map((level) => (
                  <option
                    key={level}
                    value={level}
                  >
                    Lvl {level}+
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="public"
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(Boolean(checked))}
              className="data-[state=checked]:bg-[#FFB938] data-[state=checked]:border-[#FFB938]"
            />
            <label
              htmlFor="public"
              className="text-sm text-white/80"
            >
              Public clan
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            {!paymentCompleted ? (
              !error &&
              hasEnoughEthBalance &&
              hasEnoughUSDBalance &&
              address ? (
                <DaimoPayButton.Custom
                  appId={env.NEXT_PUBLIC_DAIMO_PAY_ID}
                  metadata={{
                    userId: state.user.fid.toString(),
                  }}
                  preferredChains={[base.id]}
                  preferredTokens={[
                    { chain: base.id, address: BASE_USDC_ADDRESS },
                  ]}
                  toAddress={BG_MULTISIG_ADDRESS}
                  toUnits={CLAN_CREATION_COST_USD.toString()}
                  toToken={BASE_USDC_ADDRESS}
                  toChain={base.id}
                  connectedWalletOnly={true}
                  onPaymentStarted={handlePaymentStarted}
                  onPaymentCompleted={handlePaymentCompleted}
                  onPaymentBounced={handlePaymentBounced}
                  closeOnSuccess
                >
                  {({ show }) => (
                    <Button
                      type="button"
                      onClick={show}
                      disabled={isSubmitting || !name || paymentStarted}
                      className={cn(
                        "flex-1 py-2 px-4 rounded transition-colors text-sm font-medium",
                        isSubmitting || !name || paymentStarted
                          ? "bg-[#FFB938]/50 text-[#7E4E31]/70 cursor-not-allowed"
                          : "bg-[#FFB938] text-[#7E4E31] hover:bg-[#ffc65c]"
                      )}
                    >
                      {paymentStarted ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </div>
                      ) : (
                        `Pay $${CLAN_CREATION_COST_USD} & Create`
                      )}
                    </Button>
                  )}
                </DaimoPayButton.Custom>
              ) : (
                <button
                  type="submit"
                  disabled={true}
                  className="flex-1 py-2 px-4 rounded transition-colors text-sm font-medium bg-[#FFB938]/50 text-[#7E4E31]/70 cursor-not-allowed"
                >
                  {!address
                    ? "Connect Wallet"
                    : !hasEnoughUSDBalance
                    ? "Insufficient Balance"
                    : "Create"}
                </button>
              )
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !name}
                className={`
                  flex-1 py-2 px-4 rounded transition-colors text-sm font-medium
                  ${
                    submitState === "success"
                      ? "bg-green-500 text-white cursor-not-allowed"
                      : isSubmitting || !name
                      ? "bg-[#FFB938]/50 text-[#7E4E31]/70 cursor-not-allowed"
                      : "bg-[#FFB938] text-[#7E4E31] hover:bg-[#ffc65c]"
                  }
                `}
              >
                {submitState === "creating" ? (
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 border-2 border-t-transparent border-[#7E4E31] rounded-full animate-spin mr-2"></div>
                    Creating...
                  </div>
                ) : submitState === "success" ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="h-5 w-5 mr-2 text-[#7E4E31]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Done!
                  </div>
                ) : (
                  "Creating..."
                )}
              </button>
            )}
          </div>

          {/* Payment success message and transaction link */}
          {paymentCompleted &&
            finalTxHash &&
            !isSubmitting &&
            submitState !== "success" && (
              <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-md">
                <p className="text-green-300 text-sm text-center">
                  Payment successful! Creating your clan...
                </p>
                <p
                  className="text-green-200/70 text-xs text-center underline cursor-pointer mt-1"
                  onClick={async () => {
                    await sdk.actions.openUrl(
                      `${BASE_SCAN_BASE_URL}/tx/${finalTxHash}`
                    );
                  }}
                >
                  View transaction on BaseScan
                </p>
              </div>
            )}
        </form>
      </motion.div>
    </div>
  );
}
