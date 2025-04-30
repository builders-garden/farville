import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface CountdownProps {
  date: Date;
  text: string;
  startsIn: boolean;
}

export const Countdown = ({ date, text, startsIn }: CountdownProps) => {
  const [timeBasedOnDate, setTimeBasedOnDate] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeBasedOnDate = () => {
      const now = new Date();
      const utcNow = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
      );
      const utcDate = Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
      );

      const diffMs = startsIn ? utcDate - utcNow : utcNow - utcDate;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeBasedOnDate({ hours, minutes, seconds });
    };

    calculateTimeBasedOnDate();
    const intervalId = setInterval(calculateTimeBasedOnDate, 1000);

    return () => clearInterval(intervalId);
  }, [date, startsIn]);

  return (
    <div className="bg-gradient-to-br from-[#8B5c3C] to-[#6d4c2c] rounded-xl p-2 xs:p-3 border border-[#ffa07a]/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 xs:gap-2 text-white/80">
          <Clock size={16} className="text-[#FFB938]" />
          <span className="text-[8px] xs:text-[9px]">{text}</span>
        </div>
        <div className="flex gap-1 text-white font-bold">
          <div className="bg-[#6d4c2c] px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md text-[10px] xs:text-xs min-w-[25px] xs:min-w-[30px] flex items-center justify-center">
            {timeBasedOnDate.hours.toString().padStart(2, "0")}
          </div>
          <span className="text-[#FFB938] flex items-center">:</span>
          <div className="bg-[#6d4c2c] px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md text-[10px] xs:text-xs min-w-[25px] xs:min-w-[30px] flex items-center justify-center">
            {timeBasedOnDate.minutes.toString().padStart(2, "0")}
          </div>
          <span className="text-[#FFB938] flex items-center">:</span>
          <div className="bg-[#6d4c2c] px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md text-[10px] xs:text-xs min-w-[25px] xs:min-w-[30px] flex items-center justify-center">
            {timeBasedOnDate.seconds.toString().padStart(2, "0")}
          </div>
        </div>
      </div>
    </div>
  );
};
