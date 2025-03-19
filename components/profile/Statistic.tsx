import Image from "next/image";

interface StatisticProps {
  title: string;
  image: string;
  value: string;
}

export const Statistic = ({ title, image, value }: StatisticProps) => {
  return (
    <div className="flex flex-row justify-between items-center">
      <p className="flex flex-row gap-1 items-center text-xs font-bold text-[#f2a311]">
        <Image src={image} alt={title} width={24} height={24} />
        {title}
      </p>
      <p className="text-xs text-white/80">{value}</p>
    </div>
  );
};
