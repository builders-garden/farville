import { CropType, ExpansionCost } from "@/lib/types/game";

// Add EXPANSION_COSTS to the context file
export const EXPANSION_COSTS: ExpansionCost[] = [
  { coins: 100, level: 2, nextSize: { width: 3, height: 3 } },
  { coins: 500, level: 5, nextSize: { width: 4, height: 4 } },
  { coins: 1000, level: 10, nextSize: { width: 5, height: 5 } },
  { coins: 2500, level: 15, nextSize: { width: 6, height: 6 } },
];

export const CROPS: {
  name: string;
  type: CropType;
  icon: string;
  seedIcon: string;
  sellPrice: number;
  buyPrice: number;
  levelRequirement: number;
  xp: number;
  imageUrl: string;
}[] = [
  {
    name: "Carrot",
    type: CropType.Carrot,
    sellPrice: 8,
    buyPrice: 5,
    icon: "/images/crop/carrot.png",
    seedIcon: "/images/seed/seed_carrot.png",
    levelRequirement: 1,
    xp: 2,
    imageUrl: "/images/crops/carrot.png",
  },
  {
    name: "Pumpkin",
    type: CropType.Pumpkin,
    sellPrice: 25,
    buyPrice: 15,
    icon: "/images/crop/pumpkin.png",
    seedIcon: "/images/seed/seed_pumpkin.png",
    levelRequirement: 3,
    xp: 6,
    imageUrl: "/images/crops/pumpkin.png",
  },
  {
    name: "Tomato",
    type: CropType.Tomato,
    sellPrice: 50,
    buyPrice: 30,
    icon: "/images/crop/tomato.png",
    seedIcon: "/images/seed/seed_tomato.png",
    levelRequirement: 5,
    xp: 12,
    imageUrl: "/images/crops/tomato.png",
  },
  {
    name: "Potato",
    type: CropType.Potato,
    sellPrice: 100,
    buyPrice: 60,
    icon: "/images/crop/potato.png",
    seedIcon: "/images/seed/seed_potato.png",
    levelRequirement: 8,
    xp: 25,
    imageUrl: "/images/crops/potato.png",
  },
];

export interface CropData {
  deathTime: number;
  growthTime: number;
  rewardXP: number;
  power: number;
  tier: string;
  id: number;
  goldId: number;
}

export const millisecondsInHour = 3600000; // env.NEXT_PUBLIC_IS_TEST_MODE ? 1000 : 3600000;

export const CROP_DATA: { [key: string]: CropData } = {
  wheat: {
    growthTime: 6 * millisecondsInHour, // 6h in milliseconds
    deathTime: 3 * millisecondsInHour, // 3h in milliseconds
    rewardXP: 14,
    power: 1.4,
    tier: "C",
    id: 17,
    goldId: 31,
  },
  carrot: {
    growthTime: 4 * millisecondsInHour, // 4h
    deathTime: 3.3 * millisecondsInHour, // 3.3h
    rewardXP: 8,
    power: 1.2,
    tier: "C",
    id: 5,
    goldId: 30,
  },
  radish: {
    growthTime: 6 * millisecondsInHour, // 6h
    deathTime: 3.6 * millisecondsInHour, // 3.6h
    rewardXP: 14,
    power: 1.4,
    tier: "C",
    id: 18,
    goldId: 41,
  },
  lettuce: {
    growthTime: 10 * millisecondsInHour, // 10h
    deathTime: 6 * millisecondsInHour, // 6h
    rewardXP: 25,
    power: 3,
    tier: "B",
    id: 19,
    goldId: 34,
  },
  potato: {
    growthTime: 12 * millisecondsInHour, // 12h
    deathTime: 7.8 * millisecondsInHour, // 7.8h
    rewardXP: 30,
    power: 3,
    tier: "B",
    id: 8,
    goldId: 35,
  },
  corn: {
    growthTime: 12 * millisecondsInHour, // 12h
    deathTime: 8.4 * millisecondsInHour, // 8.4h
    rewardXP: 32,
    power: 3,
    tier: "B",
    id: 20,
    goldId: 32,
  },
  eggplant: {
    growthTime: 15 * millisecondsInHour, // 16h
    deathTime: 12 * millisecondsInHour, // 12h
    rewardXP: 40,
    power: 4.2,
    tier: "A",
    id: 21,
    goldId: 33,
  },
  tomato: {
    growthTime: 16 * millisecondsInHour, // 16h
    deathTime: 12.8 * millisecondsInHour, // 12.8h
    rewardXP: 45,
    power: 5,
    tier: "A",
    id: 7,
    goldId: 36,
  },
  strawberry: {
    growthTime: 24 * millisecondsInHour, // 24h
    deathTime: 19.2 * millisecondsInHour, // 19.2h
    rewardXP: 55,
    power: 4.8,
    tier: "A",
    id: 22,
    goldId: 40,
  },
  watermelon: {
    growthTime: 36 * millisecondsInHour, // 36h
    deathTime: 32.4 * millisecondsInHour, // 32.4h
    rewardXP: 120,
    power: 30,
    tier: "S",
    id: 23,
    goldId: 39,
  },
  pumpkin: {
    growthTime: 48 * millisecondsInHour, // 48h
    deathTime: 48 * millisecondsInHour, // 48h
    rewardXP: 165,
    power: 30,
    tier: "S",
    id: 6,
    goldId: 38,
  },
};

