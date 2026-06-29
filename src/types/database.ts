export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          phone: string | null
          email: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          website: string | null
          logo_url: string | null
          timezone: string
          currency: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          website?: string | null
          logo_url?: string | null
          timezone?: string
          currency?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          slug?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          website?: string | null
          logo_url?: string | null
          timezone?: string
          currency?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      agents: {
        Row: {
          id: string
          business_id: string
          name: string
          voice: string
          language: string
          personality: string
          greeting_message: string | null
          system_prompt: string | null
          is_active: boolean
          max_call_duration: number
          interrupt_sensitivity: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          voice?: string
          language?: string
          personality?: string
          greeting_message?: string | null
          system_prompt?: string | null
          is_active?: boolean
          max_call_duration?: number
          interrupt_sensitivity?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          voice?: string
          language?: string
          personality?: string
          greeting_message?: string | null
          system_prompt?: string | null
          is_active?: boolean
          max_call_duration?: number
          interrupt_sensitivity?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          business_id: string
          name: string
          description: string | null
          duration_minutes: number
          price_min: number | null
          price_max: number | null
          price_type: string
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          description?: string | null
          duration_minutes?: number
          price_min?: number | null
          price_max?: number | null
          price_type?: string
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          description?: string | null
          duration_minutes?: number
          price_min?: number | null
          price_max?: number | null
          price_type?: string
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
      }
      business_hours: {
        Row: {
          id: string
          business_id: string
          day_of_week: number
          open_time: string | null
          close_time: string | null
          is_open: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          day_of_week: number
          open_time?: string | null
          close_time?: string | null
          is_open?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          day_of_week?: number
          open_time?: string | null
          close_time?: string | null
          is_open?: boolean
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          business_id: string
          service_id: string | null
          conversation_id: string | null
          customer_name: string
          customer_phone: string | null
          customer_email: string | null
          vehicle_year: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          notes: string | null
          scheduled_at: string
          duration_minutes: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          service_id?: string | null
          conversation_id?: string | null
          customer_name: string
          customer_phone?: string | null
          customer_email?: string | null
          vehicle_year?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          notes?: string | null
          scheduled_at: string
          duration_minutes?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          service_id?: string | null
          conversation_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          customer_email?: string | null
          vehicle_year?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          notes?: string | null
          scheduled_at?: string
          duration_minutes?: number
          status?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          business_id: string
          agent_id: string | null
          caller_name: string | null
          caller_phone: string | null
          caller_email: string | null
          status: string
          duration_seconds: number | null
          appointment_booked: boolean
          callback_requested: boolean
          sentiment: string | null
          summary: string | null
          source: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          agent_id?: string | null
          caller_name?: string | null
          caller_phone?: string | null
          caller_email?: string | null
          status?: string
          duration_seconds?: number | null
          appointment_booked?: boolean
          callback_requested?: boolean
          sentiment?: string | null
          summary?: string | null
          source?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          agent_id?: string | null
          caller_name?: string | null
          caller_phone?: string | null
          caller_email?: string | null
          status?: string
          duration_seconds?: number | null
          appointment_booked?: boolean
          callback_requested?: boolean
          sentiment?: string | null
          summary?: string | null
          source?: string
          updated_at?: string
        }
      }
      conversation_messages: {
        Row: {
          id: string
          conversation_id: string
          role: string
          content: string
          tool_name: string | null
          tool_result: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: string
          content: string
          tool_name?: string | null
          tool_result?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: string
          content?: string
          tool_name?: string | null
          tool_result?: Json | null
        }
      }
      faqs: {
        Row: {
          id: string
          business_id: string
          question: string
          answer: string
          category: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          question: string
          answer: string
          category?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          question?: string
          answer?: string
          category?: string | null
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          business_id: string
          conversation_id: string | null
          name: string
          phone: string | null
          email: string | null
          vehicle_year: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          service_interest: string | null
          notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          conversation_id?: string | null
          name: string
          phone?: string | null
          email?: string | null
          vehicle_year?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          service_interest?: string | null
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          conversation_id?: string | null
          name?: string
          phone?: string | null
          email?: string | null
          vehicle_year?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          service_interest?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
        }
      }
      embedded_widgets: {
        Row: {
          id: string
          business_id: string
          agent_id: string | null
          name: string
          position: string
          primary_color: string
          greeting: string | null
          is_active: boolean
          allowed_domains: string[] | null
          total_impressions: number
          total_interactions: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          agent_id?: string | null
          name?: string
          position?: string
          primary_color?: string
          greeting?: string | null
          is_active?: boolean
          allowed_domains?: string[] | null
          total_impressions?: number
          total_interactions?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          agent_id?: string | null
          name?: string
          position?: string
          primary_color?: string
          greeting?: string | null
          is_active?: boolean
          allowed_domains?: string[] | null
          total_impressions?: number
          total_interactions?: number
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          business_id: string
          conversation_id: string | null
          event_type: string
          event_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          conversation_id?: string | null
          event_type: string
          event_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          conversation_id?: string | null
          event_type?: string
          event_data?: Json | null
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      is_business_owner: {
        Args: { business_id: string }
        Returns: boolean
      }
      create_default_business_hours: {
        Args: { p_business_id: string }
        Returns: void
      }
    }
    Enums: Record<string, never>
  }
}
