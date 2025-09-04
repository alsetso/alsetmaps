import { supabase } from '@/integrations/supabase/client';
import { RefinanceFormData } from '../types/refinance-request';

export interface RefinanceSubmissionResponse {
  success: boolean;
  message: string;
  refinanceId?: string;
}

export interface RefinanceRecord {
  id: string;
  user_id?: string;
  session_id?: string;
  anonymous_id?: string;
  
  // Personal Information
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  
     // Property Information
   property_address: string;
   property_city: string;
   property_state: string;
   property_zip?: string;
   latitude?: string;
   longitude?: string;
   current_property_value: number;
  
  // Current Loan Information
  current_lender: string;
  current_loan_balance: number;
  current_interest_rate: number;
  current_monthly_payment: number;
  current_loan_term: number;
  current_loan_type: string;
  current_pmi_amount?: number;
  
  // Refinance Goals
  refinance_type: string;
  primary_reason: string;
  cash_out_amount?: number;
  
  // Financial Profile
  credit_score_range: string;
  gross_monthly_income?: number;
  employment_status?: string;
  years_employed?: number;
  
  // Timeline
  timeline: string;
  urgency_reason?: string;
  
  // Additional Information
  additional_notes?: string;
  special_circumstances?: string;
  
  // Status
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed' | 'expired';
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export class RefinanceTableService {
  /**
   * Submit a refinance request
   */
  static async submitRefinanceRequest(
    data: RefinanceFormData, 
    sessionId?: string, 
    anonymousId?: string
  ): Promise<RefinanceSubmissionResponse> {
    try {
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      // Prepare submission data
      const submissionData = {
        user_id: user?.id || null,
        session_id: sessionId || null,
        anonymous_id: anonymousId || null,
        
        // Personal Information
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        
                 // Property Information
         property_address: data.propertyAddress,
         property_city: data.propertyCity,
         property_state: data.propertyState,
         property_zip: data.propertyZip,
         latitude: null,
         longitude: null,
        current_property_value: data.currentPropertyValue,
        
        // Current Loan Information
        current_lender: data.currentLender,
        current_loan_balance: data.currentLoanBalance,
        current_interest_rate: data.currentInterestRate,
        current_monthly_payment: data.currentMonthlyPayment,
        current_loan_term: data.currentLoanTerm,
        current_loan_type: data.currentLoanType,
        current_pmi_amount: data.currentPmiAmount || 0,
        
        // Refinance Goals
        refinance_type: data.refinanceType,
        primary_reason: data.primaryReason,
        cash_out_amount: data.cashOutAmount || 0,
        
        // Financial Profile
        credit_score_range: data.creditScoreRange,
        gross_monthly_income: data.grossMonthlyIncome,
        employment_status: data.employmentStatus,
        years_employed: data.yearsEmployed,
        
        // Timeline
        timeline: data.timeline,
        urgency_reason: data.urgencyReason,
        
        // Additional Information
        additional_notes: data.additionalNotes,
        special_circumstances: data.specialCircumstances,
        
        status: 'pending' as const
      };

      // Insert into refinance table
      const { data: refinanceData, error } = await supabase
        .from('refinance')
        .insert(submissionData)
        .select()
        .single();

      if (error) {
        console.error('Error submitting to refinance table:', error);
        
        // Provide specific error messages
        if (error.code === '42501') {
          throw new Error('Permission denied. Please check your login status.');
        } else if (error.code === '42P01') {
          throw new Error('Refinance table not found. Please contact support.');
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      }

      return {
        success: true,
        message: 'Refinance request submitted successfully',
        refinanceId: refinanceData.id
      };

    } catch (error) {
      console.error('Error submitting refinance request:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit refinance request'
      };
    }
  }

  /**
   * Get refinance requests for authenticated user
   */
  static async getUserRefinanceRequests(): Promise<RefinanceRecord[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('refinance')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user refinance requests:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user refinance requests:', error);
      throw error;
    }
  }

  /**
   * Get refinance requests for anonymous user
   */
  static async getAnonymousRefinanceRequests(sessionId: string): Promise<RefinanceRecord[]> {
    try {
      const { data, error } = await supabase
        .from('refinance')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching anonymous refinance requests:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting anonymous refinance requests:', error);
      throw error;
    }
  }

  /**
   * Update refinance request status
   */
  static async updateRefinanceStatus(
    refinanceId: string, 
    status: RefinanceRecord['status'],
    reviewNotes?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('refinance')
        .update({ 
          status,
          review_notes: reviewNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', refinanceId);

      if (error) {
        console.error('Error updating refinance status:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating refinance status:', error);
      throw error;
    }
  }

  /**
   * Get refinance request by ID
   */
  static async getRefinanceRequestById(refinanceId: string): Promise<RefinanceRecord | null> {
    try {
      const { data, error } = await supabase
        .from('refinance')
        .select('*')
        .eq('id', refinanceId)
        .single();

      if (error) {
        console.error('Error fetching refinance request:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting refinance request by ID:', error);
      throw error;
    }
  }

  /**
   * Generate session ID for anonymous users
   */
  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate anonymous ID for anonymous users
   */
  static generateAnonymousId(): string {
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