export const LEVEL_XP_THRESHOLDS = [
  0, // Level 1
  150, // Level 2
  650, // Level 3
  1200, // Level 4
  2000, // Level 5
  3200, // Level 6
  4500, // Level 7
  7500, // Level 8
  11000, // Level 9
  16000, // Level 10
  23000, // Level 11
  32000, // Level 12
  44000, // Level 13
  60000, // Level 14
  81000, // Level 15
  108000, // Level 16
  145000, // Level 17
  190000, // Level 18
  250000, // Level 19
  330000, // Level 20
];

export const LEVEL_REWARDS = [
  {
    // level 1
    coins: 0,
  },
  {
    // level 2
    coins: 50,
  },
  {
    // level 3
    coins: 100,
  },
  {
    // level 4
    coins: 150,
  },
  {
    // level 5
    coins: 200,
  },
  {
    // level 6
    coins: 250,
  },
  {
    // level 7
    coins: 300,
  },
  {
    // level 8
    coins: 400,
  },
  {
    // level 9
    coins: 500,
  },
  {
    // level 10
    coins: 500,
  },
  {
    // level 11
    coins: 600,
  },
  {
    // level 12
    coins: 700,
  },
  {
    // level 13
    coins: 800,
  },
  {
    // level 14
    coins: 900,
  },
  {
    // level 15
    coins: 1000,
  },
  {
    // level 16
    coins: 1200,
  },
  {
    // level 17
    coins: 1300,
  },
  {
    // level 18
    coins: 1500,
  },
  {
    // level 19
    coins: 2000,
  },
  {
    // level 20
    coins: 3000,
  },
];

export const SPEED_BOOST: {
  [key: string]: {
    boost: number;
    duration: number;
    applyTo: CropType[];
    color: string;
  };
} = {
  nitrogen: {
    boost: 1.25,
    duration: 7200000, // 2 hours
    applyTo: [CropType.Carrot, CropType.Wheat, CropType.Radish],
    color: "#87F6DE",
  },
  potassium: {
    boost: 1.5,
    duration: 7200000, // 2 hours
    applyTo: [
      CropType.Lettuce,
      CropType.Tomato,
      CropType.Potato,
      CropType.Corn,
      CropType.Eggplant,
      CropType.Tomato,
    ],
    color: "#A884F3",
  },
  phosphorus: {
    boost: 2,
    duration: 7200000, // 2 hours
    applyTo: [CropType.Strawberry, CropType.Watermelon, CropType.Pumpkin],
    color: "#ffc596",
  },
};

