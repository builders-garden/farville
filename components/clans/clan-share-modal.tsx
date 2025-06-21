import { motion } from "framer-motion";
import { useState } from "react";
import { X, Share2, Copy } from "lucide-react";
import { clanFlexCardComposeCastUrl } from "@/lib/utils";
import sdk from "@farcaster/frame-sdk";

interface ClanShareModalProps {
  clanId: string;
  clanName: string;
  userFid: number;
  onClose: () => void;
}

export default function ClanShareModal({
  clanId,
  clanName,
  userFid,
  onClose,
}: ClanShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [errorCopying, setErrorCopying] = useState(false);

  // Generate the share URLs
  const { frameUrl, castUrl } = clanFlexCardComposeCastUrl(
    userFid,
    clanId,
    clanName
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(frameUrl);
      setCopied(true);
      setErrorCopying(false);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      setErrorCopying(true);
      console.error("Error copying clan URL:", error);
    }
  };

  const handleShareToCast = async () => {
    try {
      await sdk.actions.openUrl(castUrl);
      onClose();
    } catch (error) {
      console.error("Error sharing clan URL:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
      onClick={onClose}
    >
      <div
        className="bg-[#7E4E31] p-6 rounded-lg max-w-sm w-full mx-4 border-2 border-[#8B5E3C]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Share2
              size={20}
              className="text-[#FFB938]"
            />
            <h3 className="text-white/90 font-bold text-lg">Share Feud</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full 
                    bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Clan Info */}
        <div className="mb-6">
          <div className="flex items-center gap-3 p-3 bg-[#6d4c2c] rounded-lg">
            <span className="text-2xl">🛡️</span>
            <div>
              <h4 className="text-white font-bold text-md">{clanName}</h4>
              <p className="text-white/70 text-sm">
                Invite others to join your feud
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              className="flex-1 border-2 border-[#FFB938] text-[#FFB938] px-4 py-2 rounded-lg font-bold
                   hover:bg-[#FFB938]/10 transition-colors relative"
              onClick={handleCopy}
            >
              <div className="flex items-center justify-center gap-2 min-w-[70px]">
                <Copy size={16} />
                <span
                  style={{
                    width: "56px",
                    display: "inline-block",
                    textAlign: "center",
                  }}
                >
                  Copy
                </span>
              </div>
              {copied && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-green-500 text-white rounded-md flex items-center justify-center"
                >
                  Copied!
                </motion.span>
              )}
            </button>
            <button
              className="flex-1 bg-[#FFB938] text-[#7E4E31] px-4 py-2 rounded-lg font-bold 
                   hover:bg-[#ffc661] transition-colors"
              onClick={handleShareToCast}
            >
              <div className="flex items-center justify-center gap-2">
                <Share2 size={16} />
                Share
              </div>
            </button>
          </div>

          {errorCopying && (
            <div className="flex flex-col gap-1 mt-2 p-3 bg-[#6d4c2c] rounded text-white/80 text-xs xs:text-sm">
              <p>Error copying. Send this URL to your friends:</p>
              <p className="mt-1 p-1 bg-[#5A4129] rounded break-all">
                {frameUrl}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
