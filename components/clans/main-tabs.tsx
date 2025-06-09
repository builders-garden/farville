import { motion } from "framer-motion";

export type Tab = "clan" | "search" | "leaderboard";

interface MainClanTabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export default function MainClanTabs({
  activeTab,
  setActiveTab,
}: MainClanTabsProps) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
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
      id: "leaderboard",
      label: "Season",
      icon: "📊", // Replace with your actual icon component
    },
  ];

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
          {/* {activeTab === tab.id && ( */}
          <span className="text-[10px] xs:text-xs font-medium">
            {tab.label}
          </span>
          {/* )} */}
        </motion.button>
      ))}
    </div>
  );
}
