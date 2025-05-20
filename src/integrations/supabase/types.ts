export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          status: string | null
          tags: string[] | null
          type: string | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      estimate_items: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          estimate_id: string
          id: string
          name: string
          price: number
          quantity: number
          tags: string[] | null
          taxable: boolean
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          estimate_id: string
          id?: string
          name: string
          price?: number
          quantity?: number
          tags?: string[] | null
          taxable?: boolean
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          estimate_id?: string
          id?: string
          name?: string
          price?: number
          quantity?: number
          tags?: string[] | null
          taxable?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimate_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          id: string
          job_id: string
          number: string
          status: string
          technicians_note: string | null
          updated_at: string | null
          viewed: boolean
        }
        Insert: {
          amount?: number
          created_at?: string | null
          date?: string
          id?: string
          job_id: string
          number: string
          status?: string
          technicians_note?: string | null
          updated_at?: string | null
          viewed?: boolean
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          id?: string
          job_id?: string
          number?: string
          status?: string
          technicians_note?: string | null
          updated_at?: string | null
          viewed?: boolean
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string
          discount: number
          id: string
          invoice_id: string
          quantity: number
          tax: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          discount?: number
          id?: string
          invoice_id: string
          quantity?: number
          tax?: number
          total?: number
          unit_price?: number
        }
        Update: {
          created_at?: string | null
          description?: string
          discount?: number
          id?: string
          invoice_id?: string
          quantity?: number
          tax?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string
          created_at: string | null
          date: string | null
          due_date: string | null
          estimate_id: string | null
          id: string
          job_id: string
          notes: string | null
          number: string
          status: string
          subtotal: number
          tax_amount: number
          total: number
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          date?: string | null
          due_date?: string | null
          estimate_id?: string | null
          id?: string
          job_id: string
          notes?: string | null
          number: string
          status?: string
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          date?: string | null
          due_date?: string | null
          estimate_id?: string | null
          id?: string
          job_id?: string
          notes?: string | null
          number?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          client_id: string | null
          created_at: string | null
          created_by: string | null
          date: string | null
          description: string | null
          id: string
          notes: string | null
          revenue: number | null
          schedule_end: string | null
          schedule_start: string | null
          service: string | null
          status: string | null
          tags: string[] | null
          technician_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          id: string
          notes?: string | null
          revenue?: number | null
          schedule_end?: string | null
          schedule_start?: string | null
          service?: string | null
          status?: string | null
          tags?: string[] | null
          technician_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          revenue?: number | null
          schedule_end?: string | null
          schedule_start?: string | null
          service?: string | null
          status?: string | null
          tags?: string[] | null
          technician_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string | null
          created_by: string | null
          date: string | null
          id: string
          invoice_id: string | null
          job_id: string | null
          method: string
          notes: string | null
          reference: string | null
          status: string
          technician_id: string | null
          technician_name: string | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          method: string
          notes?: string | null
          reference?: string | null
          status?: string
          technician_id?: string | null
          technician_name?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          method?: string
          notes?: string | null
          reference?: string | null
          status?: string
          technician_id?: string | null
          technician_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          cost: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          ourprice: number | null
          price: number
          sku: string | null
          tags: string[] | null
          taxable: boolean | null
          updated_at: string | null
        }
        Insert: {
          category: string
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          ourprice?: number | null
          price?: number
          sku?: string | null
          tags?: string[] | null
          taxable?: boolean | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          ourprice?: number | null
          price?: number
          sku?: string | null
          tags?: string[] | null
          taxable?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recommended_products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          estimate_id: string
          id: string
          name: string
          price: number
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          estimate_id: string
          id?: string
          name: string
          price?: number
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          estimate_id?: string
          id?: string
          name?: string
          price?: number
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommended_products_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          category: string
          color: string | null
          created_at: string | null
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