export const MONTHLY_REWARDS = [
  {
    day: 1,
    rewards: [
      { itemId: 5, quantity: 2 },
      { itemId: 19, quantity: 2 },
      { itemId: 21, quantity: 2 },
    ],
  },
  {
    day: 2,
    rewards: [
      { itemId: 18, quantity: 2 },
      { itemId: 8, quantity: 2 },
      { itemId: 7, quantity: 2 },
    ],
  },
  {
    day: 3,
    rewards: [
      { itemId: 17, quantity: 2 },
      { itemId: 20, quantity: 2 },
      { itemId: 22, quantity: 2 },
    ],
  },
  {
    day: 4,
    rewards: [
      { itemId: 5, quantity: 2 },
      { itemId: 19, quantity: 2 },
      { itemId: 21, quantity: 2 },
    ],
  },
  {
    day: 5,
    rewards: [
      { itemId: 18, quantity: 2 },
      { itemId: 8, quantity: 2 },
      { itemId: 7, quantity: 2 },
    ],
  },
  {
    day: 6,
    rewards: [
      { itemId: 17, quantity: 2 },
      { itemId: 20, quantity: 2 },
      { itemId: 22, quantity: 2 },
    ],
  },
  {
    day: 7,
    rewards: [
      { itemId: 23, quantity: 2 },
      { itemId: 26, quantity: 2 },
    ],
  },
  {
    day: 8,
    rewards: [
      { itemId: 5, quantity: 4 },
      { itemId: 19, quantity: 4 },
      { itemId: 21, quantity: 4 },
    ],
  },
  {
    day: 9,
    rewards: [
      { itemId: 18, quantity: 4 },
      { itemId: 8, quantity: 4 },
      { itemId: 7, quantity: 4 },
    ],
  },
  {
    day: 10,
    rewards: [
      { itemId: 17, quantity: 4 },
      { itemId: 20, quantity: 4 },
      { itemId: 22, quantity: 4 },
    ],
  },
  {
    day: 11,
    rewards: [
      { itemId: 5, quantity: 4 },
      { itemId: 19, quantity: 4 },
      { itemId: 21, quantity: 4 },
    ],
  },
  {
    day: 12,
    rewards: [
      { itemId: 18, quantity: 4 },
      { itemId: 8, quantity: 4 },
      { itemId: 7, quantity: 4 },
    ],
  },
  {
    day: 13,
    rewards: [
      { itemId: 17, quantity: 4 },
      { itemId: 20, quantity: 4 },
      { itemId: 22, quantity: 4 },
    ],
  },
  {
    day: 14,
    rewards: [
      { itemId: 28, quantity: 4 },
      { itemId: 27, quantity: 4 },
    ],
  },
  {
    day: 15,
    rewards: [
      { itemId: 5, quantity: 6 },
      { itemId: 19, quantity: 6 },
      { itemId: 21, quantity: 6 },
    ],
  },
  {
    day: 16,
    rewards: [
      { itemId: 18, quantity: 6 },
      { itemId: 8, quantity: 6 },
      { itemId: 7, quantity: 6 },
    ],
  },
  {
    day: 17,
    rewards: [
      { itemId: 17, quantity: 6 },
      { itemId: 20, quantity: 6 },
      { itemId: 22, quantity: 6 },
    ],
  },
  {
    day: 18,
    rewards: [
      { itemId: 5, quantity: 6 },
      { itemId: 19, quantity: 6 },
      { itemId: 21, quantity: 6 },
    ],
  },
  {
    day: 19,
    rewards: [
      { itemId: 18, quantity: 6 },
      { itemId: 8, quantity: 6 },
      { itemId: 7, quantity: 6 },
    ],
  },
  {
    day: 20,
    rewards: [
      { itemId: 17, quantity: 6 },
      { itemId: 20, quantity: 6 },
      { itemId: 22, quantity: 6 },
    ],
  },
  {
    day: 21,
    rewards: [
      { itemId: 23, quantity: 2 },
      { itemId: 6, quantity: 1 },
    ],
  },
  {
    day: 22,
    rewards: [
      { itemId: 5, quantity: 8 },
      { itemId: 19, quantity: 8 },
      { itemId: 21, quantity: 8 },
    ],
  },
  {
    day: 23,
    rewards: [
      { itemId: 18, quantity: 8 },
      { itemId: 8, quantity: 8 },
      { itemId: 7, quantity: 8 },
    ],
  },
  {
    day: 24,
    rewards: [
      { itemId: 17, quantity: 8 },
      { itemId: 20, quantity: 8 },
      { itemId: 22, quantity: 8 },
    ],
  },
  {
    day: 25,
    rewards: [
      { itemId: 5, quantity: 8 },
      { itemId: 19, quantity: 8 },
      { itemId: 21, quantity: 8 },
    ],
  },
  {
    day: 26,
    rewards: [
      { itemId: 18, quantity: 8 },
      { itemId: 8, quantity: 8 },
      { itemId: 7, quantity: 8 },
    ],
  },
  {
    day: 27,
    rewards: [
      { itemId: 17, quantity: 8 },
      { itemId: 20, quantity: 8 },
      { itemId: 22, quantity: 8 },
    ],
  },
  {
    day: 28,
    rewards: [{ itemId: 9, quantity: 5 }],
  },
];

