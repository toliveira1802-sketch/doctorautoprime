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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alert_clicks: {
        Row: {
          action: string
          alert_id: string
          clicked_at: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          action?: string
          alert_id: string
          clicked_at?: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          action?: string
          alert_id?: string
          clicked_at?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_clicks_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          appointment_id: string | null
          created_at: string
          due_date: string
          id: string
          is_automatic: boolean
          message: string | null
          pending_items: Json | null
          read_at: string | null
          seasonal_tag: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["alert_status"]
          target_type: Database["public"]["Enums"]["alert_target"]
          title: string
          updated_at: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          appointment_id?: string | null
          created_at?: string
          due_date: string
          id?: string
          is_automatic?: boolean
          message?: string | null
          pending_items?: Json | null
          read_at?: string | null
          seasonal_tag?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          target_type?: Database["public"]["Enums"]["alert_target"]
          title: string
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          appointment_id?: string | null
          created_at?: string
          due_date?: string
          id?: string
          is_automatic?: boolean
          message?: string | null
          pending_items?: Json | null
          read_at?: string | null
          seasonal_tag?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          target_type?: Database["public"]["Enums"]["alert_target"]
          title?: string
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_services: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          price_at_booking: number
          service_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          price_at_booking?: number
          service_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          price_at_booking?: number
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_services_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string | null
          created_at: string
          discount_amount: number
          final_price: number
          id: string
          is_full_day: boolean
          notes: string | null
          pay_in_advance: boolean
          promotion_id: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          subtotal: number
          updated_at: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time?: string | null
          created_at?: string
          discount_amount?: number
          final_price?: number
          id?: string
          is_full_day?: boolean
          notes?: string | null
          pay_in_advance?: boolean
          promotion_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          subtotal?: number
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string | null
          created_at?: string
          discount_amount?: number
          final_price?: number
          id?: string
          is_full_day?: boolean
          notes?: string | null
          pay_in_advance?: boolean
          promotion_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          subtotal?: number
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_clicks: {
        Row: {
          clicked_at: string
          event_id: string
          id: string
          user_id: string | null
        }
        Insert: {
          clicked_at?: string
          event_id: string
          id?: string
          user_id?: string | null
        }
        Update: {
          clicked_at?: string
          event_id?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_clicks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          is_active: boolean
          location: string | null
          max_participants: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          is_active?: boolean
          location?: string | null
          max_participants?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          is_active?: boolean
          location?: string | null
          max_participants?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      funnel_events: {
        Row: {
          created_at: string
          event_type: Database["public"]["Enums"]["funnel_step"]
          flow_type: string
          id: string
          promotion_id: string | null
          session_id: string
          step_number: number
          total_steps: number
          user_id: string | null
          vehicle_model: string | null
        }
        Insert: {
          created_at?: string
          event_type: Database["public"]["Enums"]["funnel_step"]
          flow_type: string
          id?: string
          promotion_id?: string | null
          session_id: string
          step_number: number
          total_steps: number
          user_id?: string | null
          vehicle_model?: string | null
        }
        Update: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["funnel_step"]
          flow_type?: string
          id?: string
          promotion_id?: string | null
          session_id?: string
          step_number?: number
          total_steps?: number
          user_id?: string | null
          vehicle_model?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_events_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birthday: string | null
          cpf: string | null
          created_at: string
          full_name: string | null
          id: string
          internal_notes: string | null
          is_recurrent: boolean | null
          lifetime_value: number | null
          loyalty_level: string | null
          loyalty_points: number | null
          phone: string | null
          priority_score: number | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          internal_notes?: string | null
          is_recurrent?: boolean | null
          lifetime_value?: number | null
          loyalty_level?: string | null
          loyalty_points?: number | null
          phone?: string | null
          priority_score?: number | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          internal_notes?: string | null
          is_recurrent?: boolean | null
          lifetime_value?: number | null
          loyalty_level?: string | null
          loyalty_points?: number | null
          phone?: string | null
          priority_score?: number | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_clicks: {
        Row: {
          clicked_at: string
          id: string
          promotion_id: string
          source: string | null
          user_id: string | null
        }
        Insert: {
          clicked_at?: string
          id?: string
          promotion_id: string
          source?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_at?: string
          id?: string
          promotion_id?: string
          source?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_clicks_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          available_dates: string[] | null
          created_at: string
          description: string | null
          discount_label: string
          discount_percent: number
          id: string
          is_active: boolean
          service_id: string | null
          title: string
          updated_at: string
          valid_from: string
          valid_to: string
          vehicle_models: string[] | null
        }
        Insert: {
          available_dates?: string[] | null
          created_at?: string
          description?: string | null
          discount_label: string
          discount_percent?: number
          id?: string
          is_active?: boolean
          service_id?: string | null
          title: string
          updated_at?: string
          valid_from: string
          valid_to: string
          vehicle_models?: string[] | null
        }
        Update: {
          available_dates?: string[] | null
          created_at?: string
          description?: string | null
          discount_label?: string
          discount_percent?: number
          id?: string
          is_active?: boolean
          service_id?: string | null
          title?: string
          updated_at?: string
          valid_from?: string
          valid_to?: string
          vehicle_models?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          duration_minutes: number
          id: string
          is_active: boolean
          is_full_day: boolean
          name: string
          price: number
          service_type: Database["public"]["Enums"]["service_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          duration_minutes?: number
          id?: string
          is_active?: boolean
          is_full_day?: boolean
          name: string
          price?: number
          service_type: Database["public"]["Enums"]["service_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          duration_minutes?: number
          id?: string
          is_active?: boolean
          is_full_day?: boolean
          name?: string
          price?: number
          service_type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string | null
          color: string | null
          created_at: string
          id: string
          is_active: boolean
          model: string
          plate: string
          updated_at: string
          user_id: string
          year: string | null
        }
        Insert: {
          brand?: string | null
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          model: string
          plate: string
          updated_at?: string
          user_id: string
          year?: string | null
        }
        Update: {
          brand?: string | null
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          model?: string
          plate?: string
          updated_at?: string
          user_id?: string
          year?: string | null
        }
        Relationships: []
      }
      waitlist_interests: {
        Row: {
          created_at: string
          id: string
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      profiles_client_view: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      alert_status: "scheduled" | "sent" | "read" | "dismissed" | "completed"
      alert_target: "client" | "admin"
      alert_type: "pending_items" | "oil_change" | "seasonal" | "custom"
      app_role: "admin" | "user"
      appointment_status: "pendente" | "confirmado" | "concluido" | "cancelado"
      event_type: "workshop" | "meetup" | "carwash" | "training" | "other"
      funnel_step:
        | "flow_started"
        | "vehicle_selected"
        | "type_selected"
        | "services_selected"
        | "date_selected"
        | "flow_completed"
        | "flow_abandoned"
      item_priority: "critical" | "half_life" | "good"
      service_type: "revisao" | "diagnostico"
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
      alert_status: ["scheduled", "sent", "read", "dismissed", "completed"],
      alert_target: ["client", "admin"],
      alert_type: ["pending_items", "oil_change", "seasonal", "custom"],
      app_role: ["admin", "user"],
      appointment_status: ["pendente", "confirmado", "concluido", "cancelado"],
      event_type: ["workshop", "meetup", "carwash", "training", "other"],
      funnel_step: [
        "flow_started",
        "vehicle_selected",
        "type_selected",
        "services_selected",
        "date_selected",
        "flow_completed",
        "flow_abandoned",
      ],
      item_priority: ["critical", "half_life", "good"],
      service_type: ["revisao", "diagnostico"],
    },
  },
} as const
