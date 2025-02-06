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

export interface Crop {
  deathTime: number;
  growthTime: number;
  rewardXP: number;
  power: number;
  tier: string;
}

export const CROP_DATA: { [key: string]: Crop } = {
  wheat: {
    growthTime: 6 * 1000, // 6h in milliseconds
    deathTime: 3 * 1000, // 3h in milliseconds
    rewardXP: 14,
    power: 1.4,
    tier: "C",
  },
  carrot: {
    growthTime: 4 * 1000, // 6h
    deathTime: 3.3 * 1000, // 3.3h
    rewardXP: 8,
    power: 1.2,
    tier: "C",
  },
  radish: {
    growthTime: 6 * 1000, // 6h
    deathTime: 3.6 * 1000, // 3.6h
    rewardXP: 14,
    power: 1.4,
    tier: "C",
  },
  lettuce: {
    growthTime: 10 * 1000, // 10h
    deathTime: 6 * 1000, // 6h
    rewardXP: 25,
    power: 3,
    tier: "B",
  },
  potato: {
    growthTime: 12 * 1000, // 12h
    deathTime: 7.8 * 1000, // 7.8h
    rewardXP: 30,
    power: 3,
    tier: "B",
  },
  corn: {
    growthTime: 12 * 1000, // 12h
    deathTime: 8.4 * 1000, // 8.4h
    rewardXP: 32,
    power: 3,
    tier: "B",
  },
  eggplant: {
    growthTime: 15 * 1000, // 16h
    deathTime: 12 * 1000, // 12h
    rewardXP: 40,
    power: 4.2,
    tier: "A",
  },
  tomato: {
    growthTime: 16 * 1000, // 16h
    deathTime: 12.8 * 1000, // 12.8h
    rewardXP: 45,
    power: 5,
    tier: "A",
  },
  strawberry: {
    growthTime: 24 * 1000, // 24h
    deathTime: 19.2 * 1000, // 19.2h
    rewardXP: 55,
    power: 4.8,
    tier: "A",
  },
  watermelon: {
    growthTime: 36 * 1000, // 36h
    deathTime: 32.4 * 1000, // 32.4h
    rewardXP: 120,
    power: 30,
    tier: "S",
  },
  pumpkin: {
    growthTime: 48 * 1000, // 48h
    deathTime: 48 * 1000, // 48h
    rewardXP: 165,
    power: 30,
    tier: "S",
  },
};

export const LEVEL_XP_THRESHOLDS = [
  0, // Level 1
  100, // Level 2
  300, // Level 3
  600, // Level 4
  1000, // Level 5
  1400, // Level 6
  1900, // Level 7
  2500, // Level 8
  3200, // Level 9
  4000, // Level 10
  5000, // Level 11
  6200, // Level 12
  7500, // Level 13
  9000, // Level 14
  11000, // Level 15
  13000, // Level 16
  15000, // Level 17
  17000, // Level 18
  19000, // Level 19
  21000, // Level 20
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
