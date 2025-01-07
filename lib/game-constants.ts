import { CropType, ExpansionCost } from "@/types/game";

// Add EXPANSION_COSTS to the context file
export const EXPANSION_COSTS: ExpansionCost[] = [
  { coins: 40, level: 1, nextSize: { width: 3, height: 3 } },
  { coins: 500, level: 3, nextSize: { width: 4, height: 4 } },
  { coins: 1000, level: 5, nextSize: { width: 5, height: 5 } },
  { coins: 2500, level: 10, nextSize: { width: 6, height: 6 } },
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
    type: "carrot",
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
    type: "pumpkin",
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
    type: "tomato",
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
    type: "potato",
    sellPrice: 100,
    buyPrice: 60,
    icon: "/images/crop/potato.png",
    seedIcon: "/images/seed/seed_potato.png",
    levelRequirement: 8,
    xp: 25,
    imageUrl: "/images/crops/potato.png",
  },
];

export const GROWTH_TIMES: { [key: string]: number } = {
  carrot: 10000,
  pumpkin: 3600000,
  tomato: 7200000,
  potato: 21600000,
};

export const REWARD_XP = {
  carrot: 2,
  pumpkin: 6,
  tomato: 12,
  potato: 25,
} as const;
