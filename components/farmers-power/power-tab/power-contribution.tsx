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
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { useAddCommunityDonation } from "@/hooks/use-add-community-donation";
import { Mode } from "@/lib/types/game";

interface PowerContributionProps {
  showDialog: boolean;
  onClose: () => void;
  powerCombo: number;
  currentStageInfo: { boost: number };
  hasEnoughEthBalance: boolean;
  hasEnoughUSDBalance: boolean;
  walletBalance?: number;
  userId: string;
  onContributionSuccess: (amount: number) => void;
  mode: Mode;
  address: `0x${string}` | undefined;
  username: string;
}

export const PowerContribution = ({
  showDialog,
  onClose,
  powerCombo,
  currentStageInfo,
  hasEnoughEthBalance,
  hasEnoughUSDBalance,
  walletBalance = 0,
  userId,
  onContributionSuccess,
  mode,
  address,
  username,
}: PowerContributionProps) => {
  const [contributionAmount, setContributionAmount] = useState(1);
  const [showCustomSlider, setShowCustomSlider] = useState(false);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [finalTxHash, setFinalTxHash] = useState("");
  const [paymentHandled, setPaymentHandled] = useState(false);

  const { mutate: addCommunityDonation } = useAddCommunityDonation();

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
    }
  }, [showDialog]);

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
      addCommunityDonation({
        txHash: e.txHash,
        mode,
        fid: Number(userId),
        ptAmount: contributionAmount * powerCombo,
        dollarAmount: contributionAmount,
        walletAddress: address,
        username,
      });
      onContributionSuccess(contributionAmount);
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
    await sdk.actions.openUrl(
      `https://warpcast.com/~/compose?text=I just boosted all Farville farmers' growth speed by ${currentStageInfo.boost}x! ⚡%0A%0APlay Farville: https://farville.farm`
    );
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
          <DialogTitle className="text-lg font-semibold text-white/90">
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
                <span className="text-white/70 text-xs">Power Points</span>
                <span className="text-2xl font-bold text-yellow-400">
                  {contributionAmount * powerCombo} FP
                </span>
              </div>
            </div>
            <div className="flex justify-between gap-2 text-white/70 text-xs text-center border-t border-yellow-400/10 pt-2 mt-1">
              <span className="text-white/70">Current Combo:</span>
              <span className="text-yellow-400 font-bold">×{powerCombo}</span>
            </div>
          </div>

          {!paymentCompleted && !finalTxHash && (
            <div className="flex flex-col gap-3">
              <div className="flex w-full justify-between mt-2">
                <span className="text-white/70 text-xs">
                  Balance: ${walletBalance.toFixed(2)}
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
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Payment Button */}
          {!paymentCompleted ? (
            <DaimoPayButton.Custom
              appId={env.NEXT_PUBLIC_DAIMO_PAY_ID}
              metadata={{
                userId,
              }}
              preferredChains={[base.id]}
              preferredTokens={[{ chain: base.id, address: BASE_USDC_ADDRESS }]}
              toAddress={BG_MULTISIG_ADDRESS}
              // toUnits={contributionAmount.toString()}
              toUnits={"0.000001"}
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
                    !hasEnoughEthBalance || !hasEnoughUSDBalance
                      ? "text-yellow-400/50 cursor-not-allowed bg-yellow-500/10"
                      : "text-[#5C4121] bg-yellow-500 hover:bg-yellow-500/80 hover:text-[#5C4121]"
                  )}
                  onClick={show}
                  disabled={
                    !hasEnoughEthBalance ||
                    !hasEnoughUSDBalance ||
                    paymentStarted ||
                    paymentCompleted
                  }
                >
                  {paymentStarted ? "Contributing..." : "Confirm"}
                </Button>
              )}
            </DaimoPayButton.Custom>
          ) : (
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-yellow-400/20">
              <span className="text-yellow-400 font-semibold text-sm text-center">
                🎉 Congratulations! 🎉
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
              <Button
                onClick={handleSharePower}
                className="w-full py-3 text-base font-medium text-[#5C4121] bg-yellow-500 hover:bg-yellow-500/80 hover:text-[#5C4121]"
              >
                Share 🎁
              </Button>
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
