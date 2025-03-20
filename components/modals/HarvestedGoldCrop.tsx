import Image from "next/image";

interface HarvestedGoldCropProps {
  goldCrops: { crop: string; amount: number }[];
  onClose: () => void;
}

export const HarvestedGoldCrop = ({
  goldCrops,
  onClose,
}: HarvestedGoldCropProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] w-[94%] p-6 rounded-xl shadow-lg shadow-yellow-500/50">
        <h3 className="text-2xl font-bold text-center mb-2 text-yellow-500">
          You found new gold crops!
        </h3>
        <div
          className={`flex flex-row overflow-x-auto my-2 mx-auto no-scrollbar ${
            goldCrops.length >= 3
              ? "justify-start"
              : goldCrops.length === 2
              ? "justify-between"
              : "justify-center"
          }`}
        >
          {goldCrops.map((goldCrop) => (
            <div
              key={goldCrop.crop}
              className="flex flex-col items-center gap-2 my-8 mx-4"
            >
              <div
                className={`flex items-center justify-center bg-gradient-to-br from-[#8B6E4E] to-[#6D4C2C] rounded-lg [animation:golden-pulse_2s_ease-in-out_infinite] border-2 border-yellow-600 ${
                  goldCrops.length === 1 ? "w-40 h-40" : "w-32 h-32"
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
            className="flex-1 py-2 px-4 rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30
                     transition-colors text-sm font-medium border border-yellow-500/30 flex items-center justify-center gap-2"
          >
            Share
          </button>
          <button
            onClick={() => onClose()}
            className="flex-1 py-2 px-4 rounded bg-white/10 text-white/90 hover:bg-white/20 
                     transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
