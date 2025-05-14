import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";
import { DaimoPayButton, DaimoPayCompletedEvent } from "@daimo/pay";
import { base } from "viem/chains";
import {
  BASE_SCAN_BASE_URL,
  BASE_USDC_ADDRESS,
  BG_MULTISIG_ADDRESS,
} from "@/lib/contracts/constants";
import { env } from "@/lib/env";
import { useState } from "react";
import sdk from "@farcaster/frame-sdk";
import { GameState } from "@/hooks/use-game-state";

interface ContributeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contributionAmount: number;
  setContributionAmount: (amount: number) => void;
  powerCombo: number;
  hasEnoughEthBalance: boolean;
  hasEnoughUSDBalance: boolean;
  totalBalanceUSD: number;
  onPaymentCompleted: (e: DaimoPayCompletedEvent) => void;
  onPaymentStarted: () => void;
  onPaymentBounced: () => void;
  errorMessage?: string;
  paymentStarted: boolean;
  paymentCompleted: boolean;
  finalTxHash?: string;
  state: GameState;
}

export function ContributeDialog({
  isOpen,
  onClose,
  contributionAmount,
  setContributionAmount,
  powerCombo,
  hasEnoughEthBalance,
  hasEnoughUSDBalance,
  totalBalanceUSD,
  onPaymentCompleted,
  onPaymentStarted,
  onPaymentBounced,
  errorMessage,
  paymentStarted,
  paymentCompleted,
  finalTxHash,
  state,
}: ContributeDialogProps) {
  const [showCustomSlider, setShowCustomSlider] = useState(false);

  const handleSharePower = async () => {
    await sdk.actions.openUrl(
      `https://warpcast.com/~/compose?text=I just boosted all Farville farmers' growth speed by ${powerCombo}x! ⚡%0A%0APlay Farville: https://farville.farm`
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent
        showCloseButton={false}
        className="bg-[#7e4e31] border-yellow-400/20 max-w-[90%] text-white rounded-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <DialogTitle className="text-lg font-semibold text-white/90">
            Contribute Power
          </DialogTitle>
          <DialogClose
            className="w-8 h-8 flex items-center justify-center rounded-full 
                bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
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

          <div className="mt-2">
            <span className="text-white/70 text-xs">
              Balance: ${totalBalanceUSD?.toFixed(2) ?? "0"}
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
                    onValueChange={(value) => setContributionAmount(value[0])}
                    max={50}
                    min={1}
                    step={1}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Payment Button */}
          <DaimoPayButton.Custom
            appId={env.NEXT_PUBLIC_DAIMO_PAY_ID}
            metadata={{
              userId: state.user.fid.toString(),
            }}
            preferredChains={[base.id]}
            preferredTokens={[{ chain: base.id, address: BASE_USDC_ADDRESS }]}
            toAddress={BG_MULTISIG_ADDRESS}
            toUnits={contributionAmount.toString()}
            toToken={BASE_USDC_ADDRESS}
            toChain={base.id}
            closeOnSuccess
            onPaymentStarted={onPaymentStarted}
            onPaymentCompleted={(e) => {
              onPaymentCompleted(e);
              onClose();
            }}
            onPaymentBounced={onPaymentBounced}
          >
            {({ show }) => (
              <Button
                variant="default"
                className={cn(
                  "w-full py-3 text-base font-medium",
                  !hasEnoughEthBalance || !hasEnoughUSDBalance
                    ? "text-yellow-400/50 cursor-not-allowed bg-yellow-500/10"
                    : "text-[#5C4121] bg-yellow-500 hover:bg-yellow-500/80 hover:text-[#5C4121]",
                  paymentCompleted &&
                    "bg-green-500 text-green-200 cursor-not-allowed"
                )}
                onClick={show}
                disabled={
                  !hasEnoughEthBalance ||
                  !hasEnoughUSDBalance ||
                  paymentStarted ||
                  paymentCompleted
                }
              >
                {paymentStarted
                  ? "Contributing..."
                  : paymentCompleted
                  ? "Contributed Successfully!"
                  : "Confirm Contribution"}
              </Button>
            )}
          </DaimoPayButton.Custom>

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
                Share Power Boost 🎁
              </Button>
              <p
                className="text-white/70 text-sm text-center underline cursor-pointer"
                onClick={async () => {
                  await sdk.actions.openUrl(
                    BASE_SCAN_BASE_URL + `/tx/${finalTxHash}`
                  );
                }}
              >
                View transaction on BaseScan
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
