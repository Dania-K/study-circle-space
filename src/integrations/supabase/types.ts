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
      badges: {
        Row: {
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          xp_requirement: number
        }
        Insert: {
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          xp_requirement: number
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          xp_requirement?: number
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
          username: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
          username: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_spotlight: boolean
          likes: number
          title: string
          user_id: string
          username: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          is_spotlight?: boolean
          likes?: number
          title: string
          user_id: string
          username: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_spotlight?: boolean
          likes?: number
          title?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      focus_rooms: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          host_id: string | null
          id: string
          in_session: boolean | null
          subject: string
          timer_end_timestamp: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          host_id?: string | null
          id?: string
          in_session?: boolean | null
          subject: string
          timer_end_timestamp?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          host_id?: string | null
          id?: string
          in_session?: boolean | null
          subject?: string
          timer_end_timestamp?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "focus_rooms_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          id: string
          is_anonymous: boolean | null
          room_id: string
          text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          room_id: string
          text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          room_id?: string
          text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "focus_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          created_at: string
          health: number
          id: string
          level: number
          owner_id: string
          pet_type: string | null
          xp: number
        }
        Insert: {
          created_at?: string
          health?: number
          id?: string
          level?: number
          owner_id: string
          pet_type?: string | null
          xp?: number
        }
        Update: {
          created_at?: string
          health?: number
          id?: string
          level?: number
          owner_id?: string
          pet_type?: string | null
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_stage: number | null
          created_at: string
          grade: string | null
          id: string
          last_activity: string | null
          level: number
          name: string | null
          school: string | null
          streak: number
          total_lifetime_xp: number | null
          username: string | null
          xp: number
        }
        Insert: {
          avatar_stage?: number | null
          created_at?: string
          grade?: string | null
          id: string
          last_activity?: string | null
          level?: number
          name?: string | null
          school?: string | null
          streak?: number
          total_lifetime_xp?: number | null
          username?: string | null
          xp?: number
        }
        Update: {
          avatar_stage?: number | null
          created_at?: string
          grade?: string | null
          id?: string
          last_activity?: string | null
          level?: number
          name?: string | null
          school?: string | null
          streak?: number
          total_lifetime_xp?: number | null
          username?: string | null
          xp?: number
        }
        Relationships: []
      }
      sessions: {
        Row: {
          completed_subtasks: number | null
          created_at: string
          end_time: string | null
          id: string
          is_anonymous: boolean | null
          mood: string | null
          room_id: string
          start_time: string
          subtasks: Json | null
          task_text: string
          user_id: string
        }
        Insert: {
          completed_subtasks?: number | null
          created_at?: string
          end_time?: string | null
          id?: string
          is_anonymous?: boolean | null
          mood?: string | null
          room_id: string
          start_time?: string
          subtasks?: Json | null
          task_text: string
          user_id: string
        }
        Update: {
          completed_subtasks?: number | null
          created_at?: string
          end_time?: string | null
          id?: string
          is_anonymous?: boolean | null
          mood?: string | null
          room_id?: string
          start_time?: string
          subtasks?: Json | null
          task_text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "focus_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_rooms: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          host_id: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          host_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          host_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_rooms_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed: boolean | null
          created_at: string
          due_date: string | null
          id: string
          priority: string | null
          subject: string | null
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          due_date?: string | null
          id?: string
          priority?: string | null
          subject?: string | null
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          due_date?: string | null
          id?: string
          priority?: string | null
          subject?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string | null
          claimed: boolean | null
          earned_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          badge_id?: string | null
          claimed?: boolean | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          badge_id?: string | null
          claimed?: boolean | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_classes: {
        Row: {
          class_name: string
          created_at: string
          id: string
          subject: string
          teacher_name: string | null
          user_id: string
        }
        Insert: {
          class_name: string
          created_at?: string
          id?: string
          subject: string
          teacher_name?: string | null
          user_id: string
        }
        Update: {
          class_name?: string
          created_at?: string
          id?: string
          subject?: string
          teacher_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          classes: string[] | null
          created_at: string | null
          goals: string[] | null
          hobbies: string[] | null
          id: string
          interests: string[] | null
          user_id: string | null
        }
        Insert: {
          classes?: string[] | null
          created_at?: string | null
          goals?: string[] | null
          hobbies?: string[] | null
          id?: string
          interests?: string[] | null
          user_id?: string | null
        }
        Update: {
          classes?: string[] | null
          created_at?: string | null
          goals?: string[] | null
          hobbies?: string[] | null
          id?: string
          interests?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_summaries: {
        Row: {
          created_at: string | null
          focus_minutes: number | null
          id: string
          summary_text: string
          tasks_completed: number | null
          user_id: string | null
          week_start: string
          xp_gained: number | null
        }
        Insert: {
          created_at?: string | null
          focus_minutes?: number | null
          id?: string
          summary_text: string
          tasks_completed?: number | null
          user_id?: string | null
          week_start: string
          xp_gained?: number | null
        }
        Update: {
          created_at?: string | null
          focus_minutes?: number | null
          id?: string
          summary_text?: string
          tasks_completed?: number | null
          user_id?: string | null
          week_start?: string
          xp_gained?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
