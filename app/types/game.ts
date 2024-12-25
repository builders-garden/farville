import type { Perk } from "./perks";

export type CropType = "wheat" | "corn" | "tomato" | "potato";

export type Crop = {
  type: CropType;
  growthStage: number;
  readyToHarvest: boolean;
  plantedAt: number;
};

export type Seeds = {
  [key in CropType]: number;
};

export type Crops = {
  [key in CropType]: number;
};

export interface GameState {
  coins: number;
  level: number;
  experience: number;
  seeds: Seeds;
  crops: Crops;
  inventoryCapacity: number;
  grid: GridCell[][];
  gridSize: GridSize;
  perks: Perks;
  showInventory: boolean;
  showMarketplace: boolean;
  showSettings: boolean;
  showLeaderboard: boolean;
  expansionLevel: number;
}

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
