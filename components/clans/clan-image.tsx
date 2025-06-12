import Image from "next/image";

interface ClanImageProps {
  imageUrl: string | null;
  clanName?: string;
}

export function ClanImage({ imageUrl, clanName }: ClanImageProps) {
  return (
    <div className="w-16 h-16 shrink-0 rounded-md border-2 border-[#8B5E3C] overflow-hidden mr-3 bg-[#5A4129] flex items-center justify-center shadow-inner">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={clanName || "Clan Image"}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      ) : (
        <Image
          src="/images/icons/clans.png"
          alt="Feuds and Clans Icon"
          width={28}
          height={28}
          className="w-12 h-12"
        />
      )}
    </div>
  );
}
