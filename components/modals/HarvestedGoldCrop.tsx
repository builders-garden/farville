import Image from "next/image";
import { useEffect, useState } from "react";
import Confetti from "../animations/Confetti";
import { useAudio } from "@/context/AudioContext";

interface HarvestedGoldCropProps {
  goldCrops: { crop: string; amount: number }[];
  onClose: () => void;
}

export const HarvestedGoldCrop = ({
  goldCrops,
  onClose,
}: HarvestedGoldCropProps) => {
  const [animated, setAnimated] = useState(false);
  const { playSound } = useAudio();
  const [goldCropsFound, setGoldCropsFound] = useState<
    { crop: string; amount: number }[]
  >([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
      playSound("levelUp");
    }, 100);

    return () => clearTimeout(timer);
  }, [playSound]);

  useEffect(() => {
    if (goldCropsFound.length === 0) {
      setGoldCropsFound(goldCrops);
    }
  }, [goldCrops]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[9999]">
      <div
        className={`bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] w-[94%] p-6 rounded-xl shadow-lg shadow-yellow-500/50 
        transition-all duration-500 transform ${
          animated ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      >
        <Confetti />
        <h3 className="text-2xl font-bold text-center mb-2 text-yellow-500 animate-pulse">
          You found new gold crops!
        </h3>
        <div
          className={`flex flex-row overflow-x-auto my-2 mx-auto no-scrollbar ${
            goldCropsFound.length >= 3
              ? "justify-start"
              : goldCropsFound.length === 2
              ? "justify-between"
              : "justify-center"
          }`}
        >
          {goldCropsFound.map((goldCrop, index) => (
            <div
              key={goldCrop.crop}
              className={`flex flex-col items-center gap-2 my-8 mx-4 transition-all duration-500 transform 
              ${
                animated
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div
                className={`flex items-center justify-center bg-gradient-to-br from-[#8B6E4E] to-[#6D4C2C] rounded-lg [animation:golden-pulse_2s_ease-in-out_infinite] border-2 border-yellow-600 ${
                  goldCropsFound.length === 1 ? "w-40 h-40" : "w-32 h-32"
                }`}
              >
                <div className="w-16 h-16 relative mx-auto">
                  <Image
                    src={`/images/crop/${goldCrop.crop}.png`}
                    alt={goldCrop.crop}
                    fill
                    className="inline-block [animation:float_2s_ease-in-out_infinite]"
                  />
                </div>
              </div>
              <div className="flex flex-row items-center gap-2 mt-4">
                <p className="text-lg font-bold text-yellow-500">
                  +{goldCrop.amount}
                </p>
                <p className="text-yellow-100 capitalize text-xs">
                  {goldCrop.crop.replace("-", " ")}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              console.log("missing implementation");
            }}
            className={`flex-1 py-2 px-4 rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30
                    transition-all duration-500 text-sm font-medium border border-yellow-500/30 
                    flex items-center justify-center gap-2 ${
                      animated ? "opacity-100" : "opacity-0"
                    }`}
            style={{
              transitionDelay: `${goldCropsFound.length * 200 + 100}ms`,
            }}
          >
            Share
          </button>
          <button
            onClick={() => onClose()}
            className={`flex-1 py-2 px-4 rounded bg-white/10 text-white/90 hover:bg-white/20 
                    transition-all duration-500 text-sm font-medium ${
                      animated ? "opacity-100" : "opacity-0"
                    }`}
            style={{
              transitionDelay: `${goldCropsFound.length * 200 + 200}ms`,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
