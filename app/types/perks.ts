import { CropType } from "./game";

export type PerkType = "GROWTH_BOOSTER" | "YIELD_BOOSTER";

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
}

export interface PlayerPerks {
  active: Perk[];
  owned: Perk[];
}
