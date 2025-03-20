import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ACHIEVEMENTS_GOLD_MULTIPLIER,
  ACHIEVEMENTS_THRESHOLDS,
  BASE_GOLD_CROP_PERCENTAGE,
} from "@/lib/game-constants";
import Image from "next/image";
import InfoModal from "../modals/InfoModal";
import { Dispatch, SetStateAction, useState } from "react";
import { BadgeModalData } from "../ProfileModal";

interface HarvestHonourProps {
  crop: string;
  title: string;
  totalCount: number;
  currentCount: number;
  currentGoal: number;
  step: number;
  setBadgeModalData: Dispatch<SetStateAction<BadgeModalData | null>>;
}

export const HarvestHonour = ({
  crop,
  title,
  totalCount,
  currentCount,
  currentGoal,
  step,
  setBadgeModalData,
}: HarvestHonourProps) => {
  const [showGoldCropModal, setShowGoldCropModal] = useState(false);
  const goldCropChancePercentage =
    step > 1
      ? BASE_GOLD_CROP_PERCENTAGE * (step - 1) * ACHIEVEMENTS_GOLD_MULTIPLIER
      : BASE_GOLD_CROP_PERCENTAGE;

  return (
    <Card className="bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none w-full">
      <CardContent className="flex flex-col items-center gap-2 p-4">
        <div className="flex flex-row justify-between w-full">
          {
            // render trophies
            [1, 2, 3, 4].map((trophy) =>
              step < trophy ? (
                <div
                  key={trophy}
                  className="h-12 w-12 bg-[#7B5B30] rounded-lg flex items-center justify-center opacity-50"
                >
                  <Image
                    src={`/images/profile/question-mark-yellow.png`}
                    alt="Yellow question mark"
                    width={24}
                    height={24}
                  />
                </div>
              ) : (
                <div
                  key={trophy}
                  className={`h-12 w-12 bg-[#7E4E31] rounded-lg flex items-center justify-center border-2 border-[#f2a311] cursor-pointer ${
                    step === trophy ? "opacity-50 border-opacity-50" : ""
                  }`}
                  onClick={() => {
                    const cropAchievements = ACHIEVEMENTS_THRESHOLDS.find(
                      (achievement) => achievement.crop === crop
                    );
                    setBadgeModalData({
                      name: crop,
                      title:
                        cropAchievements?.titles[trophy - 1] ||
                        `Badge for ${crop} achievement`,
                      description: `A badge issued to those who demonstrated mastery of the ${crop} by harvesting ${
                        cropAchievements?.thresholds[trophy - 1]
                      } ${
                        crop.endsWith("y")
                          ? crop.slice(0, crop.length - 1) + "ies"
                          : crop.endsWith("o")
                          ? crop + "es"
                          : crop + "s"
                      }!`,
                      badgeUrl: `/images/badge/honours/${crop}-${trophy}.png`,
                      step: trophy,
                      type: "honour",
                    });
                  }}
                >
                  <Image
                    src={`/images/badge/honours/${crop}-${trophy}.png`}
                    alt={`Badge ${trophy}`}
                    width={50}
                    height={50}
                    className="rounded-lg"
                  />
                </div>
              )
            )
          }
        </div>
        <hr className="w-full opacity-30 my-2" />
        <div className="flex flex-row w-full gap-4">
          <div className="relative w-12 h-12 mx-auto rounded-md [image-rendering:pixelated] bg-[#7E4E31]">
            <Image
              src={`/images/crop/${crop}.png`}
              alt={crop}
              fill
              sizes="48px"
            />
          </div>

          <div className="flex-1 text-white/90">
            <div className="flex flex-row justify-between items-end">
              <p className="text-xs font-bold">{title}</p>
              <p className="text-[10px]">
                ({totalCount}/{currentGoal})
              </p>
            </div>
            <Progress
              value={(currentCount / currentGoal) * 100}
              className="mt-2 bg-[#7E4E31]"
            />
          </div>

          {/* gold crop percentage value */}
          <div
            className="flex flex-col items-center justify-center cursor-pointer"
            onClick={() => setShowGoldCropModal(true)}
          >
            <Image
              src="/images/special/gold.png"
              alt="Gold ingot"
              width={32}
              height={32}
              priority
              style={{
                width: "auto",
              }}
            />
            <p className="text-[8px] font-bold text-[#FFD700]">
              {goldCropChancePercentage * 100}%
            </p>
          </div>
          {showGoldCropModal && (
            <InfoModal
              title="Gold Crop Chance"
              icon="/images/special/gold.png"
              onCancel={() => setShowGoldCropModal(false)}
            >
              <div className="flex flex-col items-center gap-2 my-8">
                <p className="text-xs text-white/90">
                  The chance of harvesting a gold crop increases with each
                  achievement level.
                </p>
                <p className="text-xs text-white/90">
                  The base chance is{" "}
                  <span className="text-yellow-400 font-bold">
                    {BASE_GOLD_CROP_PERCENTAGE * 100}%
                  </span>
                  , and each achievement level increases it by{" "}
                  <span className="text-yellow-400 font-bold">
                    {BASE_GOLD_CROP_PERCENTAGE *
                      ACHIEVEMENTS_GOLD_MULTIPLIER *
                      100}
                    %
                  </span>
                  .
                </p>
                <Card className="bg-gradient-to-br from-[#6D4C2C] to-[#5B4120] rounded-lg border-none w-full mt-4">
                  <CardContent className="flex flex-row text-white/90 justify-between items-center p-4">
                    <div className="relative w-12 h-12">
                      <Image
                        src={`/images/crop/gold-${crop}.png`}
                        alt={`Gold ${crop}`}
                        fill
                      />
                    </div>
                    <p className="w-4/5 text-xs">
                      Your current chance to find a gold {crop} is{" "}
                      <span className="text-yellow-400 font-bold">
                        {goldCropChancePercentage * 100}%
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </InfoModal>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
