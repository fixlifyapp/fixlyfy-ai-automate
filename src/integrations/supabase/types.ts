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
      automation_actions: {
        Row: {
          action_config: Json
          action_type: string
          automation_id: string | null
          created_at: string
          delay_minutes: number | null
          id: string
          sequence_order: number | null
        }
        Insert: {
          action_config?: Json
          action_type: string
          automation_id?: string | null
          created_at?: string
          delay_minutes?: number | null
          id?: string
          sequence_order?: number | null
        }
        Update: {
          action_config?: Json
          action_type?: string
          automation_id?: string | null
          created_at?: string
          delay_minutes?: number | null
          id?: string
          sequence_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_actions_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_performance: {
        Row: {
          actions_executed: number | null
          automation_id: string | null
          created_at: string
          date: string
          engagement_rate: number | null
          id: string
          success_rate: number | null
          triggers_fired: number | null
        }
        Insert: {
          actions_executed?: number | null
          automation_id?: string | null
          created_at?: string
          date?: string
          engagement_rate?: number | null
          id?: string
          success_rate?: number | null
          triggers_fired?: number | null
        }
        Update: {
          actions_executed?: number | null
          automation_id?: string | null
          created_at?: string
          date?: string
          engagement_rate?: number | null
          id?: string
          success_rate?: number | null
          triggers_fired?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_performance_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_runs: {
        Row: {
          actions_executed: number | null
          automation_id: string | null
          completed_at: string | null
          context_data: Json | null
          error_message: string | null
          id: string
          started_at: string
          status: string
          trigger_data: Json | null
        }
        Insert: {
          actions_executed?: number | null
          automation_id?: string | null
          completed_at?: string | null
          context_data?: Json | null
          error_message?: string | null
          id?: string
          started_at?: string
          status?: string
          trigger_data?: Json | null
        }
        Update: {
          actions_executed?: number | null
          automation_id?: string | null
          completed_at?: string | null
          context_data?: Json | null
          error_message?: string | null
          id?: string
          started_at?: string
          status?: string
          trigger_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_runs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_triggers: {
        Row: {
          automation_id: string | null
          conditions: Json | null
          created_at: string
          event_type: string | null
          id: string
          schedule_config: Json | null
          trigger_type: string
        }
        Insert: {
          automation_id?: string | null
          conditions?: Json | null
          created_at?: string
          event_type?: string | null
          id?: string
          schedule_config?: Json | null
          trigger_type: string
        }
        Update: {
          automation_id?: string | null
          conditions?: Json | null
          created_at?: string
          event_type?: string | null
          id?: string
          schedule_config?: Json | null
          trigger_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_triggers_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_variables: {
        Row: {
          created_at: string
          data_source: string | null
          description: string | null
          field_path: string | null
          id: string
          name: string
          variable_key: string
        }
        Insert: {
          created_at?: string
          data_source?: string | null
          description?: string | null
          field_path?: string | null
          id?: string
          name: string
          variable_key: string
        }
        Update: {
          created_at?: string
          data_source?: string | null
          description?: string | null
          field_path?: string | null
          id?: string
          name?: string
          variable_key?: string
        }
        Relationships: []
      }
      automations: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          failure_count: number | null
          id: string
          last_run_at: string | null
          name: string
          next_run_at: string | null
          run_count: number | null
          status: string
          success_count: number | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          failure_count?: number | null
          id?: string
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          run_count?: number | null
          status?: string
          success_count?: number | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          failure_count?: number | null
          id?: string
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          run_count?: number | null
          status?: string
          success_count?: number | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      calls: {
        Row: {
          call_sid: string | null
          client_id: string | null
          created_at: string
          direction: string
          duration: string | null
          ended_at: string | null
          id: string
          notes: string | null
          phone_number: string
          started_at: string
          status: string | null
          updated_at: string
        }
        Insert: {
          call_sid?: string | null
          client_id?: string | null
          created_at?: string
          direction: string
          duration?: string | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          phone_number: string
          started_at?: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          call_sid?: string | null
          client_id?: string | null
          created_at?: string
          direction?: string
          duration?: string | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          phone_number?: string
          started_at?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calls_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "estimate_details_view"
            referencedColumns: ["client_id"]
          },
        ]
      }
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
      communication_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          subject: string | null
          type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          subject?: string | null
          type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          subject?: string | null
          type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string
          job_id: string | null
          last_message_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          last_message_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          last_message_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "estimate_details_view"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_fields: {
        Row: {
          created_at: string | null
          created_by: string | null
          default_value: string | null
          entity_type: string
          field_type: string
          id: string
          name: string
          options: Json | null
          placeholder: string | null
          required: boolean | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          default_value?: string | null
          entity_type: string
          field_type: string
          id?: string
          name: string
          options?: Json | null
          placeholder?: string | null
          required?: boolean | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          default_value?: string | null
          entity_type?: string
          field_type?: string
          id?: string
          name?: string
          options?: Json | null
          placeholder?: string | null
          required?: boolean | null
        }
        Relationships: []
      }
      emails: {
        Row: {
          body: string | null
          client_id: string | null
          created_at: string
          direction: string
          email_address: string
          id: string
          is_read: boolean | null
          is_starred: boolean | null
          status: string | null
          subject: string
          thread_id: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          client_id?: string | null
          created_at?: string
          direction: string
          email_address: string
          id?: string
          is_read?: boolean | null
          is_starred?: boolean | null
          status?: string | null
          subject: string
          thread_id?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          client_id?: string | null
          created_at?: string
          direction?: string
          email_address?: string
          id?: string
          is_read?: boolean | null
          is_starred?: boolean | null
          status?: string | null
          subject?: string
          thread_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emails_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "estimate_details_view"
            referencedColumns: ["client_id"]
          },
        ]
      }
      estimate_communications: {
        Row: {
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          communication_type: string
          content: string
          created_at: string
          delivered_at: string | null
          error_message: string | null
          estimate_id: string | null
          estimate_number: string | null
          id: string
          provider_message_id: string | null
          recipient: string
          sent_at: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          communication_type: string
          content: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          estimate_id?: string | null
          estimate_number?: string | null
          id?: string
          provider_message_id?: string | null
          recipient: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          communication_type?: string
          content?: string
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          estimate_id?: string | null
          estimate_number?: string | null
          id?: string
          provider_message_id?: string | null
          recipient?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_communications_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimate_details_view"
            referencedColumns: ["estimate_id"]
          },
          {
            foreignKeyName: "estimate_communications_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          created_at: string | null
          date: string | null
          estimate_number: string
          id: string
          job_id: string | null
          notes: string | null
          status: string | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          estimate_number: string
          id?: string
          job_id?: string | null
          notes?: string | null
          status?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          estimate_number?: string
          id?: string
          job_id?: string | null
          notes?: string | null
          status?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estimates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number | null
          balance: number | null
          created_at: string | null
          date: string | null
          estimate_id: string | null
          id: string
          invoice_number: string
          job_id: string | null
          notes: string | null
          status: string | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          balance?: number | null
          created_at?: string | null
          date?: string | null
          estimate_id?: string | null
          id?: string
          invoice_number: string
          job_id?: string | null
          notes?: string | null
          status?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          balance?: number | null
          created_at?: string | null
          date?: string | null
          estimate_id?: string | null
          id?: string
          invoice_number?: string
          job_id?: string | null
          notes?: string | null
          status?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimate_details_view"
            referencedColumns: ["estimate_id"]
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
            referencedRelation: "fact_jobs"
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
      job_attachments: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          job_id: string
          mime_type: string | null
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          job_id: string
          mime_type?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          job_id?: string
          mime_type?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_attachments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_attachments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_custom_field_values: {
        Row: {
          created_at: string | null
          custom_field_id: string
          id: string
          job_id: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          custom_field_id: string
          id?: string
          job_id: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          custom_field_id?: string
          id?: string
          job_id?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_custom_field_values_custom_field_id_fkey"
            columns: ["custom_field_id"]
            isOneToOne: false
            referencedRelation: "custom_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      job_history: {
        Row: {
          created_at: string | null
          description: string
          id: string
          job_id: string
          meta: Json | null
          title: string
          type: string
          user_id: string | null
          user_name: string | null
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          job_id: string
          meta?: Json | null
          title: string
          type: string
          user_id?: string | null
          user_name?: string | null
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          job_id?: string
          meta?: Json | null
          title?: string
          type?: string
          user_id?: string | null
          user_name?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_history_job_id_idx"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_history_job_id_idx"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_overview: {
        Row: {
          billing_contact: Json | null
          created_at: string
          emergency_contact: Json | null
          id: string
          job_id: string
          previous_service_date: string | null
          property_age: string | null
          property_size: string | null
          property_type: string | null
          updated_at: string
          warranty_info: Json | null
        }
        Insert: {
          billing_contact?: Json | null
          created_at?: string
          emergency_contact?: Json | null
          id?: string
          job_id: string
          previous_service_date?: string | null
          property_age?: string | null
          property_size?: string | null
          property_type?: string | null
          updated_at?: string
          warranty_info?: Json | null
        }
        Update: {
          billing_contact?: Json | null
          created_at?: string
          emergency_contact?: Json | null
          id?: string
          job_id?: string
          previous_service_date?: string | null
          property_age?: string | null
          property_size?: string | null
          property_type?: string | null
          updated_at?: string
          warranty_info?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "job_overview_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_overview_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_statuses: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          sequence: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          sequence?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          sequence?: number | null
        }
        Relationships: []
      }
      job_types: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          client_id: string | null
          created_at: string | null
          created_by: string | null
          date: string | null
          description: string | null
          id: string
          job_type: string | null
          lead_source: string | null
          notes: string | null
          revenue: number | null
          schedule_end: string | null
          schedule_start: string | null
          service: string | null
          status: string | null
          tags: string[] | null
          tasks: Json | null
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
          job_type?: string | null
          lead_source?: string | null
          notes?: string | null
          revenue?: number | null
          schedule_end?: string | null
          schedule_start?: string | null
          service?: string | null
          status?: string | null
          tags?: string[] | null
          tasks?: Json | null
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
          job_type?: string | null
          lead_source?: string | null
          notes?: string | null
          revenue?: number | null
          schedule_end?: string | null
          schedule_start?: string | null
          service?: string | null
          status?: string | null
          tags?: string[] | null
          tasks?: Json | null
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
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "estimate_details_view"
            referencedColumns: ["client_id"]
          },
        ]
      }
      lead_sources: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      line_items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          parent_id: string
          parent_type: string
          quantity: number | null
          taxable: boolean | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          parent_id: string
          parent_type: string
          quantity?: number | null
          taxable?: boolean | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          parent_id?: string
          parent_type?: string
          quantity?: number | null
          taxable?: boolean | null
          unit_price?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          conversation_id: string | null
          created_at: string | null
          direction: string
          id: string
          media_url: string | null
          message_sid: string | null
          read_at: string | null
          recipient: string | null
          sender: string | null
          status: string | null
        }
        Insert: {
          body: string
          conversation_id?: string | null
          created_at?: string | null
          direction: string
          id?: string
          media_url?: string | null
          message_sid?: string | null
          read_at?: string | null
          recipient?: string | null
          sender?: string | null
          status?: string | null
        }
        Update: {
          body?: string
          conversation_id?: string | null
          created_at?: string | null
          direction?: string
          id?: string
          media_url?: string | null
          message_sid?: string | null
          read_at?: string | null
          recipient?: string | null
          sender?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          date: string | null
          id: string
          invoice_id: string | null
          method: string | null
          notes: string | null
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          date?: string | null
          id?: string
          invoice_id?: string | null
          method?: string | null
          notes?: string | null
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string | null
          id?: string
          invoice_id?: string | null
          method?: string | null
          notes?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_number_purchases: {
        Row: {
          created_at: string
          id: string
          monthly_cost: number
          notes: string | null
          phone_number_id: string
          purchase_date: string
          purchase_price: number
          status: string | null
          twilio_account_sid: string | null
          twilio_phone_number_sid: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          monthly_cost: number
          notes?: string | null
          phone_number_id: string
          purchase_date?: string
          purchase_price: number
          status?: string | null
          twilio_account_sid?: string | null
          twilio_phone_number_sid?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          monthly_cost?: number
          notes?: string | null
          phone_number_id?: string
          purchase_date?: string
          purchase_price?: number
          status?: string | null
          twilio_account_sid?: string | null
          twilio_phone_number_sid?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "phone_number_purchases_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_numbers: {
        Row: {
          assigned_to: string | null
          capabilities: Json | null
          country_code: string
          created_at: string
          friendly_name: string | null
          id: string
          latitude: number | null
          locality: string | null
          longitude: number | null
          monthly_price: number | null
          phone_number: string
          phone_number_type: string | null
          price: number | null
          price_unit: string | null
          purchased_at: string | null
          purchased_by: string | null
          rate_center: string | null
          region: string | null
          status: string | null
          twilio_sid: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          assigned_to?: string | null
          capabilities?: Json | null
          country_code?: string
          created_at?: string
          friendly_name?: string | null
          id?: string
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          monthly_price?: number | null
          phone_number: string
          phone_number_type?: string | null
          price?: number | null
          price_unit?: string | null
          purchased_at?: string | null
          purchased_by?: string | null
          rate_center?: string | null
          region?: string | null
          status?: string | null
          twilio_sid?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          assigned_to?: string | null
          capabilities?: Json | null
          country_code?: string
          created_at?: string
          friendly_name?: string | null
          id?: string
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          monthly_price?: number | null
          phone_number?: string
          phone_number_type?: string | null
          price?: number | null
          price_unit?: string | null
          purchased_at?: string | null
          purchased_by?: string | null
          rate_center?: string | null
          region?: string | null
          status?: string | null
          twilio_sid?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
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
          available_for_jobs: boolean | null
          avatar_url: string | null
          business_niche: string | null
          call_masking_enabled: boolean | null
          created_at: string | null
          id: string
          internal_notes: string | null
          is_public: boolean | null
          labor_cost_per_hour: number | null
          name: string | null
          phone: string | null
          referral_source: string | null
          role: string | null
          schedule_color: string | null
          status: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          uses_two_factor: boolean | null
        }
        Insert: {
          available_for_jobs?: boolean | null
          avatar_url?: string | null
          business_niche?: string | null
          call_masking_enabled?: boolean | null
          created_at?: string | null
          id: string
          internal_notes?: string | null
          is_public?: boolean | null
          labor_cost_per_hour?: number | null
          name?: string | null
          phone?: string | null
          referral_source?: string | null
          role?: string | null
          schedule_color?: string | null
          status?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          uses_two_factor?: boolean | null
        }
        Update: {
          available_for_jobs?: boolean | null
          avatar_url?: string | null
          business_niche?: string | null
          call_masking_enabled?: boolean | null
          created_at?: string | null
          id?: string
          internal_notes?: string | null
          is_public?: boolean | null
          labor_cost_per_hour?: number | null
          name?: string | null
          phone?: string | null
          referral_source?: string | null
          role?: string | null
          schedule_color?: string | null
          status?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          uses_two_factor?: boolean | null
        }
        Relationships: []
      }
      report_schedules: {
        Row: {
          created_at: string | null
          cron_expression: string | null
          frequency: string
          id: string
          is_active: boolean | null
          last_run_at: string | null
          next_run_at: string | null
          recipients: string[] | null
          report_id: string | null
        }
        Insert: {
          created_at?: string | null
          cron_expression?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          recipients?: string[] | null
          report_id?: string | null
        }
        Update: {
          created_at?: string | null
          cron_expression?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          recipients?: string[] | null
          report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_schedules_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          filters: Json | null
          id: string
          is_public: boolean | null
          name: string
          template_id: string | null
          updated_at: string | null
          widgets: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          is_public?: boolean | null
          name: string
          template_id?: string | null
          updated_at?: string | null
          widgets?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters?: Json | null
          id?: string
          is_public?: boolean | null
          name?: string
          template_id?: string | null
          updated_at?: string | null
          widgets?: Json | null
        }
        Relationships: []
      }
      service_areas: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
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
      team_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string | null
          name: string
          phone: string | null
          role: string
          service_area: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_token: string
          invited_by?: string | null
          name: string
          phone?: string | null
          role?: string
          service_area?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string | null
          name?: string
          phone?: string | null
          role?: string
          service_area?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_member_commissions: {
        Row: {
          base_rate: number | null
          created_at: string | null
          fees: Json | null
          id: string
          rules: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          base_rate?: number | null
          created_at?: string | null
          fees?: Json | null
          id?: string
          rules?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          base_rate?: number | null
          created_at?: string | null
          fees?: Json | null
          id?: string
          rules?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      team_member_skills: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      estimate_details_view: {
        Row: {
          client_company: string | null
          client_email: string | null
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string | null
          estimate_id: string | null
          estimate_number: string | null
          job_description: string | null
          job_id: string | null
          job_title: string | null
          notes: string | null
          status: string | null
          total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "estimates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "fact_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estimates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      fact_jobs: {
        Row: {
          client_id: string | null
          client_name: string | null
          date: string | null
          date_day: string | null
          date_month: string | null
          date_week: string | null
          day: number | null
          id: string | null
          month: number | null
          revenue: number | null
          status: string | null
          technician_id: string | null
          technician_name: string | null
          title: string | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "estimate_details_view"
            referencedColumns: ["client_id"]
          },
        ]
      }
    }
    Functions: {
      get_service_areas: {
        Args: { p_team_member_id: string }
        Returns: {
          id: string
          name: string
          zip_code: string
        }[]
      }
      get_team_member_commission: {
        Args: { p_team_member_id: string }
        Returns: {
          id: string
          user_id: string
          base_rate: number
          rules: Json
          fees: Json
          created_at: string
          updated_at: string
        }[]
      }
      get_team_member_skills: {
        Args: { p_team_member_id: string }
        Returns: {
          id: string
          name: string
        }[]
      }
      update_team_member_commission: {
        Args: { user_id: string; base_rate: number; rules: Json; fees: Json }
        Returns: undefined
      }
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
