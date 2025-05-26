import Image from "next/image";
import { OgBadge } from "../OgBadge";

interface LeaderboardUserAvatarProps {
  pfpUrl: string;
  username?: string;
  isOgUser?: boolean;
  size?: {
    width: number;
    height: number;
  };
  borderSize?: number;
}

export function LeaderboardUserAvatar({
  pfpUrl,
  username,
  isOgUser = false,
  size = { width: 10, height: 10 },
  borderSize = 2,
}: LeaderboardUserAvatarProps) {
  const isSmall = size.width < 10 || size.height < 10;
  return (
    <div className="relative flex-none">
      <Image
        src={pfpUrl !== "" ? pfpUrl : "/images/profile/default-avatar.png"}
        alt={`${username ?? "user"}'s avatar`}
        className={`w-${size.width - 2} h-${size.height - 2} xs:w-${
          size.width
        } xs:h-${size.height} rounded-full object-cover outline outline-${
          borderSize - 1
        } xs:outline-${borderSize} ${
          isOgUser ? "outline-[#179ef9]" : "outline-[#FFB938]"
        }`}
        width={40}
        height={40}
      />
      {isOgUser && (
        <OgBadge
          leading={isSmall ? "leading-none" : undefined}
          padding={isSmall ? "0.15rem" : undefined}
        />
      )}
    </div>
  );
}
