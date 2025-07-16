export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_definitions: {
        Row: {
          agent_type: string
          category: string
          configuration: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_template: boolean | null
          name: string
          organization_id: string | null
          requirements: Json | null
          status: Database["public"]["Enums"]["agent_status"] | null
          tags: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          agent_type: string
          category: string
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_template?: boolean | null
          name: string
          organization_id?: string | null
          requirements?: Json | null
          status?: Database["public"]["Enums"]["agent_status"] | null
          tags?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          agent_type?: string
          category?: string
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_template?: boolean | null
          name?: string
          organization_id?: string | null
          requirements?: Json | null
          status?: Database["public"]["Enums"]["agent_status"] | null
          tags?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_definitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "agent_definitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_definitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_definitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_definitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "agent_definitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_deployments: {
        Row: {
          agent_id: string | null
          configuration: Json | null
          created_at: string | null
          deployed_at: string | null
          deployed_by: string | null
          environment: string | null
          id: string
          last_health_check: string | null
          logs: Json | null
          metrics: Json | null
          name: string
          organization_id: string | null
          resources: Json | null
          status: Database["public"]["Enums"]["deployment_status"] | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          configuration?: Json | null
          created_at?: string | null
          deployed_at?: string | null
          deployed_by?: string | null
          environment?: string | null
          id?: string
          last_health_check?: string | null
          logs?: Json | null
          metrics?: Json | null
          name: string
          organization_id?: string | null
          resources?: Json | null
          status?: Database["public"]["Enums"]["deployment_status"] | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          configuration?: Json | null
          created_at?: string | null
          deployed_at?: string | null
          deployed_by?: string | null
          environment?: string | null
          id?: string
          last_health_check?: string | null
          logs?: Json | null
          metrics?: Json | null
          name?: string
          organization_id?: string | null
          resources?: Json | null
          status?: Database["public"]["Enums"]["deployment_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_deployments_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_deployments_deployed_by_fkey"
            columns: ["deployed_by"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "agent_deployments_deployed_by_fkey"
            columns: ["deployed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_deployments_deployed_by_fkey"
            columns: ["deployed_by"]
            isOneToOne: false
            referencedRelation: "user_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_deployments_deployed_by_fkey"
            columns: ["deployed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_deployments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "agent_deployments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_requests: {
        Row: {
          agent_type: string
          budget: string | null
          created_at: string
          id: string
          status: string | null
          updated_at: string
          urgency: string
          use_case: string
          user_id: string | null
        }
        Insert: {
          agent_type: string
          budget?: string | null
          created_at?: string
          id?: string
          status?: string | null
          updated_at?: string
          urgency: string
          use_case: string
          user_id?: string | null
        }
        Update: {
          agent_type?: string
          budget?: string | null
          created_at?: string
          id?: string
          status?: string | null
          updated_at?: string
          urgency?: string
          use_case?: string
          user_id?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          allowed_data_types: string[] | null
          can_send_financial_data: boolean | null
          can_send_health_data: boolean | null
          can_send_location_data: boolean | null
          contact_avatar_url: string | null
          contact_display_name: string
          contact_user_id: string | null
          contact_username: string
          created_at: string | null
          id: string
          is_blocked: boolean | null
          is_favorite: boolean | null
          last_sent_at: string | null
          relationship_type: string | null
          total_messages_sent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allowed_data_types?: string[] | null
          can_send_financial_data?: boolean | null
          can_send_health_data?: boolean | null
          can_send_location_data?: boolean | null
          contact_avatar_url?: string | null
          contact_display_name: string
          contact_user_id?: string | null
          contact_username: string
          created_at?: string | null
          id?: string
          is_blocked?: boolean | null
          is_favorite?: boolean | null
          last_sent_at?: string | null
          relationship_type?: string | null
          total_messages_sent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allowed_data_types?: string[] | null
          can_send_financial_data?: boolean | null
          can_send_health_data?: boolean | null
          can_send_location_data?: boolean | null
          contact_avatar_url?: string | null
          contact_display_name?: string
          contact_user_id?: string | null
          contact_username?: string
          created_at?: string | null
          id?: string
          is_blocked?: boolean | null
          is_favorite?: boolean | null
          last_sent_at?: string | null
          relationship_type?: string | null
          total_messages_sent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      data: {
        Row: {
          ai_insights: Json | null
          auto_tags: string[] | null
          business_context: string | null
          content_type: string | null
          created_at: string | null
          data: Json
          data_quality_score: number | null
          data_size: number | null
          endpoint_id: string
          enriched_data: Json | null
          headers: Json | null
          id: string
          is_archived: boolean | null
          is_favorite: boolean | null
          is_read: boolean | null
          is_starred: boolean | null
          key_fields: string[] | null
          preview: string | null
          processed_at: string | null
          processed_by_ai: boolean | null
          sender_info: Json | null
          sensitive_data: boolean | null
          source: string | null
          source_ip: unknown | null
          status: string | null
          subject: string | null
          tags: string[] | null
          type: string | null
          updated_at: string | null
          user_agent: string | null
          user_category: string | null
          user_notes: string | null
        }
        Insert: {
          ai_insights?: Json | null
          auto_tags?: string[] | null
          business_context?: string | null
          content_type?: string | null
          created_at?: string | null
          data: Json
          data_quality_score?: number | null
          data_size?: number | null
          endpoint_id: string
          enriched_data?: Json | null
          headers?: Json | null
          id?: string
          is_archived?: boolean | null
          is_favorite?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          key_fields?: string[] | null
          preview?: string | null
          processed_at?: string | null
          processed_by_ai?: boolean | null
          sender_info?: Json | null
          sensitive_data?: boolean | null
          source?: string | null
          source_ip?: unknown | null
          status?: string | null
          subject?: string | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_category?: string | null
          user_notes?: string | null
        }
        Update: {
          ai_insights?: Json | null
          auto_tags?: string[] | null
          business_context?: string | null
          content_type?: string | null
          created_at?: string | null
          data?: Json
          data_quality_score?: number | null
          data_size?: number | null
          endpoint_id?: string
          enriched_data?: Json | null
          headers?: Json | null
          id?: string
          is_archived?: boolean | null
          is_favorite?: boolean | null
          is_read?: boolean | null
          is_starred?: boolean | null
          key_fields?: string[] | null
          preview?: string | null
          processed_at?: string | null
          processed_by_ai?: boolean | null
          sender_info?: Json | null
          sensitive_data?: boolean | null
          source?: string | null
          source_ip?: unknown | null
          status?: string | null
          subject?: string | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_category?: string | null
          user_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enostics_data_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enostics_data_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "enostics_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      data_processor: {
        Row: {
          actual_cost_cents: number | null
          actual_processing_time_seconds: number | null
          ai_models_enabled: string[] | null
          ai_processing_level: string | null
          ai_temperature: number | null
          approval_required: boolean | null
          approved_at: string | null
          approved_by: string | null
          audit_trail: Json | null
          auto_tags: string[] | null
          business_domain: string | null
          completed_at: string | null
          compliance_checks: Json | null
          compliance_requirements: string[] | null
          confidence_scores: Json | null
          cost_estimate_cents: number | null
          created_at: string | null
          current_step: number | null
          custom_ai_prompt: string | null
          data_classification: string | null
          data_lineage: Json | null
          data_quality_threshold: number | null
          downstream_systems: string[] | null
          endpoint_id: string | null
          enrichment_sources: string[] | null
          error_threshold: number | null
          estimated_processing_time_seconds: number | null
          expires_at: string | null
          extracted_entities: Json | null
          fallback_strategy: string | null
          id: string
          insights_generated: string[] | null
          max_retries: number | null
          model_versions: Json | null
          notification_settings: Json | null
          organization_id: string | null
          parallel_processing: boolean | null
          performance_metrics: Json | null
          priority: number | null
          processing_context: Json | null
          processing_logs: Json | null
          processing_metadata: Json | null
          processing_plan: string
          processing_results: Json | null
          queued_at: string | null
          resource_allocation: string | null
          retry_count: number | null
          retry_strategy: string | null
          scheduled_for: string | null
          sensitivity_level: string | null
          source_data_id: string | null
          started_at: string | null
          status: string | null
          team_assignment: string | null
          updated_at: string | null
          user_feedback_score: number | null
          user_id: string | null
          user_instructions: string | null
          user_tags: string[] | null
          validation_rules: Json | null
          webhook_urls: string[] | null
          workflow_steps: Json | null
        }
        Insert: {
          actual_cost_cents?: number | null
          actual_processing_time_seconds?: number | null
          ai_models_enabled?: string[] | null
          ai_processing_level?: string | null
          ai_temperature?: number | null
          approval_required?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          audit_trail?: Json | null
          auto_tags?: string[] | null
          business_domain?: string | null
          completed_at?: string | null
          compliance_checks?: Json | null
          compliance_requirements?: string[] | null
          confidence_scores?: Json | null
          cost_estimate_cents?: number | null
          created_at?: string | null
          current_step?: number | null
          custom_ai_prompt?: string | null
          data_classification?: string | null
          data_lineage?: Json | null
          data_quality_threshold?: number | null
          downstream_systems?: string[] | null
          endpoint_id?: string | null
          enrichment_sources?: string[] | null
          error_threshold?: number | null
          estimated_processing_time_seconds?: number | null
          expires_at?: string | null
          extracted_entities?: Json | null
          fallback_strategy?: string | null
          id?: string
          insights_generated?: string[] | null
          max_retries?: number | null
          model_versions?: Json | null
          notification_settings?: Json | null
          organization_id?: string | null
          parallel_processing?: boolean | null
          performance_metrics?: Json | null
          priority?: number | null
          processing_context?: Json | null
          processing_logs?: Json | null
          processing_metadata?: Json | null
          processing_plan?: string
          processing_results?: Json | null
          queued_at?: string | null
          resource_allocation?: string | null
          retry_count?: number | null
          retry_strategy?: string | null
          scheduled_for?: string | null
          sensitivity_level?: string | null
          source_data_id?: string | null
          started_at?: string | null
          status?: string | null
          team_assignment?: string | null
          updated_at?: string | null
          user_feedback_score?: number | null
          user_id?: string | null
          user_instructions?: string | null
          user_tags?: string[] | null
          validation_rules?: Json | null
          webhook_urls?: string[] | null
          workflow_steps?: Json | null
        }
        Update: {
          actual_cost_cents?: number | null
          actual_processing_time_seconds?: number | null
          ai_models_enabled?: string[] | null
          ai_processing_level?: string | null
          ai_temperature?: number | null
          approval_required?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          audit_trail?: Json | null
          auto_tags?: string[] | null
          business_domain?: string | null
          completed_at?: string | null
          compliance_checks?: Json | null
          compliance_requirements?: string[] | null
          confidence_scores?: Json | null
          cost_estimate_cents?: number | null
          created_at?: string | null
          current_step?: number | null
          custom_ai_prompt?: string | null
          data_classification?: string | null
          data_lineage?: Json | null
          data_quality_threshold?: number | null
          downstream_systems?: string[] | null
          endpoint_id?: string | null
          enrichment_sources?: string[] | null
          error_threshold?: number | null
          estimated_processing_time_seconds?: number | null
          expires_at?: string | null
          extracted_entities?: Json | null
          fallback_strategy?: string | null
          id?: string
          insights_generated?: string[] | null
          max_retries?: number | null
          model_versions?: Json | null
          notification_settings?: Json | null
          organization_id?: string | null
          parallel_processing?: boolean | null
          performance_metrics?: Json | null
          priority?: number | null
          processing_context?: Json | null
          processing_logs?: Json | null
          processing_metadata?: Json | null
          processing_plan?: string
          processing_results?: Json | null
          queued_at?: string | null
          resource_allocation?: string | null
          retry_count?: number | null
          retry_strategy?: string | null
          scheduled_for?: string | null
          sensitivity_level?: string | null
          source_data_id?: string | null
          started_at?: string | null
          status?: string | null
          team_assignment?: string | null
          updated_at?: string | null
          user_feedback_score?: number | null
          user_id?: string | null
          user_instructions?: string | null
          user_tags?: string[] | null
          validation_rules?: Json | null
          webhook_urls?: string[] | null
          workflow_steps?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "data_processor_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_processor_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "enostics_endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_processor_source_data_id_fkey"
            columns: ["source_data_id"]
            isOneToOne: false
            referencedRelation: "data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_processor_source_data_id_fkey"
            columns: ["source_data_id"]
            isOneToOne: false
            referencedRelation: "data_enhanced"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          delivery_attempts: number | null
          email_data: Json | null
          email_type: string
          endpoint_id: string | null
          external_email_id: string | null
          from_address: string
          id: string
          last_delivery_attempt: string | null
          opened_at: string | null
          provider_response: Json | null
          reply_to: string | null
          status: string | null
          subject: string
          template_name: string | null
          to_addresses: string[]
          triggered_by_request_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          delivery_attempts?: number | null
          email_data?: Json | null
          email_type: string
          endpoint_id?: string | null
          external_email_id?: string | null
          from_address: string
          id?: string
          last_delivery_attempt?: string | null
          opened_at?: string | null
          provider_response?: Json | null
          reply_to?: string | null
          status?: string | null
          subject: string
          template_name?: string | null
          to_addresses: string[]
          triggered_by_request_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          delivery_attempts?: number | null
          email_data?: Json | null
          email_type?: string
          endpoint_id?: string | null
          external_email_id?: string | null
          from_address?: string
          id?: string
          last_delivery_attempt?: string | null
          opened_at?: string | null
          provider_response?: Json | null
          reply_to?: string | null
          status?: string | null
          subject?: string
          template_name?: string | null
          to_addresses?: string[]
          triggered_by_request_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enostics_email_logs_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enostics_email_logs_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "enostics_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      endpoints: {
        Row: {
          ai_processing_enabled: boolean | null
          ai_settings: Json | null
          auth_type: string | null
          created_at: string | null
          data_filters: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          last_request_at: string | null
          name: string
          rate_limit_per_hour: number | null
          settings: Json | null
          total_requests: number | null
          updated_at: string | null
          url_path: string
          user_id: string
        }
        Insert: {
          ai_processing_enabled?: boolean | null
          ai_settings?: Json | null
          auth_type?: string | null
          created_at?: string | null
          data_filters?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_request_at?: string | null
          name?: string
          rate_limit_per_hour?: number | null
          settings?: Json | null
          total_requests?: number | null
          updated_at?: string | null
          url_path: string
          user_id: string
        }
        Update: {
          ai_processing_enabled?: boolean | null
          ai_settings?: Json | null
          auth_type?: string | null
          created_at?: string | null
          data_filters?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_request_at?: string | null
          name?: string
          rate_limit_per_hour?: number | null
          settings?: Json | null
          total_requests?: number | null
          updated_at?: string | null
          url_path?: string
          user_id?: string
        }
        Relationships: []
      }
      enostics_request_logs: {
        Row: {
          created_at: string | null
          endpoint_id: string | null
          error_message: string | null
          id: string
          method: string | null
          response_time_ms: number | null
          source_ip: unknown | null
          status_code: number
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint_id?: string | null
          error_message?: string | null
          id?: string
          method?: string | null
          response_time_ms?: number | null
          source_ip?: unknown | null
          status_code: number
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint_id?: string | null
          error_message?: string | null
          id?: string
          method?: string | null
          response_time_ms?: number | null
          source_ip?: unknown | null
          status_code?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enostics_request_logs_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enostics_request_logs_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "enostics_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      filters: {
        Row: {
          actions: Json | null
          conditions: Json
          created_at: string | null
          endpoint_id: string
          execution_order: number | null
          filter_name: string
          filter_type: string
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          actions?: Json | null
          conditions: Json
          created_at?: string | null
          endpoint_id: string
          execution_order?: number | null
          filter_name: string
          filter_type: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          actions?: Json | null
          conditions?: Json
          created_at?: string | null
          endpoint_id?: string
          execution_order?: number | null
          filter_name?: string
          filter_type?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enostics_data_filters_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enostics_data_filters_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "enostics_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      inbox: {
        Row: {
          abuse_score: number | null
          agent_processed: boolean | null
          api_key_used: string | null
          content_length: number | null
          content_type: string | null
          created_at: string | null
          endpoint_id: string | null
          id: string
          is_authenticated: boolean | null
          is_suspicious: boolean | null
          method: string
          payload: Json
          payload_source: string | null
          payload_type: string | null
          processed_at: string | null
          referer: string | null
          source_ip: unknown | null
          user_agent: string | null
          user_id: string
          webhook_response: string | null
          webhook_sent: boolean | null
          webhook_status: number | null
        }
        Insert: {
          abuse_score?: number | null
          agent_processed?: boolean | null
          api_key_used?: string | null
          content_length?: number | null
          content_type?: string | null
          created_at?: string | null
          endpoint_id?: string | null
          id?: string
          is_authenticated?: boolean | null
          is_suspicious?: boolean | null
          method?: string
          payload: Json
          payload_source?: string | null
          payload_type?: string | null
          processed_at?: string | null
          referer?: string | null
          source_ip?: unknown | null
          user_agent?: string | null
          user_id: string
          webhook_response?: string | null
          webhook_sent?: boolean | null
          webhook_status?: number | null
        }
        Update: {
          abuse_score?: number | null
          agent_processed?: boolean | null
          api_key_used?: string | null
          content_length?: number | null
          content_type?: string | null
          created_at?: string | null
          endpoint_id?: string | null
          id?: string
          is_authenticated?: boolean | null
          is_suspicious?: boolean | null
          method?: string
          payload?: Json
          payload_source?: string | null
          payload_type?: string | null
          processed_at?: string | null
          referer?: string | null
          source_ip?: unknown | null
          user_agent?: string | null
          user_id?: string
          webhook_response?: string | null
          webhook_sent?: boolean | null
          webhook_status?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "enostics_public_inbox_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enostics_public_inbox_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "enostics_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      inbox_config: {
        Row: {
          allowed_api_key_id: string | null
          allowed_sources: string[] | null
          auto_agent_process: boolean | null
          auto_webhook: boolean | null
          blocked_ips: unknown[] | null
          created_at: string | null
          id: string
          is_public: boolean | null
          max_payload_size: number | null
          rate_limit_per_day: number | null
          rate_limit_per_hour: number | null
          requires_api_key: boolean | null
          updated_at: string | null
          user_id: string
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          allowed_api_key_id?: string | null
          allowed_sources?: string[] | null
          auto_agent_process?: boolean | null
          auto_webhook?: boolean | null
          blocked_ips?: unknown[] | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          max_payload_size?: number | null
          rate_limit_per_day?: number | null
          rate_limit_per_hour?: number | null
          requires_api_key?: boolean | null
          updated_at?: string | null
          user_id: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          allowed_api_key_id?: string | null
          allowed_sources?: string[] | null
          auto_agent_process?: boolean | null
          auto_webhook?: boolean | null
          blocked_ips?: unknown[] | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          max_payload_size?: number | null
          rate_limit_per_day?: number | null
          rate_limit_per_hour?: number | null
          requires_api_key?: boolean | null
          updated_at?: string | null
          user_id?: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      integration_configs: {
        Row: {
          auth_url: string | null
          base_url: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          rate_limit: Json | null
          required_fields: string[] | null
          scopes: string[] | null
          test_endpoint: string | null
          token_url: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          auth_url?: string | null
          base_url?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id: string
          name: string
          rate_limit?: Json | null
          required_fields?: string[] | null
          scopes?: string[] | null
          test_endpoint?: string | null
          token_url?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          auth_url?: string | null
          base_url?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          rate_limit?: Json | null
          required_fields?: string[] | null
          scopes?: string[] | null
          test_endpoint?: string | null
          token_url?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      integrations: {
        Row: {
          configuration: Json | null
          created_at: string | null
          created_by: string | null
          credentials: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          name: string
          organization_id: string | null
          type: Database["public"]["Enums"]["integration_type"]
          updated_at: string | null
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          credentials?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          name: string
          organization_id?: string | null
          type: Database["public"]["Enums"]["integration_type"]
          updated_at?: string | null
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          credentials?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          name?: string
          organization_id?: string | null
          type?: Database["public"]["Enums"]["integration_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "integrations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integrations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integrations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      keys: {
        Row: {
          created_at: string | null
          endpoint_id: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_name: string
          key_prefix: string
          last_used_at: string | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          endpoint_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_name: string
          key_prefix: string
          last_used_at?: string | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          endpoint_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_name?: string
          key_prefix?: string
          last_used_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "enostics_api_keys_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enostics_api_keys_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "enostics_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          action: string
          category: string
          created_at: string | null
          details: Json | null
          email_id: string | null
          endpoint_id: string | null
          error_code: string | null
          error_message: string | null
          id: string
          log_type: string
          metadata: Json | null
          payload_size: number | null
          request_id: string | null
          response_time_ms: number | null
          source_identifier: string | null
          source_type: string | null
          stack_trace: string | null
          status: string
          user_id: string
        }
        Insert: {
          action: string
          category: string
          created_at?: string | null
          details?: Json | null
          email_id?: string | null
          endpoint_id?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          log_type: string
          metadata?: Json | null
          payload_size?: number | null
          request_id?: string | null
          response_time_ms?: number | null
          source_identifier?: string | null
          source_type?: string | null
          stack_trace?: string | null
          status?: string
          user_id: string
        }
        Update: {
          action?: string
          category?: string
          created_at?: string | null
          details?: Json | null
          email_id?: string | null
          endpoint_id?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          log_type?: string
          metadata?: Json | null
          payload_size?: number | null
          request_id?: string | null
          response_time_ms?: number | null
          source_identifier?: string | null
          source_type?: string | null
          stack_trace?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enostics_activity_logs_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enostics_activity_logs_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "enostics_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          contact_id: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_attempts: number | null
          error_message: string | null
          id: string
          message_body: string | null
          message_type: string
          payload: Json
          payload_source: string | null
          payload_type: string | null
          read_at: string | null
          recipient_endpoint_url: string | null
          recipient_user_id: string
          retry_count: number | null
          sender_endpoint_id: string | null
          sender_user_id: string
          status: string | null
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_attempts?: number | null
          error_message?: string | null
          id?: string
          message_body?: string | null
          message_type?: string
          payload: Json
          payload_source?: string | null
          payload_type?: string | null
          read_at?: string | null
          recipient_endpoint_url?: string | null
          recipient_user_id: string
          retry_count?: number | null
          sender_endpoint_id?: string | null
          sender_user_id: string
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_attempts?: number | null
          error_message?: string | null
          id?: string
          message_body?: string | null
          message_type?: string
          payload?: Json
          payload_source?: string | null
          payload_type?: string | null
          read_at?: string | null
          recipient_endpoint_url?: string | null
          recipient_user_id?: string
          retry_count?: number | null
          sender_endpoint_id?: string | null
          sender_user_id?: string
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enostics_outbound_messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enostics_outbound_messages_sender_endpoint_id_fkey"
            columns: ["sender_endpoint_id"]
            isOneToOne: false
            referencedRelation: "endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enostics_outbound_messages_sender_endpoint_id_fkey"
            columns: ["sender_endpoint_id"]
            isOneToOne: false
            referencedRelation: "enostics_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      models: {
        Row: {
          configuration: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          model_name: string
          model_type: string
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          configuration: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          model_name: string
          model_type: string
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          configuration?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          model_name?: string
          model_type?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          message: string
          organization_id: string | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          organization_id?: string | null
          read_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          organization_id?: string | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding: {
        Row: {
          biggest_challenges: string[] | null
          budget_range: string | null
          completed_at: string | null
          created_at: string | null
          current_step: string | null
          current_workflow_tools: string[] | null
          id: string
          integration_requirements: string[] | null
          location: string | null
          manual_processes: string[] | null
          onboarding_completed: boolean | null
          organization_created: boolean | null
          organization_id: string | null
          practice_name: string | null
          practice_size: string | null
          practice_type: string | null
          preferred_support: string | null
          primary_goals: string[] | null
          primary_interest: string | null
          specific_needs: string[] | null
          tech_comfort_level: string | null
          time_spent_on_admin: number | null
          timeline: string | null
          updated_at: string | null
          user_id: string | null
          years_in_operation: number | null
        }
        Insert: {
          biggest_challenges?: string[] | null
          budget_range?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_step?: string | null
          current_workflow_tools?: string[] | null
          id?: string
          integration_requirements?: string[] | null
          location?: string | null
          manual_processes?: string[] | null
          onboarding_completed?: boolean | null
          organization_created?: boolean | null
          organization_id?: string | null
          practice_name?: string | null
          practice_size?: string | null
          practice_type?: string | null
          preferred_support?: string | null
          primary_goals?: string[] | null
          primary_interest?: string | null
          specific_needs?: string[] | null
          tech_comfort_level?: string | null
          time_spent_on_admin?: number | null
          timeline?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_in_operation?: number | null
        }
        Update: {
          biggest_challenges?: string[] | null
          budget_range?: string | null
          completed_at?: string | null
          created_at?: string | null
          current_step?: string | null
          current_workflow_tools?: string[] | null
          id?: string
          integration_requirements?: string[] | null
          location?: string | null
          manual_processes?: string[] | null
          onboarding_completed?: boolean | null
          organization_created?: boolean | null
          organization_id?: string | null
          practice_name?: string | null
          practice_size?: string | null
          practice_type?: string | null
          preferred_support?: string | null
          primary_goals?: string[] | null
          primary_interest?: string | null
          specific_needs?: string[] | null
          tech_comfort_level?: string | null
          time_spent_on_admin?: number | null
          timeline?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_in_operation?: number | null
        }
        Relationships: []
      }
      organization_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_status: string | null
          invited_by: string | null
          organization_id: string | null
          role: string
          token: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_status?: string | null
          invited_by?: string | null
          organization_id?: string | null
          role?: string
          token?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_status?: string | null
          invited_by?: string | null
          organization_id?: string | null
          role?: string
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          created_by: string | null
          custom_permissions: Json | null
          custom_role: string | null
          department: string | null
          invitation_email: string | null
          invitation_status: string | null
          is_active: boolean | null
          joined_at: string | null
          last_active_at: string | null
          organization_id: string
          permissions: Json
          profile_id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          custom_permissions?: Json | null
          custom_role?: string | null
          department?: string | null
          invitation_email?: string | null
          invitation_status?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          last_active_at?: string | null
          organization_id: string
          permissions?: Json
          profile_id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          custom_permissions?: Json | null
          custom_role?: string | null
          department?: string | null
          invitation_email?: string | null
          invitation_status?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          last_active_at?: string | null
          organization_id?: string
          permissions?: Json
          profile_id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "organization_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_cycle: string | null
          billing_mode: string | null
          cancel_at_period_end: boolean | null
          compliance_requirements: Json | null
          created_at: string | null
          created_by: string | null
          current_month_executions: number | null
          deleted_at: string | null
          description: string | null
          domain: string | null
          employee_count: number | null
          execution_reset_date: string | null
          grace_period_ends_at: string | null
          id: string
          industry: string | null
          logo_url: string | null
          max_executions_per_month: number | null
          max_storage: number
          max_users: number
          max_workflows: number | null
          name: string
          next_billing_date: string | null
          plan: string | null
          plan_features: Json | null
          renewal_date: string | null
          settings: Json
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          tokens: number | null
          trial_ends_at: string | null
          updated_at: string | null
          usage_limits: Json | null
          website: string | null
        }
        Insert: {
          billing_cycle?: string | null
          billing_mode?: string | null
          cancel_at_period_end?: boolean | null
          compliance_requirements?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_month_executions?: number | null
          deleted_at?: string | null
          description?: string | null
          domain?: string | null
          employee_count?: number | null
          execution_reset_date?: string | null
          grace_period_ends_at?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          max_executions_per_month?: number | null
          max_storage?: number
          max_users?: number
          max_workflows?: number | null
          name: string
          next_billing_date?: string | null
          plan?: string | null
          plan_features?: Json | null
          renewal_date?: string | null
          settings?: Json
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          tokens?: number | null
          trial_ends_at?: string | null
          updated_at?: string | null
          usage_limits?: Json | null
          website?: string | null
        }
        Update: {
          billing_cycle?: string | null
          billing_mode?: string | null
          cancel_at_period_end?: boolean | null
          compliance_requirements?: Json | null
          created_at?: string | null
          created_by?: string | null
          current_month_executions?: number | null
          deleted_at?: string | null
          description?: string | null
          domain?: string | null
          employee_count?: number | null
          execution_reset_date?: string | null
          grace_period_ends_at?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          max_executions_per_month?: number | null
          max_storage?: number
          max_users?: number
          max_workflows?: number | null
          name?: string
          next_billing_date?: string | null
          plan?: string | null
          plan_features?: Json | null
          renewal_date?: string | null
          settings?: Json
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          tokens?: number | null
          trial_ends_at?: string | null
          updated_at?: string | null
          usage_limits?: Json | null
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auto_save_enabled: boolean | null
          avatar_url: string | null
          bio: string | null
          canvas_grid_enabled: boolean | null
          canvas_snap_enabled: boolean | null
          company: string | null
          created_at: string
          department: string | null
          display_name: string | null
          email: string | null
          expertise: string[] | null
          full_name: string
          id: string
          industry: string | null
          interests: string[] | null
          job_title: string | null
          language: string | null
          last_active_at: string | null
          location: string | null
          manager_id: string | null
          notification_settings: Json | null
          notifications_enabled: boolean | null
          onboarding_completed: boolean | null
          onboarding_steps: Json | null
          organization_id: string | null
          permissions: Json | null
          phone: string | null
          plan_tier: string | null
          preferences: Json | null
          privacy_settings: Json | null
          profile_completed_at: string | null
          profile_emoji: string | null
          public_id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          settings: Json | null
          show_full_name: boolean | null
          subscription_id: string | null
          theme: string | null
          timezone: string | null
          ui_settings: Json | null
          updated_at: string
          username: string | null
          years_of_experience: number | null
        }
        Insert: {
          auto_save_enabled?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          canvas_grid_enabled?: boolean | null
          canvas_snap_enabled?: boolean | null
          company?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          email?: string | null
          expertise?: string[] | null
          full_name: string
          id: string
          industry?: string | null
          interests?: string[] | null
          job_title?: string | null
          language?: string | null
          last_active_at?: string | null
          location?: string | null
          manager_id?: string | null
          notification_settings?: Json | null
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_steps?: Json | null
          organization_id?: string | null
          permissions?: Json | null
          phone?: string | null
          plan_tier?: string | null
          preferences?: Json | null
          privacy_settings?: Json | null
          profile_completed_at?: string | null
          profile_emoji?: string | null
          public_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          settings?: Json | null
          show_full_name?: boolean | null
          subscription_id?: string | null
          theme?: string | null
          timezone?: string | null
          ui_settings?: Json | null
          updated_at?: string
          username?: string | null
          years_of_experience?: number | null
        }
        Update: {
          auto_save_enabled?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          canvas_grid_enabled?: boolean | null
          canvas_snap_enabled?: boolean | null
          company?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          email?: string | null
          expertise?: string[] | null
          full_name?: string
          id?: string
          industry?: string | null
          interests?: string[] | null
          job_title?: string | null
          language?: string | null
          last_active_at?: string | null
          location?: string | null
          manager_id?: string | null
          notification_settings?: Json | null
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_steps?: Json | null
          organization_id?: string | null
          permissions?: Json | null
          phone?: string | null
          plan_tier?: string | null
          preferences?: Json | null
          privacy_settings?: Json | null
          profile_completed_at?: string | null
          profile_emoji?: string | null
          public_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          settings?: Json | null
          show_full_name?: boolean | null
          subscription_id?: string | null
          theme?: string | null
          timezone?: string | null
          ui_settings?: Json | null
          updated_at?: string
          username?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "fk_profiles_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_email: string | null
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          organization_id: string | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          status: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          usage_current: Json | null
          usage_limits: Json | null
        }
        Insert: {
          billing_email?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: string
          organization_id?: string | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          usage_current?: Json | null
          usage_limits?: Json | null
        }
        Update: {
          billing_email?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          organization_id?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          usage_current?: Json | null
          usage_limits?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestions: {
        Row: {
          action_taken_at: string | null
          confidence_score: number | null
          created_at: string | null
          id: string
          last_suggested_at: string | null
          suggested_user_id: string
          suggestion_reason: string | null
          suggestion_type: string
          times_suggested: number | null
          user_action: string | null
          user_id: string
        }
        Insert: {
          action_taken_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          last_suggested_at?: string | null
          suggested_user_id: string
          suggestion_reason?: string | null
          suggestion_type: string
          times_suggested?: number | null
          user_action?: string | null
          user_id: string
        }
        Update: {
          action_taken_at?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          last_suggested_at?: string | null
          suggested_user_id?: string
          suggestion_reason?: string | null
          suggestion_type?: string
          times_suggested?: number | null
          user_action?: string | null
          user_id?: string
        }
        Relationships: []
      }
      usage_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          organization_id: string | null
          quantity: number | null
          resource_id: string | null
          resource_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          quantity?: number | null
          resource_id?: string | null
          resource_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          quantity?: number | null
          resource_id?: string | null
          resource_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "usage_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "usage_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          auto_save_enabled: boolean | null
          canvas_grid_enabled: boolean | null
          canvas_snap_enabled: boolean | null
          created_at: string | null
          id: string
          language: string | null
          notifications_enabled: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_save_enabled?: boolean | null
          canvas_grid_enabled?: boolean | null
          canvas_snap_enabled?: boolean | null
          created_at?: string | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_save_enabled?: boolean | null
          canvas_grid_enabled?: boolean | null
          canvas_snap_enabled?: boolean | null
          created_at?: string | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      workflows: {
        Row: {
          ai_assistance_enabled: boolean | null
          auto_optimization_enabled: boolean | null
          canvas_x: number | null
          canvas_y: number | null
          canvas_zoom: number | null
          created_at: string | null
          description: string | null
          edges: Json | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          metadata: Json | null
          nodes: Json | null
          notification_settings: Json | null
          status: string | null
          tags: string[] | null
          test_categories: string[] | null
          title: string
          trigger_conditions: Json | null
          updated_at: string | null
          user_id: string | null
          version: number | null
          workflow_type: string | null
        }
        Insert: {
          ai_assistance_enabled?: boolean | null
          auto_optimization_enabled?: boolean | null
          canvas_x?: number | null
          canvas_y?: number | null
          canvas_zoom?: number | null
          created_at?: string | null
          description?: string | null
          edges?: Json | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          metadata?: Json | null
          nodes?: Json | null
          notification_settings?: Json | null
          status?: string | null
          tags?: string[] | null
          test_categories?: string[] | null
          title?: string
          trigger_conditions?: Json | null
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
          workflow_type?: string | null
        }
        Update: {
          ai_assistance_enabled?: boolean | null
          auto_optimization_enabled?: boolean | null
          canvas_x?: number | null
          canvas_y?: number | null
          canvas_zoom?: number | null
          created_at?: string | null
          description?: string | null
          edges?: Json | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          metadata?: Json | null
          nodes?: Json | null
          notification_settings?: Json | null
          status?: string | null
          tags?: string[] | null
          test_categories?: string[] | null
          title?: string
          trigger_conditions?: Json | null
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
          workflow_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      data_enhanced: {
        Row: {
          ai_insights: Json | null
          auto_tags: string[] | null
          business_context: string | null
          content_type: string | null
          data: Json | null
          data_quality_score: number | null
          data_size: number | null
          display_category: string | null
          display_sender: string | null
          endpoint_id: string | null
          enriched_data: Json | null
          headers: Json | null
          id: string | null
          is_archived: boolean | null
          is_favorite: boolean | null
          key_fields: string[] | null
          processed_at: string | null
          processed_by_ai: boolean | null
          quality_level: string | null
          sender_info: Json | null
          sensitive_data: boolean | null
          source_ip: unknown | null
          status: string | null
          tags: string[] | null
          user_agent: string | null
          user_category: string | null
          user_notes: string | null
        }
        Insert: {
          ai_insights?: Json | null
          auto_tags?: string[] | null
          business_context?: string | null
          content_type?: string | null
          data?: Json | null
          data_quality_score?: number | null
          data_size?: number | null
          display_category?: never
          display_sender?: never
          endpoint_id?: string | null
          enriched_data?: Json | null
          headers?: Json | null
          id?: string | null
          is_archived?: boolean | null
          is_favorite?: boolean | null
          key_fields?: string[] | null
          processed_at?: string | null
          processed_by_ai?: boolean | null
          quality_level?: never
          sender_info?: Json | null
          sensitive_data?: boolean | null
          source_ip?: unknown | null
          status?: string | null
          tags?: string[] | null
          user_agent?: string | null
          user_category?: string | null
          user_notes?: string | null
        }
        Update: {
          ai_insights?: Json | null
          auto_tags?: string[] | null
          business_context?: string | null
          content_type?: string | null
          data?: Json | null
          data_quality_score?: number | null
          data_size?: number | null
          display_category?: never
          display_sender?: never
          endpoint_id?: string | null
          enriched_data?: Json | null
          headers?: Json | null
          id?: string | null
          is_archived?: boolean | null
          is_favorite?: boolean | null
          key_fields?: string[] | null
          processed_at?: string | null
          processed_by_ai?: boolean | null
          quality_level?: never
          sender_info?: Json | null
          sensitive_data?: boolean | null
          source_ip?: unknown | null
          status?: string | null
          tags?: string[] | null
          user_agent?: string | null
          user_category?: string | null
          user_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enostics_data_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enostics_data_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "enostics_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      enostics_endpoints: {
        Row: {
          created_at: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          path: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          path?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          path?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      organization_users: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          joined_at: string | null
          organization_id: string | null
          organization_name: string | null
          profile_id: string | null
          role: string | null
        }
        Relationships: []
      }
      user_details: {
        Row: {
          auth_created_at: string | null
          avatar_url: string | null
          bio: string | null
          confirmed_at: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string | null
          last_active_at: string | null
          last_sign_in_at: string | null
          location: string | null
          phone: string | null
          preferences: Json | null
          timezone: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string | null
          industry: string | null
          job_title: string | null
          language: string | null
          last_active_at: string | null
          location: string | null
          notification_settings: Json | null
          notifications_enabled: boolean | null
          onboarding_completed: boolean | null
          onboarding_steps: Json | null
          organization_id: string | null
          phone: string | null
          plan_tier: string | null
          preferences: Json | null
          privacy_settings: Json | null
          profile_completed_at: string | null
          theme: string | null
          timezone: string | null
          ui_settings: Json | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          industry?: string | null
          job_title?: string | null
          language?: string | null
          last_active_at?: string | null
          location?: string | null
          notification_settings?: Json | null
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_steps?: Json | null
          organization_id?: string | null
          phone?: string | null
          plan_tier?: string | null
          preferences?: Json | null
          privacy_settings?: Json | null
          profile_completed_at?: string | null
          theme?: string | null
          timezone?: string | null
          ui_settings?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          industry?: string | null
          job_title?: string | null
          language?: string | null
          last_active_at?: string | null
          location?: string | null
          notification_settings?: Json | null
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_steps?: Json | null
          organization_id?: string | null
          phone?: string | null
          plan_tier?: string | null
          preferences?: Json | null
          privacy_settings?: Json | null
          profile_completed_at?: string | null
          theme?: string | null
          timezone?: string | null
          ui_settings?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "fk_profiles_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_article_view: {
        Args: { article_slug: string }
        Returns: undefined
      }
      add_enostics_contact: {
        Args: {
          p_contact_username: string
          p_display_name?: string
          p_relationship_type?: string
        }
        Returns: string
      }
      api_cleanup_database: {
        Args: { keep_organizations?: string[] }
        Returns: Json
      }
      archive_inactive_data: {
        Args: { inactive_days?: number }
        Returns: Json
      }
      auto_queue_data_for_processing: {
        Args: { data_id: string; processing_plan_override?: string }
        Returns: string
      }
      can_access_org_content: {
        Args: { org_id: string; user_id?: string }
        Returns: boolean
      }
      can_access_organization: {
        Args: { user_id: string; org_id: string }
        Returns: boolean
      }
      can_manage_org_content: {
        Args: { org_id: string; user_id?: string }
        Returns: boolean
      }
      can_manage_organization: {
        Args: { user_id: string; org_id: string }
        Returns: boolean
      }
      clean_orphaned_organizations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_operations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_orphaned_documents: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_test_data: {
        Args: { keep_org_ids: string[] }
        Returns: Json
      }
      complete_onboarding_step: {
        Args: { user_id: string; step_name: string }
        Returns: boolean
      }
      create_organization: {
        Args: { org_name: string; org_description?: string; org_plan?: string }
        Returns: string
      }
      duplicate_workflow: {
        Args: {
          original_workflow_id: string
          new_title: string
          user_id_param: string
        }
        Returns: string
      }
      ensure_organization_creator_membership: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      ensure_user_organization_access: {
        Args: { user_uuid: string; org_uuid: string; user_role?: string }
        Returns: boolean
      }
      generate_public_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_article_by_slug: {
        Args: { article_slug: string }
        Returns: {
          id: string
          title: string
          slug: string
          summary: string
          abstract: string
          reading_time: number
          author_name: string
          author_title: string
          author_avatar_url: string
          content_json: Json
          featured_image_url: string
          social_image_url: string
          category_id: string
          category_name: string
          category_slug: string
          tags: string[]
          view_count: number
          published_at: string
          created_at: string
          updated_at: string
        }[]
      }
      get_comments_with_profiles: {
        Args: { post_id_param: string }
        Returns: {
          id: string
          content: string
          author_id: string
          post_id: string
          parent_id: string
          is_solution: boolean
          created_at: string
          updated_at: string
          author_name: string
          author_avatar_url: string
        }[]
      }
      get_comments_with_public_profiles: {
        Args: { post_id_param: string }
        Returns: {
          id: string
          content: string
          post_id: string
          parent_id: string
          is_solution: boolean
          created_at: string
          updated_at: string
          author_username: string
          author_public_id: string
          author_emoji: string
          author_avatar_url: string
        }[]
      }
      get_data_processor_stats: {
        Args: { user_uuid: string }
        Returns: Json
      }
      get_enhanced_workflow_content: {
        Args: { p_workflow_id: string }
        Returns: {
          content_id: string
          canvas_data: Json
          node_templates: Json
          node_instances: Json
        }[]
      }
      get_forum_post_with_author: {
        Args: { post_id_param: string }
        Returns: {
          id: string
          title: string
          content: string
          author_id: string
          category_id: string
          status: string
          slug: string
          view_count: number
          comment_count: number
          is_pinned: boolean
          created_at: string
          updated_at: string
          author_name: string
          author_avatar_url: string
          author_job_title: string
        }[]
      }
      get_forum_post_with_public_author: {
        Args: { post_id_param: string }
        Returns: {
          id: string
          title: string
          content: string
          category_id: string
          status: string
          slug: string
          view_count: number
          comment_count: number
          is_pinned: boolean
          created_at: string
          updated_at: string
          author_username: string
          author_public_id: string
          author_emoji: string
          author_avatar_url: string
          author_bio: string
        }[]
      }
      get_my_organizations_complete: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
          plan: string
          role: string
          subscription_status: string
          tokens: number
          created_at: string
          member_count: number
          folder_count: number
          document_count: number
          is_owner: boolean
          last_activity: string
        }[]
      }
      get_news_categories_with_count: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          slug: string
          description: string
          article_count: number
        }[]
      }
      get_organization_details: {
        Args: { org_id: string }
        Returns: {
          id: string
          name: string
          description: string
          plan: string
          subscription_status: string
          tokens: number
          created_at: string
          member_count: number
          folder_count: number
          document_count: number
          created_by: string
          created_by_name: string
        }[]
      }
      get_organization_member_count: {
        Args: { org_id: string }
        Returns: number
      }
      get_organization_resources: {
        Args: { org_id: string }
        Returns: {
          folder_id: string
          folder_name: string
          folder_parent_id: string
          document_count: number
        }[]
      }
      get_public_profile: {
        Args: { public_id_param: string }
        Returns: {
          public_id: string
          username: string
          profile_emoji: string
          avatar_url: string
          bio: string
          display_name: string
          full_name: string
          show_full_name: boolean
        }[]
      }
      get_public_profile_by_id: {
        Args: { profile_id_param: string }
        Returns: {
          public_id: string
          username: string
          profile_emoji: string
          avatar_url: string
          bio: string
          display_name: string
        }[]
      }
      get_user_organizations: {
        Args: Record<PropertyKey, never> | { user_id?: string }
        Returns: {
          id: string
          name: string
          role: string
          plan: string
        }[]
      }
      get_user_recent_documents_with_details: {
        Args: { p_user_id: string; p_date_threshold: string; p_limit?: number }
        Returns: {
          id: string
          title: string
          content: string
          emoji: string
          cover_color: string
          font_size: number
          created_at: string
          updated_at: string
          created_by: string
          primary_entity_id: string
          folder_id: string
          status: string
          version: number
          organization_id: string
          folder_name: string
          organization_name: string
          organization_description: string
        }[]
      }
      get_user_role_in_organization: {
        Args: { user_id: string; org_id: string }
        Returns: string
      }
      get_workflow_stats: {
        Args: { user_id_param: string }
        Returns: {
          total_workflows: number
          active_workflows: number
          total_executions: number
          avg_executions_per_workflow: number
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_forum_post_views: {
        Args: { post_id_param: string }
        Returns: undefined
      }
      increment_post_views: {
        Args: { post_id: string }
        Returns: undefined
      }
      increment_workflow_execution_count: {
        Args: { workflow_id: string }
        Returns: undefined
      }
      invite_organization_member: {
        Args: { org_id: string; user_email: string; member_role?: string }
        Returns: Json
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_member_of_org: {
        Args: { org_id: string; user_id?: string }
        Returns: boolean
      }
      is_organization_member: {
        Args: { org_id: string }
        Returns: boolean
      }
      is_owner_of_org: {
        Args: { org_id: string; user_id?: string }
        Returns: boolean
      }
      log_activity: {
        Args: {
          p_user_id: string
          p_log_type: string
          p_category: string
          p_action: string
          p_status?: string
          p_source_identifier?: string
          p_source_type?: string
          p_details?: Json
          p_metadata?: Json
          p_endpoint_id?: string
          p_request_id?: string
          p_email_id?: string
          p_response_time_ms?: number
          p_payload_size?: number
          p_error_code?: string
          p_error_message?: string
        }
        Returns: string
      }
      needs_onboarding: {
        Args: { user_id: string }
        Returns: boolean
      }
      process_next_queue_item: {
        Args: { user_uuid?: string; priority_filter?: number }
        Returns: string
      }
      purge_old_deleted_items: {
        Args: { days_threshold?: number }
        Returns: Json
      }
      rpc_user_graph: {
        Args: { p_uid: string }
        Returns: Json
      }
      save_advanced_workflow_canvas: {
        Args: {
          p_workflow_id: string
          p_canvas_data: Json
          p_auto_publish?: boolean
        }
        Returns: string
      }
      save_onboarding_response: {
        Args: {
          question_id: string
          question_text: string
          response: string
          user_id?: string
        }
        Returns: Json
      }
      save_workflow_canvas: {
        Args: {
          p_workflow_id: string
          p_canvas_data: Json
          p_auto_publish?: boolean
        }
        Returns: string
      }
      search_documents_fts: {
        Args: { org_id: string; search_query: string; result_limit?: number }
        Returns: {
          id: string
          title: string
          content: string
          emoji: string
          created_at: string
          updated_at: string
          rank: number
        }[]
      }
      search_workflows: {
        Args: {
          user_id_param: string
          search_query?: string
          workflow_type_param?: string
          status_param?: string
          tags_param?: string[]
        }
        Returns: {
          id: string
          title: string
          description: string
          workflow_type: string
          status: string
          is_active: boolean
          execution_count: number
          last_executed_at: string
          created_at: string
          tags: string[]
          test_categories: string[]
        }[]
      }
      send_to_enostics_user: {
        Args: {
          p_recipient_username: string
          p_payload: Json
          p_subject?: string
          p_message_body?: string
        }
        Returns: string
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      soft_delete_item: {
        Args: { table_name: string; item_id: string }
        Returns: boolean
      }
      update_onboarding_step: {
        Args: { step_name: string; completed?: boolean; user_id?: string }
        Returns: Json
      }
      user_can_access_workflow_org: {
        Args: { org_id: string; user_id?: string }
        Returns: boolean
      }
      user_can_access_workflow_organization: {
        Args: { org_id: string; user_id?: string }
        Returns: boolean
      }
      user_is_org_member: {
        Args: { org_id: string; user_id?: string }
        Returns: boolean
      }
      user_is_org_member_simple: {
        Args: { org_id: string }
        Returns: boolean
      }
      user_is_workflow_owner: {
        Args: { workflow_owner_id: string; user_id?: string }
        Returns: boolean
      }
      user_owns_workflow: {
        Args: { workflow_id: string; user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      agent_status: "draft" | "testing" | "active" | "paused" | "archived"
      command_type:
        | "trigger"
        | "collect"
        | "transform"
        | "store"
        | "send"
        | "decide"
        | "loop"
        | "predict"
      deployment_status:
        | "pending"
        | "deploying"
        | "running"
        | "stopped"
        | "failed"
      execution_status:
        | "pending"
        | "running"
        | "success"
        | "error"
        | "cancelled"
        | "timeout"
        | "waiting"
      integration_type: "api" | "webhook" | "database" | "messaging" | "storage"
      message_role: "user" | "assistant"
      notification_type: "info" | "warning" | "error" | "success"
      subscription_plan: "starter" | "professional" | "enterprise" | "custom"
      transcription_status: "pending" | "processing" | "completed" | "failed"
      usage_metric_type:
        | "audio_minutes"
        | "tokens_used"
        | "api_calls"
        | "storage_bytes"
      user_role:
        | "super_admin"
        | "org_admin"
        | "manager"
        | "developer"
        | "viewer"
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
      agent_status: ["draft", "testing", "active", "paused", "archived"],
      command_type: [
        "trigger",
        "collect",
        "transform",
        "store",
        "send",
        "decide",
        "loop",
        "predict",
      ],
      deployment_status: [
        "pending",
        "deploying",
        "running",
        "stopped",
        "failed",
      ],
      execution_status: [
        "pending",
        "running",
        "success",
        "error",
        "cancelled",
        "timeout",
        "waiting",
      ],
      integration_type: ["api", "webhook", "database", "messaging", "storage"],
      message_role: ["user", "assistant"],
      notification_type: ["info", "warning", "error", "success"],
      subscription_plan: ["starter", "professional", "enterprise", "custom"],
      transcription_status: ["pending", "processing", "completed", "failed"],
      usage_metric_type: [
        "audio_minutes",
        "tokens_used",
        "api_calls",
        "storage_bytes",
      ],
      user_role: ["super_admin", "org_admin", "manager", "developer", "viewer"],
    },
  },
} as const
