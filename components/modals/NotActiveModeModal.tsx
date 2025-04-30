import { useGame } from "@/context/GameContext";
import { MODE_DEFINITIONS } from "@/lib/modes/constants";
import { Countdown } from "../Countdown";

interface NotActiveModeProps {
  onClose: () => void;
}

export const NotActiveModeModal = ({ onClose }: NotActiveModeProps) => {
  const { mode } = useGame();

  const modeDefinition = MODE_DEFINITIONS[mode];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[9999]">
      <div
        className={`bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] w-[94%] p-4 rounded-xl shadow-lg shadow-yellow-500/50"
        }`}
      >
        <h3 className="text-2xl font-bold text-center mb-2 text-yellow-500 animate-pulse">
          {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
        </h3>
        <div
          className={`flex flex-col text-md overflow-x-auto my-2 mx-auto no-scrollbar justify-center gap-4`}
        >
          <span className="text-white/70 text-center px-2">
            {modeDefinition.description}
          </span>
          <Countdown
            date={new Date(modeDefinition.startDate!)}
            text="Starts in"
            startsIn
          />
        </div>
        <div className="flex flex-row gap-3 mt-8">
          <button
            onClick={() => onClose()}
            className={`flex-1 py-2 px-4 rounded bg-white/10 text-white/90 hover:bg-white/20 
                    transition-all duration-500 text-sm font-medium`}
          >
            Back to Classic
          </button>
        </div>
      </div>
    </div>
  );
};
