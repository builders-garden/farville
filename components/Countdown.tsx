import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface CountdownProps {
  date: Date;
  text: string;
  border?: boolean;
}

export const Countdown = ({ date, text, border = false }: CountdownProps) => {
  const [timeBasedOnDate, setTimeBasedOnDate] = useState<{
    days: number;
    hours: number;
    minutes: number;
  }>({ days: 0, hours: 0, minutes: 0 });

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

      const diffMs = utcDate - utcNow;
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      setTimeBasedOnDate({ days, hours, minutes });
    };

    calculateTimeBasedOnDate();
    const intervalId = setInterval(calculateTimeBasedOnDate, 1000);

    return () => clearInterval(intervalId);
  }, [date]);

  return (
    <div
      className={`bg-gradient-to-br from-[#8B5c3C] to-[#6d4c2c] w-full rounded-xl p-2 xs:p-3 ${
        border && "border border-[#ffa07a]/20"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 xs:gap-2 text-white/80">
          <Clock size={16} className="text-[#FFB938]" />
          <span className="text-[8px] xs:text-[9px]">{text}</span>
        </div>
        <div className="flex gap-1 text-white font-bold">
          <div className="bg-[#6d4c2c] px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md text-[10px] xs:text-xs min-w-[25px] xs:min-w-[30px] flex items-center justify-center">
            {timeBasedOnDate.days.toString().padStart(2, "0")}
            <span className="text-[#FFB938]">d</span>
          </div>
          <div className="bg-[#6d4c2c] px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md text-[10px] xs:text-xs min-w-[25px] xs:min-w-[30px] flex items-center justify-center">
            {timeBasedOnDate.hours.toString().padStart(2, "0")}
            <span className="text-[#FFB938]">h</span>
          </div>
          <div className="bg-[#6d4c2c] px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-md text-[10px] xs:text-xs min-w-[25px] xs:min-w-[30px] flex items-center justify-center">
            {timeBasedOnDate.minutes.toString().padStart(2, "0")}
            <span className="text-[#FFB938]">m</span>
          </div>
        </div>
      </div>
    </div>
  );
};
