export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_credentials: {
        Row: {
          id: number
          password_hash: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          password_hash: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          password_hash?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_label: string
          created_at: string | null
          id: string
          payload_json: Json | null
        }
        Insert: {
          action: string
          actor_label: string
          created_at?: string | null
          id?: string
          payload_json?: Json | null
        }
        Update: {
          action?: string
          actor_label?: string
          created_at?: string | null
          id?: string
          payload_json?: Json | null
        }
        Relationships: []
      }
      candidates: {
        Row: {
          batch: Database["public"]["Enums"]["batch_type"]
          clan_id: string
          created_at: string | null
          email: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          id: string
          is_active: boolean | null
          manifesto: string | null
          name: string
          photo_url: string | null
          year: number
        }
        Insert: {
          batch: Database["public"]["Enums"]["batch_type"]
          clan_id: string
          created_at?: string | null
          email?: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          id?: string
          is_active?: boolean | null
          manifesto?: string | null
          name: string
          photo_url?: string | null
          year: number
        }
        Update: {
          batch?: Database["public"]["Enums"]["batch_type"]
          clan_id?: string
          created_at?: string | null
          email?: string | null
          gender?: Database["public"]["Enums"]["gender_type"]
          id?: string
          is_active?: boolean | null
          manifesto?: string | null
          name?: string
          photo_url?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "candidates_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
      clans: {
        Row: {
          bg_image: string | null
          display_order: number | null
          id: string
          logo_url: string | null
          name: string
          quote: string | null
        }
        Insert: {
          bg_image?: string | null
          display_order?: number | null
          id: string
          logo_url?: string | null
          name: string
          quote?: string | null
        }
        Update: {
          bg_image?: string | null
          display_order?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          quote?: string | null
        }
        Relationships: []
      }
      election_settings: {
        Row: {
          allow_adhoc_voters: boolean | null
          allow_vote_changes: boolean | null
          end_at: string | null
          frozen: boolean | null
          id: number
          is_live: boolean | null
          show_live_stats: boolean | null
          start_at: string | null
          updated_at: string | null
        }
        Insert: {
          allow_adhoc_voters?: boolean | null
          allow_vote_changes?: boolean | null
          end_at?: string | null
          frozen?: boolean | null
          id?: number
          is_live?: boolean | null
          show_live_stats?: boolean | null
          start_at?: string | null
          updated_at?: string | null
        }
        Update: {
          allow_adhoc_voters?: boolean | null
          allow_vote_changes?: boolean | null
          end_at?: string | null
          frozen?: boolean | null
          id?: number
          is_live?: boolean | null
          show_live_stats?: boolean | null
          start_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      voter_registry: {
        Row: {
          batch: Database["public"]["Enums"]["batch_type"]
          clan: string
          created_at: string | null
          email: string
          gender: Database["public"]["Enums"]["gender_type"]
          name: string
          reg_num: string
          updated_at: string | null
          year: number
        }
        Insert: {
          batch: Database["public"]["Enums"]["batch_type"]
          clan: string
          created_at?: string | null
          email: string
          gender: Database["public"]["Enums"]["gender_type"]
          name: string
          reg_num: string
          updated_at?: string | null
          year: number
        }
        Update: {
          batch?: Database["public"]["Enums"]["batch_type"]
          clan?: string
          created_at?: string | null
          email?: string
          gender?: Database["public"]["Enums"]["gender_type"]
          name?: string
          reg_num?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      votes: {
        Row: {
          batch: Database["public"]["Enums"]["batch_type"]
          candidate_id: string
          clan_id: string
          created_at: string | null
          device_hash: string | null
          id: string
          user_agent: string | null
          voter_email: string
          voter_regnum: string
        }
        Insert: {
          batch: Database["public"]["Enums"]["batch_type"]
          candidate_id: string
          clan_id: string
          created_at?: string | null
          device_hash?: string | null
          id?: string
          user_agent?: string | null
          voter_email: string
          voter_regnum: string
        }
        Update: {
          batch?: Database["public"]["Enums"]["batch_type"]
          candidate_id?: string
          clan_id?: string
          created_at?: string | null
          device_hash?: string | null
          id?: string
          user_agent?: string | null
          voter_email?: string
          voter_regnum?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      batch_type: "MBA" | "HHM" | "DBM" | "IPM" | "PHD"
      gender_type: "Male" | "Female" | "Other" | "Prefer not to say"
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
  public: {
    Enums: {
      batch_type: ["MBA", "HHM", "DBM", "IPM", "PHD"],
      gender_type: ["Male", "Female", "Other", "Prefer not to say"],
    },
  },
} as const
