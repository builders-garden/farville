import { motion } from "framer-motion";

export type Tab = "clan" | "search" | "outgoing" | "leaderboard";

interface MainClanTabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  userHasClan: boolean;
  outgoingRequestsCount?: number;
}

export default function MainClanTabs({
  activeTab,
  setActiveTab,
  userHasClan,
  outgoingRequestsCount = 0,
}: MainClanTabsProps) {
  const allTabs: { id: Tab; label: string; icon: string; count?: number }[] = [
    {
      id: "clan",
      label: "Clan",
      icon: "🏰", // Replace with your actual icon component
    },
    {
      id: "search",
      label: "Search",
      icon: "🔍", // Replace with your actual icon component
    },
    {
      id: "outgoing",
      label: "Requests",
      icon: "📝", // Replace with your actual icon component
      count: outgoingRequestsCount,
    },
    {
      id: "leaderboard",
      label: "Season",
      icon: "📊", // Replace with your actual icon component
    },
  ];

  // Filter out the clan tab if user doesn't have a clan
  // Show outgoing requests tab only if user doesn't have a clan
  const tabs = allTabs.filter(
    (tab) =>
      (userHasClan && tab.id !== "outgoing") ||
      (!userHasClan && tab.id !== "clan")
  );

  return (
    <div className="grid grid-cols-3 gap-2 my-4">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setActiveTab(tab.id)}
          className={`px-2 xs:px-3 py-1 xs:py-1 rounded-lg flex items-center justify-center gap-1 xs:gap-1.5 transition-all duration-200
                        ${
                          activeTab === tab.id
                            ? "bg-[#6d4c2c] text-white scale-105 shadow-lg"
                            : "text-white/70 hover:bg-[#6d4c2c]/50"
                        }`}
          whileHover={{ scale: activeTab === tab.id ? 1.05 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-1">
            <motion.span
              animate={{
                rotate: activeTab === tab.id ? [0, -5, 5, 0] : 0,
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              className="mb-1"
            >
              {tab.icon}
            </motion.span>
            <span className="text-[10px] xs:text-xs font-medium">
              {tab.label}
            </span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="inline-flex items-center justify-center bg-amber-500 text-[9px] rounded-full w-4 h-4 text-white">
                {tab.count > 9 ? "9+" : tab.count}
              </span>
            )}
          </div>
        </motion.button>
      ))}
    </div>
  );
}
