import type { Perk } from "./perks";

export enum SeedType {
  CarrotSeeds = "carrot-seeds",
  PumpkinSeeds = "pumpkin-seeds",
  TomatoSeeds = "tomato-seeds",
  PotatoSeeds = "potato-seeds",
  WheatSeeds = "wheat-seeds",
  CornSeeds = "corn-seeds",
  LettuceSeeds = "lettuce-seeds",
  EggplantSeeds = "eggplant-seeds",
  RadishSeeds = "radish-seeds",
  StrawberrySeeds = "strawberry-seeds",
  WatermelonSeeds = "watermelon-seeds",
}

export enum ActionType {
  Plant = "plant",
  Harvest = "harvest",
  Fertilize = "fertilize",
  ApplyPerk = "apply-perk",
}

export enum MarketActionType {
  Buy = "buy",
  Sell = "sell",
}

export enum CropType {
  Carrot = "carrot",
  Pumpkin = "pumpkin",
  Tomato = "tomato",
  Potato = "potato",
  Watermelon = "watermelon",
  Strawberry = "strawberry",
  Eggplant = "eggplant",
  Onion = "onion",
  Radish = "radish",
  Lettuce = "lettuce",
  Corn = "corn",
  Wheat = "wheat",
}

export enum PerkType {
  Nitrogen = "nitrogen",
  Potassium = "potassium",
  Phosphorus = "phosphorus",
  Fertilizer = "fertilizer",
}

export enum SpecialItemType {
  Frost = "frost",
}

export type Crop = {
  type: CropType;
  growthStage: number;
  readyToHarvest: boolean;
  plantedAt: number;
  growthTime: number;
};

export type Seeds = {
  [key in CropType]: number;
};

export type Crops = {
  [key in CropType]: number;
};

export interface GridCell {
  id: string;
  x: number;
  y: number;
  tilled: boolean;
  crop?: Crop;
  decoration?: Decoration;
}

export interface GridSize {
  width: number;
  height: number;
}

export interface ExpansionCost {
  coins: number;
  level: number;
  nextSize: GridSize;
}

export interface Perks {
  active: Array<Perk & { activatedAt?: number }>;
  owned: Perk[];
}

export type DecorationType =
  | "fence"
  | "path"
  | "scarecrow"
  | "fountain"
  | "bench"
  | "flower_bed";

export interface Decoration {
  id: string;
  type: DecorationType;
  rotation: 0 | 90 | 180 | 270;
}

export interface DecorationItem {
  type: DecorationType;
  name: string;
  description: string;
  emoji: string;
  cost: number;
  isAnimated?: boolean;
  isRare?: boolean;
}

export interface HarvestResponse {
  rewards: {
    xp: number;
    amount: number;
    didLevelUp: boolean;
    newLevel?: number;
  };
}

export enum QuestStatus {
  Incomplete = "incomplete",
  Completed = "completed",
  Claimed = "claimed",
}

export enum ItemCategory {
  Crop = "crop",
  Seed = "seed",
  Perk = "perk",
  Special = "special",
}
