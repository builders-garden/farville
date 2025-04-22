import { motion } from "framer-motion";

export type Tab = "buy" | "sell" | "expansions";

interface MarketplaceTabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export default function MarketplaceTabs({
  activeTab,
  setActiveTab,
}: MarketplaceTabsProps) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "buy", label: "Buy", icon: "🌱" },
    { id: "sell", label: "Sell", icon: "🌾" },
    { id: "expansions", label: "Expand", icon: "🗺️" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-2 flex-shrink-0">
      {tabs.map((tab, index) => (
        <motion.button
          key={tab.id}
          id={`market-${tab.id}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => setActiveTab(tab.id)}
          className={`px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 w-full
            ${
              activeTab === tab.id
                ? " text-yellow-400 scale-105"
                : "text-white/70 hover:bg-[#6d4c2c]/50"
            }`}
          whileHover={{ scale: activeTab === tab.id ? 1.05 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.span
            animate={{ rotate: activeTab === tab.id ? [0, -5, 5, 0] : 0 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className="mb-1"
          >
            {tab.icon}
          </motion.span>
          <span className="text-[10px]">{tab.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