export const MAX_FROSTS_QUANTITY = 2;

export const FIRST_FROST_QUANTITY = 1;

export const FROST_COST = 10000;

export const ACHIEVEMENTS_THRESHOLDS = [
  {
    crop: CropType.Carrot,
    thresholds: [3600, 10800, 36000, 130000],
    titles: [
      "Carrot Rookie",
      "Bugs Bunny",
      "24 Carrot Gold",
      "Carrot Overlord",
    ],
  },
  {
    crop: CropType.Wheat,
    thresholds: [2500, 7500, 25000, 90000],
    titles: ["Wheat Sprout", "Bread Baker", "Flour King", "Bread Baron"],
  },
  {
    crop: CropType.Radish,
    thresholds: [2500, 7500, 25000, 90000],
    titles: ["Radish Rookie", "Rad Warrior", "Radler Drinker", "Crimson Root"],
  },
  {
    crop: CropType.Lettuce,
    thresholds: [1600, 5000, 16000, 60000],
    titles: [
      "Lettuce Start",
      "Salad Maker",
      "Caesar's Chosen",
      "The Green Giant",
    ],
  },
  {
    crop: CropType.Potato,
    thresholds: [1400, 4100, 14000, 50000],
    titles: ["Small Fry", "Mr. Potato", "Couch King", "Throne Potato"],
  },
  {
    crop: CropType.Corn,
    thresholds: [1400, 4200, 14000, 50000],
    titles: ["Corn Kid", "Captain Kernel", "Pop Star", "Cornqueror"],
  },
  {
    crop: CropType.Eggplant,
    thresholds: [1100, 3300, 11100, 40000],
    titles: [
      "Lil Planty",
      "Violet Vanguard",
      "Purple Reign",
      "Eggcelent Emperor",
    ],
  },
  {
    crop: CropType.Tomato,
    thresholds: [1000, 3000, 10200, 37000],
    titles: ["Tomato Newbie", "Sauce Boss", "Ketchup King", "Sanguine Monarch"],
  },
  {
    crop: CropType.Strawberry,
    thresholds: [800, 2400, 8100, 30000],
    titles: ["Berry Beginner", "Jam Lord", "Berrylicious", "Berry Potter"],
  },
  {
    crop: CropType.Watermelon,
    thresholds: [550, 1600, 5400, 20000],
    titles: [
      "Melon Apprentice",
      "Seed Spitter",
      "Lord of the Rinds",
      "Melon Musk",
    ],
  },
  {
    crop: CropType.Pumpkin,
    thresholds: [400, 1200, 4000, 15000],
    titles: [
      "Pumpkin Pie",
      "Great Pumpkin",
      "Jack O'Lantern",
      "Jack Skellington",
    ],
  },
];

