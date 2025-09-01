export type RefinanceType = 'rate-term' | 'cash-out' | 'debt-consolidation' | 'streamline' | 'fha-streamline' | 'va-streamline';

export type RefinancePurpose = 'lower-rate' | 'cash-out' | 'debt-consolidation' | 'remove-pmi' | 'change-term' | 'investment';

export interface RefinanceIntentData {
  // Property Information
  propertyAddress: string;
  city: string;
  state: string;
  zipCode: string;
  currentValue: number;
  
  // Current Loan Information
  currentBalance: number;
  currentRate: number;
  currentPayment: number;
  currentTerm: number;
  currentLender: string;
  
  // Refinance Goals
  refinanceType: RefinanceType;
  refinancePurpose: RefinancePurpose[];
  desiredRate: number;
  desiredTerm: number;
  cashOutAmount?: number;
  
  // Financial Information
  creditScore: number;
  income: number;
  employmentType: 'employed' | 'self-employed' | 'retired' | 'other';
  
  // Contact Information
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  
  // Timeline
  timeline: 'asap' | '1-3months' | '3-6months' | 'flexible';
  
  // Additional Details
  additionalNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface RefinanceCalculation {
  currentPayment: number;
  newPayment: number;
  monthlySavings: number;
  totalSavings: number;
  breakEvenMonths: number;
  newRate: number;
  newTerm: number;
}

export interface RefinanceOption {
  value: RefinanceType;
  label: string;
  description: string;
  benefits: string[];
  requirements: string[];
}
