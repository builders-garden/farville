import { Lock, Unlock } from "lucide-react";

interface ClanStatusProps {
  isPublic: boolean;
  short?: boolean;
}

export function ClanStatus({ isPublic, short = false }: ClanStatusProps) {
  return (
    <div
      className={`flex flex-row items-center text-xs text-white/70 rounded-lg px-2 py-1 gap-2 ${
        isPublic ? "bg-green-700" : "bg-yellow-600"
      }`}
    >
      {isPublic ? <Unlock size={14} /> : <Lock size={14} />}
      {!short && (
        <span className="text-white/90">{isPublic ? "Public" : "Private"}</span>
      )}
    </div>
  );
}