export const GAME_ITEMS = [
  {
    id: 1,
    name: "Carrot Seeds",
    description: NaN,
    icon: "/seed/seed_carrot.png",
    category: "seed",
    buyPrice: 5.0,
    sellPrice: NaN,
    createdAt: "2025-01-02 16:25:42.524846+00",
    slug: "carrot-seeds",
  },
  {
    id: 2,
    name: "Pumpkin Seeds",
    description: NaN,
    icon: "/seed/seed_pumpkin.png",
    category: "seed",
    buyPrice: 100.0,
    sellPrice: NaN,
    createdAt: "2025-01-02 16:26:38.020347+00",
    slug: "pumpkin-seeds",
  },
  {
    id: 3,
    name: "Tomato Seeds",
    description: NaN,
    icon: "/seed/seed_tomato.png",
    category: "seed",
    buyPrice: 30.0,
    sellPrice: NaN,
    createdAt: "2025-01-02 16:27:28.446967+00",
    slug: "tomato-seeds",
  },
  {
    id: 4,
    name: "Potato Seeds",
    description: NaN,
    icon: "/seed/seed_potato.png",
    category: "seed",
    buyPrice: 60.0,
    sellPrice: NaN,
    createdAt: "2025-01-02 16:28:44.43125+00",
    slug: "potato-seeds",
  },
  {
    id: 5,
    name: "Carrots",
    description: NaN,
    icon: "/crop/carrot.png",
    category: "crop",
    buyPrice: NaN,
    sellPrice: 8.0,
    createdAt: "2025-01-02 16:29:31.823783+00",
    slug: "carrot",
  },
  {
    id: 6,
    name: "Pumpkins",
    description: NaN,
    icon: "/crop/pumpkin.png",
    category: "crop",
    buyPrice: NaN,
    sellPrice: 250.0,
    createdAt: "2025-01-02 16:30:04.870166+00",
    slug: "pumpkin",
  },
  {
    id: 7,
    name: "Tomatoes",
    description: NaN,
    icon: "/crop/tomato.png",
    category: "crop",
    buyPrice: NaN,
    sellPrice: 50.0,
    createdAt: "2025-01-02 16:30:37.279237+00",
    slug: "tomato",
  },
  {
    id: 8,
    name: "Potatoes",
    description: NaN,
    icon: "/crop/potato.png",
    category: "crop",
    buyPrice: NaN,
    sellPrice: 100.0,
    createdAt: "2025-01-02 16:31:18.249899+00",
    slug: "potato",
  },
  {
    id: 9,
    name: "Fertilizer",
    description: "Instantly grows one crop to full maturity",
    icon: "/perks/fertilizer.png",
    category: "perk",
    buyPrice: 300.0,
    sellPrice: NaN,
    createdAt: "2025-01-02 16:32:15.251416+00",
    slug: "fertilizer",
  },
  {
    id: 10,
    name: "Wheat Seeds",
    description: NaN,
    icon: "/seed/seed_wheat.png",
    category: "seed",
    buyPrice: 10.0,
    sellPrice: NaN,
    createdAt: "2025-01-07 11:01:14.68461+00",
    slug: "wheat-seeds",
  },
  {
    id: 11,
    name: "Radish Seeds",
    description: NaN,
    icon: "/seed/seed_radish.png",
    category: "seed",
    buyPrice: 13.0,
    sellPrice: NaN,
    createdAt: "2025-01-07 11:06:02.262885+00",
    slug: "radish-seeds",
  },
  {
    id: 12,
    name: "Lettuce Seeds",
    description: NaN,
    icon: "/seed/seed_lettuce.png",
    category: "seed",
    buyPrice: 15.0,
    sellPrice: NaN,
    createdAt: "2025-01-07 11:06:55.106519+00",
    slug: "lettuce-seeds",
  },
  {
    id: 13,
    name: "Corn Seeds",
    description: NaN,
    icon: "/seed/seed_corn.png",
    category: "seed",
    buyPrice: 24.0,
    sellPrice: NaN,
    createdAt: "2025-01-07 11:07:41.249993+00",
    slug: "corn-seeds",
  },
  {
    id: 14,
    name: "Eggplant Seeds",
    description: NaN,
    icon: "/seed/seed_eggplant.png",
    category: "seed",
    buyPrice: 28.0,
    sellPrice: NaN,
    createdAt: "2025-01-07 11:08:41.612077+00",
    slug: "eggplant-seeds",
  },
  {
    id: 15,
    name: "Strawberry Seeds",
    description: NaN,
    icon: "/seed/seed_strawberry.png",
    category: "seed",
    buyPrice: 35.0,
    sellPrice: NaN,
    createdAt: "2025-01-07 11:09:27.04067+00",
    slug: "strawberry-seeds",
  },
  {
    id: 16,
    name: "Watermelon Seeds",
    description: NaN,
    icon: "/seed/seed_watermelon.png",
    category: "seed",
    buyPrice: 80.0,
    sellPrice: NaN,
    createdAt: "2025-01-07 11:10:40.532218+00",
    slug: "watermelon-seeds",
  },
  {
    id: 17,
    name: "Wheat",
    description: NaN,
    icon: "/crop/wheat.png",
    category: "crop",
    buyPrice: NaN,
    sellPrice: 15.0,
    createdAt: "2025-01-07 12:10:41.581916+00",
    slug: "wheat",
  },
  {
    id: 18,
    name: "Radish",
    description: NaN,
    icon: "/crop/radish.png",
    category: "crop",
    buyPrice: NaN,
    sellPrice: 13.0,
    createdAt: "2025-01-07 12:11:06.176445+00",
    slug: "radish",
  },
  {
    id: 19,
    name: "Lettuce",
    description: NaN,
    icon: "/crop/lettuce.png",
    category: "crop",
    buyPrice: NaN,
    sellPrice: 18.0,
    createdAt: "2025-01-07 12:11:24.326165+00",
    slug: "lettuce",
  },
  {
    id: 20,
    name: "Corn",
    description: NaN,
    icon: "/crop/corn.png",
    category: "crop",
    buyPrice: NaN,
    sellPrice: 40.0,
    createdAt: "2025-01-07 12:11:39.737382+00",
    slug: "corn",
  },
  {
    id: 21,
    name: "Eggplant",
    description: NaN,
    icon: "/crop/eggplant.png",
    category: "crop",
    buyPrice: NaN,
    sellPrice: 42.0,
    createdAt: "2025-01-07 12:11:56.36829+00",
    slug: "eggplant",
  },
  {
    id: 22,
    name: "Strawberry",
    description: NaN,
    icon: "/crop/strawberry.png",
    category: "crop",
    buyPrice: NaN,
    sellPrice: 60.0,
    createdAt: "2025-01-07 12:12:19.258849+00",
    slug: "strawberry",
  },
  {
    id: 23,
    name: "Watermelon",
    description: NaN,
    icon: "/crop/watermelon.png",
    category: "crop",
    buyPrice: NaN,
    sellPrice: 150.0,
    createdAt: "2025-01-07 12:12:36.732853+00",
    slug: "watermelon",
  },
  {
    id: 26,
    name: "Nitrogen",
    description:
      "Saves 24mins growth time on carrot, wheat and radish crop. Lasts for 2hrs.",
    icon: "/perks/nitrogen.png",
    category: "perk",
    buyPrice: 6.0,
    sellPrice: NaN,
    createdAt: "2025-01-19 16:00:44.641257+00",
    slug: "nitrogen",
  },
  {
    id: 27,
    name: "Potassium",
    description:
      "Saves 40mins growth time on lettuce, potato, corn, eggplant and tomato. Lasts for 2 hours",
    icon: "/perks/potassium.png",
    category: "perk",
    buyPrice: 10.0,
    sellPrice: NaN,
    createdAt: "2025-01-19 16:10:39.518364+00",
    slug: "potassium",
  },
  {
    id: 28,
    name: "Phosphorus",
    description:
      "Saves 1hr growth time on strawberry, watermelon and pumpkin crop. Lasts for 2hrs. ",
    icon: "/perks/phosphorus.png",
    category: "perk",
    buyPrice: 14.0,
    sellPrice: NaN,
    createdAt: "2025-01-19 16:15:01.877499+00",
    slug: "phosphorus",
  },
  {
    id: 29,
    name: "Frost",
    description: NaN,
    icon: "/special/frost.png",
    category: "special",
    buyPrice: 10000.0,
    sellPrice: NaN,
    createdAt: "2025-02-25 15:12:32.202854+00",
    slug: "frost",
  },
  {
    id: 30,
    name: "Gold Carrot",
    description: NaN,
    icon: "/crop/gold-carrot.png",
    category: "special-crop",
    buyPrice: NaN,
    sellPrice: NaN,
    createdAt: "2025-03-03 08:15:22.235332+00",
    slug: "gold-carrot",
  },
  {
    id: 31,
    name: "Gold Wheat",
    description: NaN,
    icon: "/crop/gold-wheat.png",
    category: "special-crop",
    buyPrice: NaN,
    sellPrice: NaN,
    createdAt: "2025-03-03 18:23:15.809914+00",
    slug: "gold-wheat",
  },
  {
    id: 32,
    name: "Gold Corn",
    description: NaN,
    icon: "/crop/gold-corn.png",
    category: "special-crop",
    buyPrice: NaN,
    sellPrice: NaN,
    createdAt: "2025-03-03 14:10:06.069579+00",
    slug: "gold-corn",
  },
  {
    id: 33,
    name: "Gold Eggplant",
    description: NaN,
    icon: "/crop/gold-eggplant.png",
    category: "special-crop",
    buyPrice: NaN,
    sellPrice: NaN,
    createdAt: "2025-03-03 18:15:35.524675+00",
    slug: "gold-eggplant",
  },
  {
    id: 34,
    name: "Gold Lettuce",
    description: NaN,
    icon: "/crop/gold-lettuce.png",
    category: "special-crop",
    buyPrice: NaN,
    sellPrice: NaN,
    createdAt: "2025-03-03 18:23:15.809914+00",
    slug: "gold-lettuce",
  },
  {
    id: 35,
    name: "Gold Potato",
    description: NaN,
    icon: "/crop/gold-potato.png",
    category: "special-crop",
    buyPrice: NaN,
    sellPrice: NaN,
    createdAt: "2025-03-04 11:51:35.641036+00",
    slug: "gold-potato",
  },
  {
    id: 36,
    name: "Gold Tomato",
    description: NaN,
    icon: "/crop/gold-tomato.png",
    category: "special-crop",
    buyPrice: NaN,
    sellPrice: NaN,
    createdAt: "2025-03-03 18:23:15.809914+00",
    slug: "gold-tomato",
  },
  {
    id: 38,
    name: "Gold Pumpkin",
    description: NaN,
    icon: "/crop/gold-pumpkin.png",
    category: "special-crop",
    buyPrice: NaN,
    sellPrice: NaN,
    createdAt: "2025-03-03 18:23:15.809914+00",
    slug: "gold-pumpkin",
  },
  {
    id: 39,
    name: "Gold Watermelon",
    description: NaN,
    icon: "/crop/gold-watermelon.png",
    category: "special-crop",
    buyPrice: NaN,
    sellPrice: NaN,
    createdAt: "2025-03-03 18:23:15.809914+00",
    slug: "gold-watermelon",
  },
  {
    id: 40,
    name: "Gold Strawberry",
    description: NaN,
    icon: "/crop/gold-strawberry.png",
    category: "special-crop",
    buyPrice: NaN,
    sellPrice: NaN,
    createdAt: "2025-03-03 18:23:15.809914+00",
    slug: "gold-strawberry",
  },
  {
    id: 41,
    name: "Gold Radish",
    description: NaN,
    icon: "/crop/gold-radish.png",
    category: "special-crop",
    buyPrice: NaN,
    sellPrice: NaN,
    createdAt: "2025-03-03 18:23:15.809914+00",
    slug: "gold-radish",
  },
];

