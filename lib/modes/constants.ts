import { Mode } from "../types/game";

export const STARTER_PACKS = {
  [Mode.Classic]: [
    {
      itemId: 1,
      quantity: 4,
    },
    {
      itemId: 9,
      quantity: 4,
    },
  ],
  [Mode.Farcon]: [
    {
      itemId: 1,
      quantity: 4,
    },
    {
      itemId: 9,
      quantity: 10,
    },
  ],
  [Mode.Sonic]: [
    {
      itemId: 1,
      quantity: 4,
    },
    {
      itemId: 9,
      quantity: 10,
    },
  ],
};

export enum ModeFeature {
  GoldCrops = "gold-crops",
  HarvestHonours = "harvest-honours",
  Quests = "quests",
}

export const MODE_DEFINITIONS = {
  [Mode.Classic]: {
    name: "Classic",
    description: "The original game mode with no special features.",
    starterPack: STARTER_PACKS.classic,
    features: [
      ModeFeature.GoldCrops,
      ModeFeature.HarvestHonours,
      ModeFeature.Quests,
    ],
    startAt: new Date("2025-01-01T00:00:00Z"),
    endAt: null,
    background: {
      pattern: `
        linear-gradient(45deg, #386A48 25%, transparent 25%),
        linear-gradient(-45deg, #386A48 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #386A48 75%),
        linear-gradient(-45deg, transparent 75%, #386A48 75%)
      `,
      color: "#255F37",
    },
    welcomeCardColors: {
      background: "#386A48",
      title: "#ffffff",
      description: "#ffffff",
      button: "#ffffff",
    },
    growthTimeDivisor: 1,
  },
  [Mode.Farcon]: {
    name: "Farcon",
    description: "A new game mode specifically designed for the Farcon event.",
    starterPack: STARTER_PACKS.farcon,
    features: [ModeFeature.HarvestHonours, ModeFeature.Quests],
    startAt: new Date("2025-04-24T00:00:00Z"),
    endAt: new Date("2025-05-07T23:59:59Z"),
    background: {
      pattern: `
        linear-gradient(45deg, #3a2150 25%, transparent 25%),
        linear-gradient(-45deg, #3a2150 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #3a2150 75%),
        linear-gradient(-45deg, transparent 75%, #3a2150 75%)
      `,
      color: "#2a1043",
    },
    welcomeCardColors: {
      background: "#3a2150",
      title: "#ffffff",
      description: "#ffffff",
      button: "#ffffff",
    },
    growthTimeDivisor: 2,
  },
  [Mode.Sonic]: {
    name: "Sonic",
    description: "A limited-time game mode where the crops grow very fast.",
    starterPack: STARTER_PACKS.sonic,
    features: Array<ModeFeature>(),
    startAt: new Date("2025-05-02T14:00:00Z"),
    endAt: new Date("2025-05-02T16:00:00Z"),
    background: {
      pattern: `
        linear-gradient(45deg, #2B4C7E 25%, transparent 25%),
        linear-gradient(-45deg, #2B4C7E 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #2B4C7E 75%),
        linear-gradient(-45deg, transparent 75%, #2B4C7E 75%)
      `,
      color: "#193C6E",
    },
    welcomeCardColors: {
      background: "#00265f",
      title: "#d8d8d8",
      description: "#d8d8d8",
      button: "#ffffff",
    },
    growthTimeDivisor: 48,
  },
};
