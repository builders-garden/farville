export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      items: {
        Row: {
          id: number;
          name: string;
          description: string;
          icon: string;
          category: string;
          buyPrice: number;
          sellPrice: number;
          requiredLevel: number;
          slug: string;
          createdAt: string;
        };
        Insert: {
          id?: number;
          name: string;
          description: string;
          icon: string;
          category: string;
          buyPrice: number;
          sellPrice: number;
          requiredLevel: number;
          slug: string;
          createdAt?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string;
          icon?: string;
          category?: string;
          buyPrice?: number;
          sellPrice?: number;
          requiredLevel?: number;
          slug?: string;
          createdAt?: string;
        };
      };
      users: {
        Row: {
          fid: number;
          username: string;
          displayName: string;
          avatarUrl: string | null;
          walletAddress: string | null;
          xp: number;
          coins: number;
          expansions: number;
          notificationDetails: string | null;
          createdAt: string;
        };
        Insert: {
          fid: number;
          username: string;
          displayName: string;
          avatarUrl?: string | null;
          walletAddress?: string | null;
          xp?: number;
          coins?: number;
          expansions?: number;
          notificationDetails?: string | null;
          createdAt?: string;
        };
        Update: {
          fid?: number;
          username?: string;
          displayName?: string;
          avatarUrl?: string | null;
          walletAddress?: string | null;
          xp?: number;
          coins?: number;
          expansions?: number;
          notificationDetails?: string | null;
          createdAt?: string;
        };
      };
      user_has_items: {
        Row: {
          id: number;
          userFid: number;
          itemId: number;
          quantity: number;
          createdAt: string;
        };
        Insert: {
          id?: number;
          userFid: number;
          itemId: number;
          quantity: number;
          createdAt?: string;
        };
        Update: {
          id?: number;
          userFid?: number;
          itemId?: number;
          quantity?: number;
          createdAt?: string;
        };
      };
      user_grid_cells: {
        Row: {
          fid: number;
          x: number;
          y: number;
          cropType: string;
          plantedAt: string;
          isReadyToHarvest: boolean;
          createdAt: string;
        };
        Insert: {
          fid: number;
          x: number;
          y: number;
          cropType: string;
          plantedAt: string;
          isReadyToHarvest: boolean;
          createdAt?: string;
        };
        Update: {
          fid?: number;
          x?: number;
          y?: number;
          cropType?: string;
          plantedAt?: string;
          isReadyToHarvest?: boolean;
          createdAt?: string;
        };
      };
      user_notification: {
        Row: {
          id: number;
          fid: number;
          category: string;
          createdAt: string;
        };
        Insert: {
          id?: number;
          fid: number;
          category: string;
          createdAt?: string;
        };
        Update: {
          id?: number;
          fid?: number;
          category?: string;
          createdAt?: string;
        };
      };
      quests: {
        Row: {
          id: number;
          category: string;
          itemId: number | null;
          amount: number | null;
          xp: number | null;
          coins: number | null;
          startAt: string | null;
          endAt: string | null;
          createdAt: string;
        };
        Insert: {
          id?: number;
          category: string;
          itemId?: number | null;
          amount?: number | null;
          xp?: number | null;
          coins?: number | null;
          startAt?: string | null;
          endAt?: string | null;
          createdAt?: string;
        };
        Update: {
          id?: number;
          category?: string;
          itemId?: number | null;
          amount?: number | null;
          xp?: number | null;
          coins?: number | null;
          startAt?: string | null;
          endAt?: string | null;
          createdAt?: string;
        };
      };
      user_has_quests: {
        Row: {
          id: number;
          fid: number;
          questId: number;
          status: "incomplete" | "complete";
          completedAt: string | null;
          createdAt: string;
          progress: number;
        };
        Insert: {
          id?: number;
          fid: number;
          questId: number;
          status?: "incomplete" | "complete";
          completedAt?: string | null;
          createdAt?: string;
          progress?: number;
        };
        Update: {
          id?: number;
          fid?: number;
          questId?: number;
          status?: "incomplete" | "complete";
          completedAt?: string | null;
          createdAt?: string;
          progress?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
