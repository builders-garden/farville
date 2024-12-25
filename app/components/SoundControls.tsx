import { useAudio } from "../context/AudioContext";
import { motion } from "framer-motion";

export default function SoundControls() {
  const { toggleMusic, isMusicPlaying, setVolume, volume } = useAudio();

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-3 bg-[#7E4E31] p-2 rounded-lg shadow-lg z-50">
      <button
        onClick={toggleMusic}
        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#6d4c2c] transition-colors"
      >
        <motion.span
          animate={isMusicPlaying ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-white/90 text-xl"
        >
          {isMusicPlaying ? "🎵" : "🔇"}
        </motion.span>
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="w-24 accent-[#FFB938]"
      />
    </div>
  );
}
