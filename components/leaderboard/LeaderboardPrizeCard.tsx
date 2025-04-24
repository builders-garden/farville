import Image from "next/image";
import { LEAGUE_PRIZES } from "./league-prizes";
import InfoModal from "../modals/InfoModal";

type PrizeConfig = {
  amount: string | number;
  icon?: string;
  unit?: string;
};

const PrizeDisplay = ({ prize }: { prize: PrizeConfig }) => (
  <div className="flex items-center gap-1">
    <span className="text-white font-bold text-[10px]">{prize.amount}</span>
    {prize.icon ? (
      <Image
        src={"/images" + prize.icon}
        alt="Prize"
        width={16}
        height={16}
        className="w-4 h-4"
      />
    ) : (
      <span className="text-white font-bold text-[10px]">{prize.unit}</span>
    )}
  </div>
);

const LEAGUE_NAMES = {
  3: "Gold",
  2: "Iron",
  1: "Wood",
} as const;

export function LeaderboardPrizeCard({
  leagueType,
  isModalOpen,
  onModalToggle,
}: {
  leagueType: 1 | 2 | 3;
  isModalOpen: boolean;
  onModalToggle: (isOpen: boolean) => void;
}) {
  const prizes = LEAGUE_PRIZES[leagueType];
  const places = ["first", "second", "third"] as const;

  return (
    <div className="bg-[#5c4121] rounded-lg p-2 xs:p-3 xs:pt-2 mb-3 xs:mb-4">
      <div className="flex items-center gap-1 xs:gap-2 mb-1">
        <span className="text-base xs:text-lg mb-1">🏆</span>
        <h3 className="text-white/90 text-xs xs:text-sm font-bold">Prizes</h3>
        <span className="ml-auto text-[#FFB938] text-[10px] xs:text-xs font-bold">
          {prizes.total}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {places.map((place, index) => (
          <div
            key={place}
            className="bg-[#6d4c2c] rounded-lg p-1.5 flex flex-col items-center"
          >
            <span className="text-[#FFB938] text-[8px] xs:text-[9px] mb-0.5 xs:mb-1">
              {index + 1}st
            </span>
            <PrizeDisplay prize={prizes[place]} />
          </div>
        ))}
      </div>

      <button
        onClick={() => onModalToggle(true)}
        className="w-full mt-1.5 xs:mt-3 text-[8px] xs:text-[9px] text-white/70 hover:text-white/90 
                 flex items-center justify-center gap-0.5 xs:gap-1"
      >
        View full prize breakdown
        <span className="text-[10px] xs:text-xs">→</span>
      </button>

      {isModalOpen && (
        <InfoModal
          title={`${LEAGUE_NAMES[leagueType]} League`}
          onCancel={() => onModalToggle(false)}
          icon={`/images/leagues/${leagueType}.png`}
        >
          <div className="flex flex-col gap-4 my-4 text-white/90 text-[10px]">
            <p>Harvest, donate and complete quests ⚔️</p>
            <p>
              Compete against other players in your league to earn rewards every
              week!
            </p>
            <div>
              {prizes.description}
              <ul className="list-disc list-inside mt-4 space-y-2">
                {prizes.breakdown.map(({ range, prize }) => (
                  <li key={range}>
                    {range}: {prize.amount}
                    {prize.icon ? (
                      <Image
                        src={"/images" + prize.icon}
                        alt="Prize"
                        width={15}
                        height={15}
                        className="inline-block ml-1 w-5 h-5"
                      />
                    ) : (
                      ` ${prize.unit}`
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4">
              Good luck and have fun! <br />
              Brum Brum <span className="text-xl">🚜💨</span>
            </p>
          </div>
        </InfoModal>
      )}
    </div>
  );
}
