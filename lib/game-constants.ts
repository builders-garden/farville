import { CropType, ExpansionCost } from "@/types/game";

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
}

export const MAX_DAILY_ALLOWED_DONATION_BETWEEN_USERS = 2;

export const millisecondsInHour =
  process.env.NODE_ENV === "production" ? 3600000 : 1000;

export const CROP_DATA: { [key: string]: CropData } = {
  wheat: {
    growthTime: 6 * millisecondsInHour, // 6h in milliseconds
    deathTime: 3 * millisecondsInHour, // 3h in milliseconds
    rewardXP: 14,
    power: 1.4,
    tier: "C",
    id: 17,
  },
  carrot: {
    growthTime: 4 * millisecondsInHour, // 6h
    deathTime: 3.3 * millisecondsInHour, // 3.3h
    rewardXP: 8,
    power: 1.2,
    tier: "C",
    id: 5,
  },
  radish: {
    growthTime: 6 * millisecondsInHour, // 6h
    deathTime: 3.6 * millisecondsInHour, // 3.6h
    rewardXP: 14,
    power: 1.4,
    tier: "C",
    id: 18,
  },
  lettuce: {
    growthTime: 10 * millisecondsInHour, // 10h
    deathTime: 6 * millisecondsInHour, // 6h
    rewardXP: 25,
    power: 3,
    tier: "B",
    id: 19,
  },
  potato: {
    growthTime: 12 * millisecondsInHour, // 12h
    deathTime: 7.8 * millisecondsInHour, // 7.8h
    rewardXP: 30,
    power: 3,
    tier: "B",
    id: 8,
  },
  corn: {
    growthTime: 12 * millisecondsInHour, // 12h
    deathTime: 8.4 * millisecondsInHour, // 8.4h
    rewardXP: 32,
    power: 3,
    tier: "B",
    id: 20,
  },
  eggplant: {
    growthTime: 15 * millisecondsInHour, // 16h
    deathTime: 12 * millisecondsInHour, // 12h
    rewardXP: 40,
    power: 4.2,
    tier: "A",
    id: 21,
  },
  tomato: {
    growthTime: 16 * millisecondsInHour, // 16h
    deathTime: 12.8 * millisecondsInHour, // 12.8h
    rewardXP: 45,
    power: 5,
    tier: "A",
    id: 7,
  },
  strawberry: {
    growthTime: 24 * millisecondsInHour, // 24h
    deathTime: 19.2 * millisecondsInHour, // 19.2h
    rewardXP: 55,
    power: 4.8,
    tier: "A",
    id: 22,
  },
  watermelon: {
    growthTime: 36 * millisecondsInHour, // 36h
    deathTime: 32.4 * millisecondsInHour, // 32.4h
    rewardXP: 120,
    power: 30,
    tier: "S",
    id: 23,
  },
  pumpkin: {
    growthTime: 48 * millisecondsInHour, // 48h
    deathTime: 48 * millisecondsInHour, // 48h
    rewardXP: 165,
    power: 30,
    tier: "S",
    id: 6,
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
  [key: string]: { boost: number; duration: number; applyTo: CropType[] };
} = {
  nitrogen: {
    boost: 1.25,
    duration: 7200000, // 2 hours
    applyTo: [CropType.Carrot, CropType.Wheat, CropType.Radish],
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
  },
  phosphorus: {
    boost: 2,
    duration: 7200000, // 2 hours
    applyTo: [CropType.Strawberry, CropType.Watermelon, CropType.Pumpkin],
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

export const XP_PER_DONATED_ITEM = 5;

export const OG_XP_THRESHOLD = 100;
