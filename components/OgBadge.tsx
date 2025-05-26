interface OgBadgeProps {
  leading?: string;
  padding?: string;
}

export const OgBadge = ({ leading, padding }: OgBadgeProps) => {
  return (
    <div
      className={`absolute -bottom-1 -right-1 text-black/50
          bg-gradient-to-r from-[#179ef9] via-white/80 to-[#179ef9] text-[8px] font-bold ${
            padding ? `p-[${padding}]` : "px-1 py-0.5"
          }
          ${leading ?? ""}
          rounded-md shadow-[0_0_10px_rgba(23,158,249,0.5)]
          animate-[diamondPulse_2s_ease-in-out_infinite]
          [background-size:200%_200%]
          [animation:diamondShine_3s_linear_infinite]
          after:content-['']
          after:absolute after:inset-0
          after:bg-gradient-to-r after:from-transparent 
          after:via-white/5 after:to-transparent
          after:animate-[shine_1.5s_ease-in-out_infinite]
          overflow-hidden
          backdrop-blur-sm`}
    >
      OG
    </div>
  );
};
