import Image from "next/image";

interface StatisticProps {
  title: string;
  image: string;
  value: string;
}

export const Statistic = ({ title, image, value }: StatisticProps) => {
  return (
    <div className="flex flex-col gap-1">
      <p className="flex flex-row gap-1 items-center text-[10px] font-bold text-[#f2a311]">
        <Image src={image} alt={title} width={24} height={24} />
        {title}
      </p>
      <p className="text-[10px] text-white/80">{value}</p>
    </div>
  );
};
