import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { X, Loader2 } from "lucide-react";
import { cn, communityContributionFlexCardComposeCastUrl } from "@/lib/utils";
import { DaimoPayButton } from "@daimo/pay";
import { base } from "viem/chains";
import {
  BASE_USDC_ADDRESS,
  BG_MULTISIG_ADDRESS,
  BASE_SCAN_BASE_URL,
} from "@/lib/contracts/constants";
import { PaymentCompletedEvent } from "@daimo/common";
import { env } from "@/lib/env";
import sdk from "@farcaster/frame-sdk";
import { useGame } from "@/context/GameContext";

interface PowerContributionProps {
  showDialog: boolean;
  onClose: () => void;
  powerCombo: number;
  hasEnoughEthBalance: boolean;
  hasEnoughUSDBalance: boolean;
  walletBalance?: number;
  userId: string;
  onContributionSuccess: (paymentId: string) => void;
  address: `0x${string}` | undefined;
  tokenBalancesIsLoading: boolean;
  returnedDonationId: string | null;
}

export const PowerContribution = ({
  showDialog,
  onClose,
  powerCombo,
  hasEnoughEthBalance,
  hasEnoughUSDBalance,
  walletBalance = 0,
  userId,
  onContributionSuccess,
  address,
  tokenBalancesIsLoading,
  returnedDonationId,
}: PowerContributionProps) => {
  const [contributionAmount, setContributionAmount] = useState(1);
  const [showCustomSlider, setShowCustomSlider] = useState(false);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [finalTxHash, setFinalTxHash] = useState("");
  const [paymentHandled, setPaymentHandled] = useState(false);
  const { state, mode } = useGame();

  const resetState = () => {
    setContributionAmount(1);
    setShowCustomSlider(false);
    setPaymentStarted(false);
    setPaymentCompleted(false);
    setErrorMessage("");
    setFinalTxHash("");
  };

  // Reset state when dialog opens or closes
  useEffect(() => {
    if (showDialog) {
      resetState();
      if (walletBalance < 1 && !tokenBalancesIsLoading) {
        setErrorMessage(
          "You need at least $1 in your wallet to contribute. Please add funds."
        );
      } else if (walletBalance >= 1) {
        setErrorMessage("");
      }
    }
  }, [showDialog, walletBalance, tokenBalancesIsLoading]);

  const handlePaymentStarted = () => {
    setPaymentHandled(false);
    setPaymentStarted(true);
  };

  const handlePaymentCompleted = async (e: PaymentCompletedEvent) => {
    if (paymentHandled) return; // Prevent duplicate handling

    if (!address) {
      setErrorMessage("Wallet address is not available.");
      setPaymentCompleted(false);
      return;
    }

    setPaymentCompleted(true);
    setPaymentStarted(false);
    setFinalTxHash(e.txHash);
    setPaymentHandled(true); // Mark this payment as handled

    try {
      onContributionSuccess(e.paymentId);
      // Modal will stay open so user can see success state and share buttons
    } catch (error) {
      console.error("Error adding community donation:", error);
      setErrorMessage("Failed to record your contribution. Please try again.");
      setPaymentCompleted(false);
      setPaymentHandled(false); // Reset if there was an error
    }
  };

  const handlePaymentBounced = () => {
    setPaymentStarted(false);
    setPaymentCompleted(false);
    setPaymentHandled(false);
    setErrorMessage(
      "There was an error processing your payment. You received back your amount in $USDC on your wallet address. Try again."
    );
  };

  const handleSharePower = async () => {
    if (!returnedDonationId) {
      setErrorMessage("No donation ID available.");
      return;
    }
    const { castUrl } = communityContributionFlexCardComposeCastUrl(
      state.user.fid,
      mode,
      returnedDonationId
    );
    await sdk.actions.openUrl(castUrl);
  };

  return (
    <Dialog
      open={showDialog}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="bg-[#7e4e31] border-yellow-400/20 max-w-[90%] text-white rounded-lg"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <div className="flex justify-between items-center">
          <DialogTitle className="text-md font-semibold text-white/90">
            Contribute Power
          </DialogTitle>
          <DialogClose
            className="w-6 h-6  flex items-center justify-center rounded-full 
            bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
          >
            <X size={16} />
          </DialogClose>
        </div>

        <div className="flex flex-col gap-4">
          {/* Amount and Power Display */}
          <div className="bg-[#4A341A] p-4 rounded-lg border border-yellow-400/10">
            <div className="flex justify-between items-center mb-3">
              <div className="flex flex-col">
                <span className="text-white/70 text-xs">Amount</span>
                <span className="text-2xl font-bold text-yellow-400">
                  ${contributionAmount}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-white/70 text-xs">Farmers Power</span>
                <span className="text-2xl font-bold text-yellow-400">
                  {contributionAmount * powerCombo} FP
                </span>
              </div>
            </div>
            <div className="flex justify-between gap-2 text-white/70 text-xs text-center border-t border-yellow-400/10 pt-2 mt-1">
              <span className="text-white/70">Current Combo:</span>
              <span className="text-yellow-400 font-bold">{powerCombo}x</span>
            </div>
          </div>

          {!paymentCompleted && !finalTxHash && (
            <div className="flex flex-col gap-3">
              <div className="flex w-full justify-between mt-2">
                <span className="text-white/70 text-xs flex items-center gap-2">
                  Balance:{" "}
                  {tokenBalancesIsLoading ? (
                    <Loader2
                      className="w-3 h-3 animate-spin text-yellow-400"
                      strokeWidth={3}
                    />
                  ) : (
                    `$${walletBalance.toFixed(2)}`
                  )}
                </span>
              </div>

              {/* Preset Amount Buttons */}
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 5, 10].map((amount) => (
                  <Button
                    key={amount}
                    variant="default"
                    className={cn(
                      "py-3 text-base font-medium",
                      contributionAmount === amount
                        ? "text-[#5C4121] bg-yellow-500 hover:bg-yellow-500"
                        : "text-yellow-400/90 bg-[#5C4121] hover:bg-[#5C4121]/70"
                    )}
                    onClick={() => {
                      setContributionAmount(amount);
                      setShowCustomSlider(false);
                    }}
                    disabled={tokenBalancesIsLoading}
                  >
                    ${amount}
                  </Button>
                ))}
                <Button
                  variant="default"
                  className={cn(
                    "py-3 text-base font-medium",
                    showCustomSlider
                      ? "text-[#5C4121] bg-yellow-500"
                      : "text-yellow-400/90 bg-[#5C4121] hover:bg-[#5C4121]/80"
                  )}
                  onClick={() => setShowCustomSlider(!showCustomSlider)}
                  disabled={tokenBalancesIsLoading}
                >
                  +
                </Button>
              </div>
              {/* Custom Amount Slider */}
              <Accordion
                type="single"
                collapsible
                className="w-full"
                value={showCustomSlider ? "custom-amount" : ""}
              >
                <AccordionItem
                  value="custom-amount"
                  className="border-0"
                >
                  <AccordionTrigger className="hidden">
                    Custom Amount
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-2 bg-[#6D4C2C] p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/70 text-sm">
                          Custom amount:
                        </span>
                        <span className="text-yellow-400 font-bold">
                          ${contributionAmount}
                        </span>
                      </div>
                      <Slider
                        variant="yellow-brown"
                        value={[contributionAmount]}
                        onValueChange={(value) =>
                          setContributionAmount(value[0])
                        }
                        max={50}
                        min={1}
                        step={1}
                        disabled={tokenBalancesIsLoading}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Payment Button */}
          {!paymentCompleted ? (
            !errorMessage && (
              <DaimoPayButton.Custom
                appId={env.NEXT_PUBLIC_DAIMO_PAY_ID}
                metadata={{
                  userId,
                }}
                preferredChains={[base.id]}
                preferredTokens={[
                  { chain: base.id, address: BASE_USDC_ADDRESS },
                ]}
                toAddress={BG_MULTISIG_ADDRESS}
                toUnits={contributionAmount.toString()}
                toToken={BASE_USDC_ADDRESS}
                toChain={base.id}
                onPaymentStarted={handlePaymentStarted}
                onPaymentCompleted={handlePaymentCompleted}
                onPaymentBounced={handlePaymentBounced}
                closeOnSuccess
              >
                {({ show }) => (
                  <Button
                    variant="default"
                    className={cn(
                      "w-full py-3 text-base font-medium",
                      !hasEnoughEthBalance ||
                        !hasEnoughUSDBalance ||
                        tokenBalancesIsLoading
                        ? "text-yellow-400/50 cursor-not-allowed bg-yellow-500/10"
                        : "text-[#5C4121] bg-yellow-500 hover:bg-yellow-500/80 hover:text-[#5C4121]"
                    )}
                    onClick={show}
                    disabled={
                      !hasEnoughEthBalance ||
                      !hasEnoughUSDBalance ||
                      paymentStarted ||
                      paymentCompleted ||
                      tokenBalancesIsLoading
                    }
                  >
                    {tokenBalancesIsLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2
                          className="w-4 h-4 animate-spin"
                          strokeWidth={3}
                        />
                        <span>Loading...</span>
                      </div>
                    ) : paymentStarted ? (
                      "Contributing..."
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                )}
              </DaimoPayButton.Custom>
            )
          ) : (
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-yellow-400/20">
              <span className="text-yellow-400 font-semibold text-sm text-center">
                🎉 Congrats! 🎉
              </span>
              <span className="text-white/90 text-xs text-center">
                You just contributed{" "}
                <span className="text-yellow-400 font-bold">
                  {contributionAmount * powerCombo} FP
                </span>{" "}
                to help the farmers!
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-sm p-3 rounded">
              {errorMessage}
            </div>
          )}

          {paymentCompleted && finalTxHash && (
            <div className="flex flex-col gap-3">
              {returnedDonationId !== null ? (
                <Button
                  onClick={handleSharePower}
                  className="w-full py-3 text-base font-medium text-[#5C4121] bg-yellow-500 hover:bg-yellow-500/80 hover:text-[#5C4121]"
                >
                  Share 🎁
                </Button>
              ) : (
                <Button
                  className="w-full py-3 text-base font-medium text-yellow-400/50 cursor-not-allowed bg-yellow-500/10"
                  disabled
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2
                      className="w-4 h-4 animate-spin"
                      strokeWidth={3}
                    />
                    <span>Processing...</span>
                  </div>
                </Button>
              )}
              <p
                className="text-white/70 text-sm text-center underline cursor-pointer"
                onClick={async () => {
                  await sdk.actions.openUrl(
                    BASE_SCAN_BASE_URL + `/tx/${finalTxHash}`
                  );
                }}
              >
                View tx on BaseScan
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
