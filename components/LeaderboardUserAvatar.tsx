import Image from "next/image";
import { OgBadge } from "./OgBadge";

interface LeaderboardUserAvatarProps {
  pfpUrl: string;
  username?: string;
  isOgUser?: boolean;
}

export function LeaderboardUserAvatar({
  pfpUrl,
  username,
  isOgUser = false,
}: LeaderboardUserAvatarProps) {
  return (
    <div className="relative flex-none">
      <Image
        src={pfpUrl}
        alt={`${username ?? "user"}'s avatar`}
        className={`w-10 h-10 rounded-full object-cover border-2 ${
          isOgUser ? "border-[#179ef9]" : "border-[#FFB938]"
        }`}
        width={40}
        height={40}
      />
      {isOgUser && <OgBadge />}
    </div>
  );
}
