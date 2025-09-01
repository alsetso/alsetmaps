import { 
  PreQualificationData, 
  RateBeatData, 
  LoanLeadData, 
  LoanCalculationResult
} from '../types/loan-intent';

export interface LoanLeadSubmissionResponse {
  success: boolean;
  message: string;
  leadId?: string;
}

class LoanIntentService {
  /**
   * Submit loan lead
   */
  static async submitLoanLead(data: LoanLeadData): Promise<LoanLeadSubmissionResponse> {
    try {
      const response = await fetch('/api/loan-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        message: 'Your loan inquiry has been submitted successfully!',
        leadId: result.leadId,
      };
    } catch (error) {
      console.error('Error submitting loan lead:', error);
      
      return {
        success: false,
        message: 'Failed to submit loan inquiry. Please try again or contact support.',
      };
    }
  }

  /**
   * Calculate pre-qualification
   */
  static calculatePreQualification(data: PreQualificationData): LoanCalculationResult {
    // Simple DTI calculation (Debt-to-Income ratio)
    const monthlyIncome = data.grossMonthlyIncome + (data.additionalIncome || 0);
    const monthlyDebts = data.monthlyDebts || 0;
    
    // Estimate property tax and insurance (1.2% of property value annually)
    const monthlyTaxInsurance = (data.propertyPrice * 0.012) / 12;
    
    // Calculate maximum monthly payment (43% DTI is typical max)
    const maxMonthlyPayment = (monthlyIncome * 0.43) - monthlyDebts - monthlyTaxInsurance;
    
    // Calculate loan amount based on rate (assuming 6.5% for 30 years)
    const rate = 0.065 / 12; // monthly rate
    const term = 360; // 30 years
    const maxLoanAmount = maxMonthlyPayment * ((1 - Math.pow(1 + rate, -term)) / rate);
    
    // Adjust based on credit score
    let creditMultiplier = 1.0;
    switch (data.creditScoreRange) {
      case 'excellent': creditMultiplier = 1.0; break;
      case 'good': creditMultiplier = 0.95; break;
      case 'fair': creditMultiplier = 0.85; break;
      case 'poor': creditMultiplier = 0.70; break;
    }
    
    const approvedAmount = Math.min(maxLoanAmount * creditMultiplier, data.propertyPrice - data.downPayment);
    const monthlyPayment = this.calculateMonthlyPayment(approvedAmount, 0.065, 30);
    
    return {
      approvedAmount: Math.round(approvedAmount),
      monthlyPayment: Math.round(monthlyPayment),
      message: approvedAmount > 0 
        ? `You're likely approved for up to $${approvedAmount.toLocaleString()}!`
        : 'You may need to increase your down payment or improve your credit score.',
      nextSteps: [
        'Get your pre-approval letter',
        'Connect with a loan officer',
        'Start house hunting',
        'Lock in your rate'
      ]
    };
  }

  /**
   * Calculate rate beat
   */
  static calculateRateBeat(data: RateBeatData): LoanCalculationResult {
    // Assume we can beat their rate by 0.5-1.5% depending on credit score
    let rateReduction = 0.5;
    switch (data.creditScoreRange) {
      case 'excellent': rateReduction = 1.5; break;
      case 'good': rateReduction = 1.0; break;
      case 'fair': rateReduction = 0.75; break;
      case 'poor': rateReduction = 0.5; break;
    }
    
    const newRate = Math.max(data.currentRate - rateReduction, 2.5); // Floor at 2.5%
    const newMonthlyPayment = this.calculateMonthlyPayment(data.currentLoanAmount, newRate / 100, data.remainingTerm);
    const monthlySavings = data.currentMonthlyPayment - newMonthlyPayment;
    const totalSavings = monthlySavings * data.remainingTerm;
    
    return {
      rateReduction: Math.round(rateReduction * 100) / 100,
      monthlySavings: Math.round(monthlySavings),
      totalSavings: Math.round(totalSavings),
      message: `We can beat your rate by ${rateReduction}%!`,
      nextSteps: [
        'Lock in this rate today',
        'Get your new loan estimate',
        'Start saving money immediately',
        'Connect with our loan team'
      ]
    };
  }

  /**
   * Calculate monthly payment
   */
  private static calculateMonthlyPayment(loanAmount: number, annualRate: number, years: number): number {
    const monthlyRate = annualRate / 12;
    const numberOfPayments = years * 12;
    
    if (monthlyRate === 0) return loanAmount / numberOfPayments;
    
    return loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  /**
   * Save loan lead locally
   */
  static async saveLoanLead(lead: LoanLeadData): Promise<boolean> {
    try {
      localStorage.setItem('loanLead', JSON.stringify(lead));
      return true;
    } catch (error) {
      console.error('Error saving loan lead:', error);
      return false;
    }
  }

  /**
   * Load saved loan lead
   */
  static async loadLoanLead(): Promise<LoanLeadData | null> {
    try {
      const saved = localStorage.getItem('loanLead');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading loan lead:', error);
      return null;
    }
  }
}

export { LoanIntentService };
export type { LoanCalculationResult };
