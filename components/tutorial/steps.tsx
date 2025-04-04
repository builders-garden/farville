export const steps = [
  {
    tour: "mainTour",
    steps: [
      {
        icon: "👨🏻‍🌾",
        title: "Welcome, Farmer!",
        content: (
          <div className="flex flex-col gap-2">
            <p>Ready to grow your own farm?</p>
            <p>Let&apos;s begin your Farville journey!</p>
          </div>
        ),
        showControls: true,
      },
      {
        icon: "🚜",
        title: "Your Mission",
        content: (
          <div className="flex flex-col gap-2">
            <p>
              In Farville, your mission is to grow your farm by{" "}
              <span className="font-bold text-emerald-300">planting seeds</span>
              ,{" "}
              <span className="font-bold text-amber-300">harvesting crops</span>
              , and{" "}
              <span className="font-bold text-blue-300">
                selling your produce
              </span>
              .
            </p>
          </div>
        ),
        showControls: true,
        showSkip: true,
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: "🌱",
        title: "Plant Your Seeds",
        content: (
          <div className="flex flex-col gap-2">
            <p>Choose your seeds and plant them in the fields.</p>
            <p>
              You&apos;ve got 4 carrot seeds — why not get started with those?
            </p>
          </div>
        ),
        selector: "#seed-menu",
        side: "top" as const,
        showControls: true,
        showSkip: true,
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: "✨",
        title: "Speed Things Up",
        content: (
          <div className="flex flex-col gap-2">
            <p>Perks help your crops grow faster. Use them wisely!</p>
            <p>
              (Psst... we gave you 4 fertilizers to fast-track your first
              harvest. Scroll to find them!)
            </p>
          </div>
        ),
        selector: "#seed-menu",
        side: "top" as const,
        showControls: true,
        showSkip: true,
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: "💰",
        title: "Visit the Market",
        content: (
          <div className="flex flex-col gap-2 text-xs">
            <p>This is the Market — sell your crops here to earn coins 🪙.</p>
            <p>Use your coins to buy new seeds and powerful perks.</p>
          </div>
        ),
        selector: "#market-toolbar-btn",
        side: "top-left" as const,
        showControls: true,
        showSkip: true,
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: "🚜",
        title: "Let's Farm!",
        content: (
          <div className="flex flex-col gap-2">
            <p>You&apos;re all set. Time to get your hands dirty!</p>
            <p>
              Plant your first 4 carrot seeds and watch your farm come to life.
            </p>
            <p>Brum brum! 🚜💨</p>
          </div>
        ),
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
