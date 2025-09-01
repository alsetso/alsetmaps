import { supabase } from '@/integrations/supabase/client';
import { PreQualificationData } from '../types/loan-intent';

export interface LoanSubmissionResponse {
  success: boolean;
  message: string;
  loanId?: string;
}

export interface LoanRecord {
  id: string;
  user_id?: string;
  session_id?: string;
  anonymous_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gross_monthly_income: number;
  employment_status: 'employed' | 'self-employed' | 'retired' | 'unemployed';
  years_employed: number;
  credit_score_range: 'excellent' | 'good' | 'fair' | 'poor';
  additional_income?: number;
  other_assets?: number;
  monthly_debts?: number;
  property_price: number;
  property_use: 'primary-residence' | 'investment' | 'second-home';
  down_payment: number;
  loan_amount: number;
  loan_type: 'conventional' | 'fha' | 'va' | 'usda' | 'jumbo' | 'investment' | 'refinance';
  credit_check_consent: boolean;
  pre_approval_consent: boolean;
  marketing_consent: boolean;
  status: 'pending' | 'pre-approved' | 'approved' | 'rejected' | 'contacted';
  pre_approval_amount?: number;
  estimated_rate?: number;
  monthly_payment?: number;
  created_at: string;
  updated_at: string;
}

export class LoansTableService {
  /**
   * Submit a loan application
   */
  static async submitLoanApplication(
    data: PreQualificationData, 
    sessionId?: string, 
    anonymousId?: string
  ): Promise<LoanSubmissionResponse> {
    try {
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();

      // Generate session/anonymous ID if not provided
      if (!sessionId && !user) {
        sessionId = this.generateSessionId();
      }
      if (!anonymousId && !user) {
        anonymousId = this.generateAnonymousId();
      }

      const submissionData = {
        user_id: user?.id || null,
        session_id: sessionId || null,
        anonymous_id: anonymousId || null,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        gross_monthly_income: data.grossMonthlyIncome,
        employment_status: data.employmentStatus,
        years_employed: data.yearsEmployed,
        credit_score_range: data.creditScoreRange,
        additional_income: data.additionalIncome || null,
        other_assets: data.otherAssets || null,
        monthly_debts: data.monthlyDebts || null,
        property_price: data.propertyPrice,
        property_use: data.propertyUse,
        down_payment: data.downPayment,
        loan_type: data.loanType,
        credit_check_consent: true, // Default to true for pre-approval
        pre_approval_consent: true, // Default to true for pre-approval
        marketing_consent: false, // Default to false
        status: 'pending' as const
      };

      const { data: loanRecord, error } = await supabase
        .from('loans')
        .insert(submissionData)
        .select()
        .single();

      if (error) {
        console.error('Error submitting to loans table:', error);
        
        // Provide specific error messages
        if (error.code === '42501') {
          throw new Error('Permission denied. Please check your login status or try again.');
        } else if (error.code === '42P01') {
          throw new Error('Loans table not found. Please contact support.');
        } else if (error.code === '23514') {
          throw new Error('Invalid data provided. Please check your input and try again.');
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      }

      return {
        success: true,
        message: 'Loan application submitted successfully!',
        loanId: loanRecord.id
      };

    } catch (error) {
      console.error('Error submitting loan application:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit loan application. Please try again.',
      };
    }
  }

  /**
   * Get loan applications for authenticated user
   */
  static async getUserLoanApplications(): Promise<LoanRecord[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: loans, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user loans:', error);
        throw error;
      }

      return loans || [];
    } catch (error) {
      console.error('Error getting user loan applications:', error);
      return [];
    }
  }

  /**
   * Get loan applications for anonymous user
   */
  static async getAnonymousLoanApplications(sessionId: string): Promise<LoanRecord[]> {
    try {
      const { data: loans, error } = await supabase
        .from('loans')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching anonymous loans:', error);
        throw error;
      }

      return loans || [];
    } catch (error) {
      console.error('Error getting anonymous loan applications:', error);
      return [];
    }
  }

  /**
   * Update loan application status
   */
  static async updateLoanStatus(
    loanId: string, 
    status: LoanRecord['status'], 
    reviewNotes?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('loans')
        .update({ 
          status, 
          review_notes: reviewNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', loanId);

      if (error) {
        console.error('Error updating loan status:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating loan application status:', error);
      throw error;
    }
  }

  /**
   * Get loan application by ID
   */
  static async getLoanById(loanId: string): Promise<LoanRecord | null> {
    try {
      const { data: loan, error } = await supabase
        .from('loans')
        .select('*')
        .eq('id', loanId)
        .single();

      if (error) {
        console.error('Error fetching loan by ID:', error);
        return null;
      }

      return loan;
    } catch (error) {
      console.error('Error getting loan by ID:', error);
      return null;
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
