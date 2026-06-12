export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      deliveries: {
        Row: {
          courier_token: string
          created_at: string
          customer_address: string
          customer_name: string
          customer_token: string
          delivered_at: string | null
          dispatched_at: string | null
          id: string
          ifood_order_id: string | null
          status: Database["public"]["Enums"]["delivery_status"]
          store_id: string
        }
        Insert: {
          courier_token: string
          created_at?: string
          customer_address: string
          customer_name: string
          customer_token: string
          delivered_at?: string | null
          dispatched_at?: string | null
          id?: string
          ifood_order_id?: string | null
          status?: Database["public"]["Enums"]["delivery_status"]
          store_id: string
        }
        Update: {
          courier_token?: string
          created_at?: string
          customer_address?: string
          customer_name?: string
          customer_token?: string
          delivered_at?: string | null
          dispatched_at?: string | null
          id?: string
          ifood_order_id?: string | null
          status?: Database["public"]["Enums"]["delivery_status"]
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_locations: {
        Row: {
          accuracy: number | null
          delivery_id: string
          id: string
          lat: number
          lng: number
          recorded_at: string
        }
        Insert: {
          accuracy?: number | null
          delivery_id: string
          id?: string
          lat: number
          lng: number
          recorded_at?: string
        }
        Update: {
          accuracy?: number | null
          delivery_id?: string
          id?: string
          lat?: number
          lng?: number
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_locations_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          created_at: string
          id: string
          ifood_merchant_id: string | null
          name: string
          owner_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ifood_merchant_id?: string | null
          name: string
          owner_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ifood_merchant_id?: string | null
          name?: string
          owner_user_id?: string
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
      delivery_status:
        | "pending"
        | "dispatched"
        | "nearby"
        | "delivered"
        | "canceled"
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

export type DeliveryStatus = Database["public"]["Enums"]["delivery_status"]

export type Store = Tables<"stores">
export type Delivery = Tables<"deliveries">
export type DeliveryLocation = Tables<"delivery_locations">
