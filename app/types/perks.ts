import { CropType } from "./game";

export type PerkType = "GROWTH_BOOSTER" | "YIELD_BOOSTER" | "INSTANT_GROWTH";

export interface Perk {
  id: string;
  name: string;
  description: string;
  type: PerkType;
  multiplier: number;
  duration?: number; // in milliseconds, undefined means permanent
  cost: number;
  cropType?: CropType; // undefined means affects all crops
  icon: string;
  activatedAt?: number;
  quantity?: number; // New field for inventory items
}

export interface PlayerPerks {
  active: Perk[];
  owned: Perk[];
}
