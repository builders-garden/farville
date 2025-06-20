import { motion } from "framer-motion";
import Image from "next/image";

export type Tab = "members" | "quests" | "newcomers" | "chat";

interface MyClanTabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  pendingRequestsCount?: number;
  canManageRequests: boolean;
  hasUnfulfilledRequests?: boolean;
}

export default function MyClanTabs({
  activeTab,
  setActiveTab,
  pendingRequestsCount = 0,
  canManageRequests,
  hasUnfulfilledRequests = false,
}: MyClanTabsProps) {
  const tabs: {
    id: Tab;
    label: string;
    icon: string;
    count?: number;
  }[] = [
    {
      id: "members",
      label: "Members",
      icon: "/images/icons/farmer.png",
    },
    {
      id: "chat",
      label: "Chat",
      icon: "/images/icons/chat.png",
    },
    {
      id: "quests",
      label: "Quests",
      icon: "/images/icons/quests.png",
    },
    {
      id: "newcomers",
      label: "Joins",
      icon: "/images/icons/clan-members.png",
      count: pendingRequestsCount,
    },
  ];

  if (!canManageRequests) {
    // If user cannot manage requests, remove the "Joins" tab
    tabs.pop();
  }

  return (
    <div className={`grid grid-cols-${tabs.length} gap-2 my-2 w-full`}>
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setActiveTab(tab.id)}
          className={`px-2 xs:px-3 py-1 xs:py-1 rounded-lg flex items-center justify-center gap-1 xs:gap-1.5 transition-all duration-200 relative
                        ${
                          activeTab === tab.id
                            ? "bg-[#a66d36] text-white scale-105 shadow-lg"
                            : tab.id === "chat" && hasUnfulfilledRequests
                            ? "bg-[#A17449] text-white hover:bg-[#A17449]/80 shadow-lg shadow-[#A17449]/50"
                            : "bg-[#6d4c2c] text-white/70 hover:bg-[#6d4c2c]/50"
                        }`}
          whileHover={{ scale: activeTab === tab.id ? 1.05 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {tab.id === "chat" && hasUnfulfilledRequests && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FFD700] rounded-full" />
          )}
          <div className="flex items-center gap-1">
            <Image
              src={tab.icon}
              alt={`${tab.label} Icon`}
              width={40}
              height={40}
              className={`${
                tab.id === "quests"
                  ? "w-5 h-5"
                  : tab.id === "chat"
                  ? "w-6 h-6"
                  : "w-8 h-8"
              }`}
            />
            {tab.count !== undefined && tab.count > 0 && (
              <span className="inline-flex items-center justify-center bg-amber-500 text-[9px] rounded-full w-4 h-4 text-white">
                {tab.count > 9 ? "9+" : tab.count}
              </span>
            )}
          </div>
          {/* )} */}
        </motion.button>
      ))}
    </div>
  );
}
