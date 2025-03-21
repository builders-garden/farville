import { useGame } from "@/context/GameContext";
import { ACHIEVEMENTS_THRESHOLDS } from "@/lib/game-constants";
import { achievementBadgeFlexCardComposeCastUrl } from "@/lib/utils";
import sdk from "@farcaster/frame-sdk";
import Image from "next/image";
import { useEffect, useState } from "react";
import Confetti from "../animations/Confetti";
import { useAudio } from "@/context/AudioContext";

interface NewAchievementReachedProps {
  achievements: { crop: string; step: number }[];
  onClose: () => void;
}

export const NewAchievementReached = ({
  achievements,
  onClose,
}: NewAchievementReachedProps) => {
  const { state } = useGame();
  const [animated, setAnimated] = useState(false);
  const { playSound } = useAudio();

  // create a new constant that contains the achievements and the threshold for that crop
  const fullAchievementsData = achievements.map((achievement) => {
    const cropThreshold = ACHIEVEMENTS_THRESHOLDS.find(
      (threshold) => threshold.crop === achievement.crop
    );

    return {
      crop: achievement.crop,
      step: achievement.step,
      title: cropThreshold!.titles[achievement.step - 1],
      amount: cropThreshold!.thresholds[achievement.step - 1],
    };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
      playSound("levelUp");
    }, 100);

    return () => clearTimeout(timer);
  }, [playSound]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[999]">
      <div
        className={`bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] w-[94%] p-6 rounded-xl shadow-lg shadow-yellow-500/50
        transition-all duration-500 transform ${
          animated ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      >
        <Confetti />
        <h3 className="text-xl font-bold text-center mb-2 text-yellow-500 animate-pulse">
          New Achievement{fullAchievementsData.length > 1 ? "s" : ""}!
        </h3>
        <div
          className={`flex flex-row overflow-x-auto my-2 gap-8 mx-auto no-scrollbar ${
            fullAchievementsData.length >= 3
              ? "justify-start"
              : fullAchievementsData.length === 2
              ? "justify-between"
              : "justify-center"
          }`}
        >
          {fullAchievementsData.map((achievement, index) => (
            <div
              key={achievement.crop}
              className={`flex flex-col items-center gap-2 my-8 min-w-[250px] transition-all duration-500 transform 
              ${
                animated
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div
                className={`relative mx-auto [animation:float_2s_ease-in-out_infinite] ${
                  achievements.length === 1 ? "w-56 h-56" : "w-40 h-40"
                }`}
              >
                <Image
                  src={`/images/badge/honours/${achievement.crop}-${achievement.step}.png`}
                  alt={`Badge displaying that the user has reached the step ${achievement.step} with crop ${achievement.crop}`}
                  fill
                  className="rounded-lg [animation:golden-pulse_2s_ease-in-out_infinite] border-4 border-yellow-400"
                />
              </div>
              <div className="flex flex-col items-center gap-4 mt-4">
                <p
                  className={`font-bold text-yellow-500 h-10 ${
                    achievement.title.length > 12 ? "text-md" : "text-xl"
                  }`}
                >
                  {achievement.title}
                </p>
                <p className="text-yellow-100 text-center text-xs">
                  {`Congrats! You have harvested ${achievement.amount} ${
                    achievement.crop.endsWith("y")
                      ? achievement.crop.slice(0, achievement.crop.length - 1) +
                        "ies"
                      : achievement.crop.endsWith("o")
                      ? achievement.crop + "es"
                      : achievement.crop + "s"
                  } and earned a new badge!`}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-row gap-3">
          <button
            onClick={async () => {
              const { castUrl } = achievementBadgeFlexCardComposeCastUrl(
                state.user.fid,
                fullAchievementsData[0].crop,
                fullAchievementsData[0].step,
                fullAchievementsData[0].title
              );
              await sdk.actions.openUrl(castUrl);
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
