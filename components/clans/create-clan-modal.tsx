import { useState } from "react";
import { motion } from "framer-motion";
import { useClanOperations } from "@/hooks/game-actions/use-clan-operations";
import Image from "next/image";
import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateClanModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateClanModal({
  onClose,
  onSuccess,
}: CreateClanModalProps) {
  const [name, setName] = useState("");
  const [motto, setMotto] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { createClan } = useClanOperations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      setError("Clan name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      createClan({
        name,
        motto,
        isPublic,
        ...(imageUrl && { imageUrl }),
      });

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err) {
      console.error("Error creating clan:", err);
      setError("Failed to create clan. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-60"
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
            Create a New Clan
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
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-md p-2 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-white/80 text-sm font-medium">
              Clan Name*
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter clan name"
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
              placeholder="Enter clan motto"
              className="w-full bg-[#5A4129] border border-[#8B5E3C] text-white/90 rounded-md px-3 py-2 placeholder:text-white/40 focus:outline-none focus:border-[#FFB938]"
              maxLength={40}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-white/80 text-sm font-medium">
              Image URL (optional)
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
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
              Make clan public
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
              disabled={isSubmitting || !name}
              className={`
                flex-1 py-2 px-4 rounded text-[#7E4E31] transition-colors text-sm font-medium
                ${
                  isSubmitting || !name
                    ? "bg-[#FFB938]/50 cursor-not-allowed"
                    : "bg-[#FFB938] hover:bg-[#ffc65c]"
                }
              `}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-t-transparent border-[#7E4E31] rounded-full animate-spin mr-2"></div>
                  Creating...
                </div>
              ) : (
                "Create Clan"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
