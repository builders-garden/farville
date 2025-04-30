import { Mode } from "../types/game";
import { Separator } from "@/components/ui/separator";

interface StarterPack {
  itemId: number;
  quantity: number;
}

export const STARTER_PACKS: Record<Mode, Array<StarterPack>> = {
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
  Leagues = "leagues",
}

interface ModeDefinition {
  name: string;
  description: React.ReactNode;
  starterPack: Array<StarterPack>;
  features: ModeFeature[];
  displayable: boolean;
  background: {
    pattern: string;
    color: string;
  };
  welcomeCardColors: {
    background: string;
    title: string;
    description: string;
    button: string;
  };
  growthTimeDivisor: number;
  boosterTimeDivisor: number;
  dailyLimitDonationsToUsers?: number;
  dailyLimitDonationsToSameUser?: number;
  startDate?: Date;
  endDate?: Date;
}

export const MODE_DEFINITIONS: Record<Mode, ModeDefinition> = {
  [Mode.Classic]: {
    name: "Classic",
    description: "The original game mode with no special features",
    starterPack: STARTER_PACKS.classic,
    features: [
      ModeFeature.GoldCrops,
      ModeFeature.HarvestHonours,
      ModeFeature.Quests,
      ModeFeature.Leagues,
    ],
    displayable: true,
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
    boosterTimeDivisor: 1,
    dailyLimitDonationsToUsers: 5,
    dailyLimitDonationsToSameUser: 2,
  },
  [Mode.Farcon]: {
    name: "Farcon",
    description: (
      <>
        <p>Compete with fellow Farcon attendees</p>
        <Separator className="w-[80%] m-auto" />
        <p>
          whoever has the most XP by May 4th at 11:59PM takes home $100 USDC 💸
        </p>
      </>
    ),
    starterPack: STARTER_PACKS.farcon,
    features: [ModeFeature.HarvestHonours, ModeFeature.Quests],
    displayable: true,
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
    boosterTimeDivisor: 4,
    dailyLimitDonationsToUsers: 10,
    dailyLimitDonationsToSameUser: 3,
    startDate: new Date("2025-05-30T00:00:00Z"),
    endDate: new Date("2025-05-04T23:59:59Z"),
  },
  [Mode.Sonic]: {
    name: "Sonic",
    description: (
      <>
        <p>2 hours. ultra fast growth. pure chaos.</p>
        <Separator className="w-[80%] m-auto" />
        <p>whoever racks up the most XP before time&apos;s up wins $50 USDC.</p>
      </>
    ),
    starterPack: STARTER_PACKS.sonic,
    features: Array<ModeFeature>(),
    displayable: true,
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
    boosterTimeDivisor: 8,
    startDate: new Date("2025-05-02T00:00:00Z"),
    endDate: new Date("2025-05-02T23:59:59Z"),
  },
};

export const FARCON_VOUCHER = {
  id: 1,
  slug: "farcon-nyc",
  name: "Farcon NYC",
  description: "Farcon NYC 2025 voucher",
  mode: "farcon",
  quantity: 2,
  itemId: 9,
  createdAt: "2025-04-28 14:09:37.430436+00",
};
