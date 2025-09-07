export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      boxes: {
        Row: {
          budget_max: number | null
          buyer_type: Database["public"]["Enums"]["buyer_type_enum"] | null
          city: string | null
          created_at: string
          deal_breakers: string | null
          description: string | null
          financing_details:
            | Database["public"]["Enums"]["financing_enum"]
            | null
          hoa_ok: boolean | null
          id: string
          lot_size: number | null
          notes: string | null
          occupant_intent:
            | Database["public"]["Enums"]["occupant_intent_enum"]
            | null
          preferred_condition:
            | Database["public"]["Enums"]["condition_enum"]
            | null
          property_type:
            | Database["public"]["Enums"]["property_type_enum"]
            | null
          seller_flexibility: string | null
          state: string | null
          status: string
          timeline_to_close: Database["public"]["Enums"]["timeline_enum"] | null
          updated_at: string
          user_id: string | null
          year_built: number | null
        }
        Insert: {
          budget_max?: number | null
          buyer_type?: Database["public"]["Enums"]["buyer_type_enum"] | null
          city?: string | null
          created_at?: string
          deal_breakers?: string | null
          description?: string | null
          financing_details?:
            | Database["public"]["Enums"]["financing_enum"]
            | null
          hoa_ok?: boolean | null
          id?: string
          lot_size?: number | null
          notes?: string | null
          occupant_intent?:
            | Database["public"]["Enums"]["occupant_intent_enum"]
            | null
          preferred_condition?:
            | Database["public"]["Enums"]["condition_enum"]
            | null
          property_type?:
            | Database["public"]["Enums"]["property_type_enum"]
            | null
          seller_flexibility?: string | null
          state?: string | null
          status?: string
          timeline_to_close?:
            | Database["public"]["Enums"]["timeline_enum"]
            | null
          updated_at?: string
          user_id?: string | null
          year_built?: number | null
        }
        Update: {
          budget_max?: number | null
          buyer_type?: Database["public"]["Enums"]["buyer_type_enum"] | null
          city?: string | null
          created_at?: string
          deal_breakers?: string | null
          description?: string | null
          financing_details?:
            | Database["public"]["Enums"]["financing_enum"]
            | null
          hoa_ok?: boolean | null
          id?: string
          lot_size?: number | null
          notes?: string | null
          occupant_intent?:
            | Database["public"]["Enums"]["occupant_intent_enum"]
            | null
          preferred_condition?:
            | Database["public"]["Enums"]["condition_enum"]
            | null
          property_type?:
            | Database["public"]["Enums"]["property_type_enum"]
            | null
          seller_flexibility?: string | null
          state?: string | null
          status?: string
          timeline_to_close?:
            | Database["public"]["Enums"]["timeline_enum"]
            | null
          updated_at?: string
          user_id?: string | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "boxes_city_fkey"
            columns: ["city"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "boxes_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string | null
          id: number
          latitude: number
          longitude: number
          name: string
          population: number | null
          state: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          latitude: number
          longitude: number
          name: string
          population?: number | null
          state: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          latitude?: number
          longitude?: number
          name?: string
          population?: number | null
          state?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          supabase_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          supabase_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          supabase_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      buyer_type_enum:
        | "first_time_buyer"
        | "investor"
        | "move_up_buyer"
        | "downsizing"
        | "relocating"
      condition_enum: "turnkey" | "good" | "fair" | "needs_work" | "any"
      financing_enum:
        | "cash"
        | "conventional"
        | "fha"
        | "va"
        | "seller_finance"
        | "hard_money"
        | "flexible"
      occupant_intent_enum:
        | "primary_residence"
        | "investment"
        | "vacation_home"
        | "rental"
        | "flip"
      property_type_enum:
        | "single_family"
        | "condo"
        | "townhouse"
        | "duplex"
        | "multi_family"
        | "land"
        | "commercial"
      timeline_enum:
        | "asap"
        | "1_month"
        | "3_months"
        | "6_months"
        | "1_year"
        | "flexible"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      buyer_type_enum: [
        "first_time_buyer",
        "investor",
        "move_up_buyer",
        "downsizing",
        "relocating",
      ],
      condition_enum: ["turnkey", "good", "fair", "needs_work", "any"],
      financing_enum: [
        "cash",
        "conventional",
        "fha",
        "va",
        "seller_finance",
        "hard_money",
        "flexible",
      ],
      occupant_intent_enum: [
        "primary_residence",
        "investment",
        "vacation_home",
        "rental",
        "flip",
      ],
      property_type_enum: [
        "single_family",
        "condo",
        "townhouse",
        "duplex",
        "multi_family",
        "land",
        "commercial",
      ],
      timeline_enum: [
        "asap",
        "1_month",
        "3_months",
        "6_months",
        "1_year",
        "flexible",
      ],
    },
  },
} as const

