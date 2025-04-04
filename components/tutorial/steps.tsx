export const steps = [
  {
    tour: "mainTour",
    steps: [
      {
        icon: "👩‍🌾",
        title: "Welcome Farmer",
        content: "Let's get started with your Farville journey!",
        showControls: true,
      },
      {
        icon: "🚜",
        title: "Your Goal",
        content: (
          <div className="flex flex-col gap-2">
            <p>
              In Farville your goal is to grow your farm by{" "}
              <span className="font-bold text-emerald-300">planting seeds</span>
              , <span className="font-bold text-amber-300">harvesting</span> and{" "}
              <span className="font-bold text-blue-300">selling crops</span>.
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
        title: "Seeds",
        content: (
          <div className="flex flex-col gap-2">
            <p>
              You can select a seed type and then plant them in your fields.
            </p>
            <p>You have 4 carrots seeds, why not plant them in your fields?</p>
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
        title: "Perks",
        content: (
          <div className="flex flex-col gap-2">
            <p>Farm faster! Use perks to make crops grow faster.</p>
            <p>
              (psst we gave you 4 fertilizers to instantly harvest your first
              crops. Scroll to find them!)
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
        title: "Sell crops",
        content: (
          <div className="flex flex-col gap-2 text-xs">
            <p>
              Here is the Market. The place where you can sell your crops for
              coins 🪙.
            </p>
            <p>
              Using coins you can buy new seeds and perks to keep growing your
              farm.
            </p>
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
        title: "Farm Time!",
        content: (
          <div className="flex flex-col gap-2">
            <p>Now you know the basics, it&apos;s time to start farming!</p>
            <p>Plant your first 4 carrot seeds.</p>
            <p>Brum brum! 🚜💨</p>
          </div>
        ),
        showControls: true,
        showSkip: true,
        pointerPadding: 4,
        pointerRadius: 8,
      },
      // More steps...
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
              <span className="text-amber-300">perks</span> and{" "}
              <span className="text-blue-300">expand your farm</span> by buying
              new fields.
            </p>
          </div>
        ),
        showControls: true,
        showSkip: true,
      },
      {
        icon: "🚜",
        title: "Buy Seeds and Perks",
        content:
          "Here you can buy seeds to plant in your fields and perks to help them grow faster.",
        selector: "#market-buy",
        side: "bottom-left" as const,
        showControls: true,
        showSkip: true,
        pointerPadding: 4,
        pointerRadius: 8,
      },
      {
        icon: "💰",
        title: "Sell Crops",
        content: "Here you can sell your crops to earn coins.",
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
          "Here you can expand your farm by buying new fields whenever you reach a specific level.",
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