// 1 in 100000 chance
export const BASE_GOLD_CROP_PERCENTAGE = 0.00001;
export const ACHIEVEMENTS_GOLD_MULTIPLIER = 2.5;
export const XP_PER_DONATED_ITEM = 5;

export const OG_XP_THRESHOLD = 100;

export const CREATOR_FIDS = [
  4461, // lemon
  5698, // caso
  262800, // mide
];
export const ADMIN_FIDS = [
  ...CREATOR_FIDS,
  189636, // bianco
  16286, // frank
];

export const DAILY_QUESTS_NUMBER = 3;
export const WEEKLY_QUESTS_NUMBER = 3;

export const POWER_STAGES = [
  { stage: 1, fpRequired: 0, boost: 1.0 },
  { stage: 2, fpRequired: 50, boost: 1.25 },
  { stage: 3, fpRequired: 150, boost: 1.5 },
  { stage: 4, fpRequired: 300, boost: 1.75 },
  { stage: 5, fpRequired: 500, boost: 2.0 },
  { stage: 6, fpRequired: 800, boost: 2.5 },
  { stage: 7, fpRequired: 1200, boost: 3.0 },
  { stage: 8, fpRequired: 1700, boost: 3.5 },
  { stage: 9, fpRequired: 2300, boost: 4.0 },
  { stage: 10, fpRequired: 3050, boost: 4.5 },
  { stage: 11, fpRequired: 3950, boost: 5.0 },
  { stage: 12, fpRequired: 5050, boost: 5.5 },
  { stage: 13, fpRequired: 6350, boost: 6.0 },
  { stage: 14, fpRequired: 7850, boost: 6.5 },
  { stage: 15, fpRequired: 9550, boost: 7.0 },
  { stage: 16, fpRequired: 11550, boost: 8.0 },
  { stage: 17, fpRequired: 13850, boost: 9.0 },
  { stage: 18, fpRequired: 16450, boost: 10.0 },
  { stage: 19, fpRequired: 19350, boost: 11.0 },
  { stage: 20, fpRequired: 22550, boost: 12.0 },
];

