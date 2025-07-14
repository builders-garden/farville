import { motion } from "framer-motion";

export type QuestTab = "active" | "completed";

interface ClanQuestTabsProps {
  activeTab: QuestTab;
  setActiveTab: (tab: QuestTab) => void;
  hasCompletedQuests: boolean;
}

export default function ClanQuestTabs({
  activeTab,
  setActiveTab,
  hasCompletedQuests,
}: ClanQuestTabsProps) {
  const tabs: {
    id: QuestTab;
    label: string;
  }[] = [
    {
      id: "active",
      label: "Active",
    },
  ];

  // Add completed tab only if there are completed quests
  if (hasCompletedQuests) {
    tabs.push({
      id: "completed",
      label: "Completed",
    });
  }

  return (
    <div className="flex gap-1 mb-4">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setActiveTab(tab.id)}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
            activeTab === tab.id
              ? "bg-[#FFB938] text-[#7E4E31] shadow-md"
              : "bg-[#6d4c2c] text-white/70 hover:bg-[#6d4c2c]/80 hover:text-white/90"
          }`}
          whileHover={{ scale: activeTab === tab.id ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {tab.label}
        </motion.button>
      ))}
    </div>
  );
}
