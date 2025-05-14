import { Tour } from "nextstepjs";

export const steps: Tour[] = [
  {
    tour: "mainTour",
    steps: [
      {
        icon: "🌱",
        title: "Pick a seed",
        content: (
            <p className="text-xs">
              Pick carrot seeds and start planting!
            </p>
        ),
        selector: "#carrot-seeds",
        side: "bottom-left" as const,
        showControls: false,
        showSkip: false,
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: "🌱",
        title: "Plant your seed",
        content: (
          <div className="flex flex-col gap-2">
            <p>Now click on the field to plant your first carrot.</p>
          </div>
        ),
        showControls: false,
        showSkip: false,
        selector: "#grid-cell-1-1",
        side: "top-left" as const,
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: "✨",
        title: "Pick a fertilizer",
        content: (
          <div className="flex flex-row">
            <p>Pick a fertilizer to boost your crop growth.</p>
          </div>
        ),
        selector: "#fertilizer",
        side: "bottom-left" as const,
        showControls: false,
        showSkip: false,
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: "✨",
        title: "Fertilize your seed",
        content: (
          <div className="flex flex-col gap-2">
            <p className="text-sm">
              Now fertilizer your carrot to speed up its growth time.
            </p>
          </div>
        ),
        selector: "#grid-cell-1-1",
        side: "top-left" as const,
        showControls: false,
        showSkip: false,
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: "🌾",
        title: "Harvest Your Crop",
        content: (
          <div className="flex flex-col gap-2">
            <p>When your carrot is ready, click on it to harvest it.</p>
          </div>
        ),
        selector: "#grid-cell-1-1",
        side: "top-left" as const,
        showControls: true,
        showSkip: true,
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: "🌾",
        title: "Sell your carrot!",
        content: (
          <div className="flex flex-col gap-2">
            <p>Visit the market and sell your carrot to earn coins.</p>
          </div>
        ),
        selector: "#market-toolbar-btn",
        side: "bottom-left" as const,
        showControls: true,
        showSkip: true,
        pointerPadding: 4,
        pointerRadius: 8,
      },
    ],
  },
  {
    tour: "marketplaceTour",
    steps: [
      {
        icon: "🏪",
        title: "Welcome to the Market",
        content: (
          <div className="flex flex-col gap-2">
            <p>
              Here you can buy <span className="text-emerald-300">seeds</span>,{" "}
              <span className="text-amber-300">perks</span>, and{" "}
              <span className="text-blue-300">expand your land</span> with new
              fields.
            </p>
          </div>
        ),
        showControls: true,
        showSkip: true,
      },
      {
        icon: "🚜",
        title: "Buy Seeds & Perks",
        content:
          "Stock up on seeds for planting and perks to boost your crop growth.",
        selector: "#market-buy",
        side: "bottom-left" as const,
        showControls: true,
        showSkip: true,
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: "💰",
        title: "Sell Your Harvest",
        content:
          "Trade your crops here to earn coins and grow your farm economy.",
        selector: "#market-sell",
        side: "bottom" as const,
        showControls: true,
        showSkip: true,
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: "🗺️",
        title: "Expand Your Farm",
        content:
          "Buy new fields to grow more crops. Unlock expansions as you level up!",
        selector: "#market-expansions",
        side: "bottom-right" as const,
        showControls: true,
        showSkip: true,
        pointerPadding: 4,
        pointerRadius: 8,
      },
    ],
  },
];
