export type LoanScenario = 'prequalify' | 'rate-beat';

export type LoanType = 'conventional' | 'fha' | 'va' | 'usda' | 'jumbo' | 'investment';

export type PropertyUse = 'primary-residence' | 'investment' | 'second-home';

export type EmploymentStatus = 'employed' | 'self-employed' | 'retired' | 'unemployed';

export interface PreQualificationData {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Financial
  grossMonthlyIncome: number;
  employmentStatus: EmploymentStatus;
  yearsEmployed: number;
  creditScoreRange: 'excellent' | 'good' | 'fair' | 'poor';
  downPayment: number;
  
  // Property
  propertyPrice: number;
  propertyUse: PropertyUse;
  loanType: LoanType;
  
  // Additional
  additionalIncome?: number;
  otherAssets?: number;
  monthlyDebts?: number;
}

export interface RateBeatData {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Current Loan
  currentLender: string;
  currentRate: number;
  currentLoanAmount: number;
  currentMonthlyPayment: number;
  
  // Property
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyValue: number;
  
  // Loan Details
  loanType: LoanType;
  remainingTerm: number;
  creditScoreRange: 'excellent' | 'good' | 'fair' | 'poor';
  
  // Additional
  cashOutAmount?: number;
}

export interface LoanLeadData {
  scenario: LoanScenario;
  preQualification?: PreQualificationData;
  rateBeat?: RateBeatData;
  timestamp: Date;
  leadId: string;
}

export interface LoanCalculationResult {
  approvedAmount?: number;
  monthlyPayment?: number;
  rateReduction?: number;
  monthlySavings?: number;
  totalSavings?: number;
  message: string;
  nextSteps: string[];
}
