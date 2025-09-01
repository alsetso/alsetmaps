// =====================================================
// REFINANCE REQUEST TYPES - Database schema interface
// =====================================================

export type RefinanceStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed' | 'expired';
export type RefinancePriority = 'low' | 'normal' | 'high' | 'urgent';
export type RefinanceType = 'rate-term' | 'cash-out' | 'debt-consolidation' | 'streamline' | 'fha-streamline' | 'va-streamline';
export type RefinanceReason = 'lower-rate' | 'lower-payment' | 'cash-out' | 'debt-consolidation' | 'remove-pmi' | 'change-term' | 'investment';
export type LoanType = 'conventional' | 'fha' | 'va' | 'usda' | 'jumbo';
export type CreditScoreRange = 'excellent' | 'good' | 'fair' | 'poor';
export type EmploymentStatus = 'employed' | 'self-employed' | 'retired' | 'unemployed';
export type Timeline = 'asap' | '1-3months' | '3-6months' | 'flexible';
export type RefinanceSource = 'web_form' | 'phone' | 'referral' | 'agent' | 'other';

// Main refinance request interface matching database schema
export interface RefinanceRequest {
  id: string;
  account_id: string;
  address_id?: string;
  
  // Request Status & Workflow
  status: RefinanceStatus;
  priority: RefinancePriority;
  
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
  current_property_value: number;
  
  // Current Loan Information
  current_lender: string;
  current_loan_balance: number;
  current_interest_rate: number;
  current_monthly_payment: number;
  current_loan_term: number; // in years
  current_loan_type: LoanType;
  current_loan_origination_date?: string; // Date string
  current_pmi_amount: number;
  
  // Refinance Goals & Preferences
  refinance_type: RefinanceType;
  primary_reason: RefinanceReason;
  secondary_reasons: RefinanceReason[];
  
  // Desired Terms
  desired_interest_rate?: number;
  desired_loan_term?: number; // in years
  desired_loan_type?: LoanType;
  cash_out_amount: number;
  
  // Financial Profile
  credit_score_range: CreditScoreRange;
  gross_monthly_income?: number;
  employment_status?: EmploymentStatus;
  years_employed?: number;
  
  // Timeline & Urgency
  timeline: Timeline;
  urgency_reason?: string;
  
  // Additional Information
  additional_notes?: string;
  special_circumstances?: string;
  
  // Workflow Tracking
  assigned_to?: string;
  reviewed_by?: string;
  reviewed_at?: string; // ISO date string
  rejection_reason?: string;
  
  // Calculations & Results
  potential_monthly_savings?: number;
  potential_rate_reduction?: number;
  break_even_months?: number;
  total_savings_over_term?: number;
  
  // Metadata
  source: RefinanceSource;
  tags: string[];
  
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  expires_at: string; // ISO date string
}

// Form data interface for the refinance form
export interface RefinanceFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Property Information
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip?: string;
  currentPropertyValue: number;
  
  // Current Loan Information
  currentLender: string;
  currentLoanBalance: number;
  currentInterestRate: number;
  currentMonthlyPayment: number;
  currentLoanTerm: number;
  currentLoanType: LoanType;
  currentLoanOriginationDate?: string;
  currentPmiAmount?: number;
  
  // Refinance Goals
  refinanceType: RefinanceType;
  primaryReason: RefinanceReason;
  secondaryReasons: RefinanceReason[];
  
  // Desired Terms
  desiredInterestRate?: number;
  desiredLoanTerm?: number;
  desiredLoanType?: LoanType;
  cashOutAmount?: number;
  
  // Financial Profile
  creditScoreRange: CreditScoreRange;
  grossMonthlyIncome?: number;
  employmentStatus?: EmploymentStatus;
  yearsEmployed?: number;
  
  // Timeline
  timeline: Timeline;
  urgencyReason?: string;
  
  // Additional Information
  additionalNotes?: string;
  specialCircumstances?: string;
}

// Refinance request creation payload
export interface CreateRefinanceRequestPayload {
  account_id: string;
  address_id?: string;
  form_data: RefinanceFormData;
  source?: RefinanceSource;
  tags?: string[];
}

// Refinance request update payload
export interface UpdateRefinanceRequestPayload {
  id: string;
  updates: Partial<RefinanceRequest>;
}

// Refinance request filters for querying
export interface RefinanceRequestFilters {
  status?: RefinanceStatus[];
  priority?: RefinancePriority[];
  refinance_type?: RefinanceType[];
  primary_reason?: RefinanceReason[];
  timeline?: Timeline[];
  assigned_to?: string;
  created_after?: string;
  created_before?: string;
  property_state?: string[];
  credit_score_range?: CreditScoreRange[];
}

// Refinance request search parameters
export interface RefinanceRequestSearchParams {
  query?: string;
  filters?: RefinanceRequestFilters;
  sort_by?: 'created_at' | 'priority' | 'timeline' | 'potential_savings';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Refinance calculation result
export interface RefinanceCalculationResult {
  request_id: string;
  current_payment: number;
  new_payment: number;
  monthly_savings: number;
  total_savings: number;
  break_even_months: number;
  new_rate: number;
  new_term: number;
  loan_to_value_ratio: number;
  debt_to_income_ratio: number;
  is_eligible: boolean;
  eligibility_reasons: string[];
  recommended_products: string[];
}

// Refinance workflow actions
export type RefinanceWorkflowAction = 
  | 'assign'
  | 'review'
  | 'approve'
  | 'reject'
  | 'complete'
  | 'expire'
  | 'reopen';

// Refinance workflow action payload
export interface RefinanceWorkflowActionPayload {
  request_id: string;
  action: RefinanceWorkflowAction;
  user_id: string;
  notes?: string;
  rejection_reason?: string;
  assigned_to?: string;
}