export const MAX_COMBO = 10;
export const FP_DECREASE_DELAY_MS = 20 * 60 * 1000; // 10 minutes in milliseconds
export const DECAY_INTERVAL = 600; // 600 minutes (10 hours) for power stage decay

export const FP_AMOUNT: Record<number, number> = {
  1: 1,
  2: 3,
  3: 4,
  4: 6,
  5: 8,
  6: 9,
  7: 11,
  8: 13,
  9: 15,
  10: 18,
  11: 20,
  12: 22,
  13: 24,
  14: 26,
  15: 28,
  16: 30,
  17: 32,
  18: 34,
  19: 36,
  20: 40,
  21: 42,
  22: 44,
  23: 46,
  24: 48,
  25: 50,
  26: 52,
  27: 54,
  28: 56,
  29: 58,
  30: 60,
  31: 63,
  32: 66,
  33: 69,
  34: 72,
  35: 75,
  36: 78,
  37: 81,
  38: 84,
  39: 87,
  40: 90,
  41: 93,
  42: 96,
  43: 99,
  44: 102,
  45: 105,
  46: 108,
  47: 110,
  48: 111,
  49: 112,
  50: 113,
};

export const DAYS_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

// Farmers Power Time configuration
export const FP_TIME = {
  START_DAY: DAYS_OF_WEEK.FRIDAY,
  START_HOUR: 8,
  START_MINUTE: 52,
  END_DAY: DAYS_OF_WEEK.SATURDAY,
  END_HOUR: 8,
  END_MINUTE: 52,
};
