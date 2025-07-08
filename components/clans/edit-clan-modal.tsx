import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useClanOperations } from "@/hooks/game-actions/use-clan-operations";
import { useGame } from "@/context/GameContext";
import Image from "next/image";
import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ClanWithData } from "@/lib/prisma/types";

interface EditClanModalProps {
  clan: ClanWithData;
  onClose: () => void;
  onSuccess?: () => void;
  refetchClan: () => void;
}

export default function EditClanModal({
  clan,
  onClose,
  onSuccess,
  refetchClan,
}: EditClanModalProps) {
  const { state } = useGame();
  const userLevel = state.level;

  const [motto, setMotto] = useState(clan.motto || "");
  const [isPublic, setIsPublic] = useState(clan.isPublic);
  const [imageUrl, setImageUrl] = useState(clan.imageUrl || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [requiredLevel, setRequiredLevel] = useState<number | null>(
    clan.requiredLevel
  );

  // Handle image file selection
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      setImageFile(file);
      setImageUrl(""); // Clear URL if file is set
    } else {
      setImageFile(null);
    }
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<
    "idle" | "updating" | "success"
  >("idle");
  const [error, setError] = useState("");

  const { updateClan } = useClanOperations(refetchClan);

  // If editing, prefill imageUrl with current clan image if present
  useEffect(() => {
    if (clan.imageUrl) {
      setImageUrl(clan.imageUrl);
    }
  }, [clan.imageUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSubmitState("updating");
    setError("");
    try {
      updateClan(
        {
          clanId: clan.id,
          motto,
          isPublic,
          ...(imageFile && { imageFile }),
          requiredLevel,
        },
        {
          onSuccess: () => {
            setSubmitState("success");
            setTimeout(() => {
              refetchClan();
              if (onSuccess) onSuccess();
            }, 200);
            setTimeout(() => {
              onClose();
            }, 1000);
          },
          onError: (error) => {
            console.error("Error updating clan:", error);
            setError("Failed to update clan. Please try again.");
            setIsSubmitting(false);
            setSubmitState("idle");
          },
        }
      );
    } catch (err) {
      console.error("Error updating clan:", err);
      setError("Failed to update clan. Please try again.");
      setIsSubmitting(false);
      setSubmitState("idle");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]"
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
            Edit Feud
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full \
                    bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-md p-2 text-red-300 text-sm">
              {error}
            </div>
          )}
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
              Image
            </label>
            <div className="flex flex-col gap-2 mt-2">
              <label className="flex items-center justify-center px-4 py-2 border rounded-md cursor-pointer transition-colors bg-[#5A4129] border-[#FFB938] text-[#FFB938] hover:bg-[#6A5139]">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml,image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <span className="text-sm">Choose image file</span>
              </label>

              <div className="text-white/50 text-[8px] text-center">
                PNG, JPEG, JPG, GIF, SVG, WEBP
              </div>

              {imageFile && (
                <span className="text-white/60 text-xs text-center">
                  {imageFile.name.length > 20
                    ? `${imageFile.name.slice(0, 20)}...`
                    : imageFile.name}
                </span>
              )}
            </div>
            {(imageFile || imageUrl) && (
              <div className="relative h-20 w-20 mx-auto mt-2 rounded-md border-2 border-[#8B5E3C] overflow-hidden bg-[#5A4129] flex items-center justify-center">
                {imageFile ? (
                  <Image
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    onError={() => setImageUrl("")}
                  />
                ) : (
                  <span className="text-white/60 text-xs">
                    No image selected or URL provided
                  </span>
                )}
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
                  <option key={level} value={level}>
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
            <label htmlFor="public" className="text-sm text-white/80">
              Public feud
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded bg-white/10 text-white/90 hover:bg-white/20 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                flex-1 py-2 px-4 rounded transition-colors text-sm font-medium
                ${
                  submitState === "success"
                    ? "bg-green-500 text-white cursor-not-allowed"
                    : isSubmitting
                    ? "bg-[#FFB938]/50 text-[#7E4E31]/70 cursor-not-allowed"
                    : "bg-[#FFB938] text-[#7E4E31] hover:bg-[#ffc65c]"
                }
              `}
            >
              {submitState === "updating" ? (
                <div className="flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-t-transparent border-[#7E4E31] rounded-full animate-spin mr-2"></div>
                  Updating...
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
                "Save"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
