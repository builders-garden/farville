import { ClanList } from "../clan-list";

interface ClanTabProps {
  userHasClan: boolean;
}

export const ClanTab: React.FC<ClanTabProps> = ({ userHasClan }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      {userHasClan ? (
        <p className="text-white/90">You are part of a clan!</p>
      ) : (
        <ClanList />
      )}
    </div>
  );
};
