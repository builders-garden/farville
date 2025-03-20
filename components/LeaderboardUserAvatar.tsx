import Image from "next/image";
import { OgBadge } from "./OgBadge";

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
  return (
    <div className="relative flex-none">
      <Image
        src={pfpUrl !== "" ? pfpUrl : "/images/profile/default-avatar.png"}
        alt={`${username ?? "user"}'s avatar`}
        className={`w-${size.width} h-${
          size.height
        } rounded-full object-cover border-${borderSize} ${
          isOgUser ? "border-[#179ef9]" : "border-[#FFB938]"
        }`}
        width={40}
        height={40}
      />
      {isOgUser && <OgBadge />}
    </div>
  );
}
