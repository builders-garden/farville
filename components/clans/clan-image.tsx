import Image from "next/image";

interface ClanImageProps {
  imageUrl: string | null;
  clanName?: string;
  size?: "sm" | "md" | "lg";
}

export function ClanImage({ imageUrl, clanName, size = "md" }: ClanImageProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const iconSizes = {
    sm: { width: 24, height: 24, className: "w-8 h-8" },
    md: { width: 28, height: 28, className: "w-12 h-12" },
    lg: { width: 32, height: 32, className: "w-16 h-16" },
  };

  const imageSizes = {
    sm: { width: 48, height: 48 },
    md: { width: 64, height: 64 },
    lg: { width: 80, height: 80 },
  };

  return (
    <div
      className={`${sizeClasses[size]} shrink-0 rounded-md border-2 border-[#8B5E3C] overflow-hidden bg-[#5A4129] flex items-center justify-center shadow-inner`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={clanName || "Clan Image"}
          width={imageSizes[size].width}
          height={imageSizes[size].height}
          className="w-full h-full object-cover"
        />
      ) : (
        <Image
          src="/images/icons/clans.png"
          alt="Feuds and Clans Icon"
          width={iconSizes[size].width}
          height={iconSizes[size].height}
          className={iconSizes[size].className}
        />
      )}
    </div>
  );
}
