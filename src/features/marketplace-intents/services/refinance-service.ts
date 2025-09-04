// =====================================================
// REFINANCE SERVICE - Business logic for refinance requests
// =====================================================

import { 
  RefinanceRequest, 
  RefinanceFormData, 
  CreateRefinanceRequestPayload,
  UpdateRefinanceRequestPayload,
  RefinanceRequestFilters,
  RefinanceRequestSearchParams,
  RefinanceCalculationResult,
  RefinanceWorkflowActionPayload,
  RefinancePriority
} from '../types/refinance-request';

export class RefinanceService {
  private static instance: RefinanceService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  public static getInstance(): RefinanceService {
    if (!RefinanceService.instance) {
      RefinanceService.instance = new RefinanceService();
    }
    return RefinanceService.instance;
  }

  // =====================================================
  // CRUD OPERATIONS
  // =====================================================

  /**
   * Create a new refinance request
   */
  async createRefinanceRequest(payload: CreateRefinanceRequestPayload): Promise<RefinanceRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/refinance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to create refinance request: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating refinance request:', error);
      throw error;
    }
  }

  /**
   * Get a refinance request by ID
   */
  async getRefinanceRequest(id: string): Promise<RefinanceRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/refinance/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to get refinance request: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting refinance request:', error);
      throw error;
    }
  }

  /**
   * Update a refinance request
   */
  async updateRefinanceRequest(payload: UpdateRefinanceRequestPayload): Promise<RefinanceRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/refinance/${payload.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload.updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update refinance request: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating refinance request:', error);
      throw error;
    }
  }

  /**
   * Delete a refinance request
   */
  async deleteRefinanceRequest(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/refinance/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete refinance request: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting refinance request:', error);
      throw error;
    }
  }

  // =====================================================
  // QUERY OPERATIONS
  // =====================================================

  /**
   * Get all refinance requests with optional filtering
   */
  async getRefinanceRequests(params?: RefinanceRequestSearchParams): Promise<{
    requests: RefinanceRequest[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.query) queryParams.append('query', params.query);
      if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      if (params?.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach(v => queryParams.append(key, v));
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/refinance?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to get refinance requests: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting refinance requests:', error);
      throw error;
    }
  }

  /**
   * Get refinance requests by account ID
   */
  async getRefinanceRequestsByAccount(accountId: string): Promise<RefinanceRequest[]> {
    try {
      const response = await fetch(`${this.baseUrl}/refinance/account/${accountId}`);

      if (!response.ok) {
        throw new Error(`Failed to get account refinance requests: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting account refinance requests:', error);
      throw error;
    }
  }

  /**
   * Search refinance requests
   */
  async searchRefinanceRequests(query: string, filters?: RefinanceRequestFilters): Promise<RefinanceRequest[]> {
    try {
      const response = await fetch(`${this.baseUrl}/refinance/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, filters }),
      });

      if (!response.ok) {
        throw new Error(`Failed to search refinance requests: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching refinance requests:', error);
      throw error;
    }
  }

  // =====================================================
  // WORKFLOW OPERATIONS
  // =====================================================

  /**
   * Perform a workflow action on a refinance request
   */
  async performWorkflowAction(payload: RefinanceWorkflowActionPayload): Promise<RefinanceRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/refinance/${payload.request_id}/workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to perform workflow action: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error performing workflow action:', error);
      throw error;
    }
  }

  /**
   * Assign a refinance request to a loan officer
   */
  async assignRefinanceRequest(requestId: string, assignedTo: string, notes?: string): Promise<RefinanceRequest> {
    return this.performWorkflowAction({
      request_id: requestId,
      action: 'assign',
      user_id: assignedTo,
      notes,
      assigned_to: assignedTo,
    });
  }

  /**
   * Approve a refinance request
   */
  async approveRefinanceRequest(requestId: string, userId: string, notes?: string): Promise<RefinanceRequest> {
    return this.performWorkflowAction({
      request_id: requestId,
      action: 'approve',
      user_id: userId,
      notes,
    });
  }

  /**
   * Reject a refinance request
   */
  async rejectRefinanceRequest(requestId: string, userId: string, rejectionReason: string, notes?: string): Promise<RefinanceRequest> {
    return this.performWorkflowAction({
      request_id: requestId,
      action: 'reject',
      user_id: userId,
      rejection_reason: rejectionReason,
      notes,
    });
  }

  // =====================================================
  // CALCULATION OPERATIONS
  // =====================================================

  /**
   * Calculate refinance savings and eligibility
   */
  async calculateRefinance(requestId: string): Promise<RefinanceCalculationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/refinance/${requestId}/calculate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to calculate refinance: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calculating refinance:', error);
      throw error;
    }
  }

  /**
   * Get refinance options and recommendations
   */
  async getRefinanceOptions(requestId: string): Promise<{
    options: Array<{
      type: string;
      rate: number;
      term: number;
      payment: number;
      savings: number;
      requirements: string[];
    }>;
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/refinance/${requestId}/options`);

      if (!response.ok) {
        throw new Error(`Failed to get refinance options: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting refinance options:', error);
      throw error;
    }
  }

  // =====================================================
  // ANALYTICS & REPORTING
  // =====================================================

  /**
   * Get refinance request statistics
   */
  async getRefinanceStats(filters?: RefinanceRequestFilters): Promise<{
    total: number;
    pending: number;
    reviewing: number;
    approved: number;
    rejected: number;
    completed: number;
    expired: number;
    averageProcessingTime: number;
    conversionRate: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach(v => queryParams.append(key, v));
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/refinance/stats?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to get refinance stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting refinance stats:', error);
      throw error;
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Calculate loan-to-value ratio
   */
  calculateLTV(loanAmount: number, propertyValue: number): number {
    return (loanAmount / propertyValue) * 100;
  }

  /**
   * Calculate debt-to-income ratio
   */
  calculateDTI(monthlyDebts: number, grossMonthlyIncome: number): number {
    return (monthlyDebts / grossMonthlyIncome) * 100;
  }

  /**
   * Determine refinance priority based on urgency factors
   */
  determinePriority(timeline: string, urgencyReason?: string): RefinancePriority {
    if (timeline === 'asap' || urgencyReason?.toLowerCase().includes('urgent')) {
      return 'urgent';
    }
    if (timeline === '1-3months') {
      return 'high';
    }
    if (timeline === '3-6months') {
      return 'normal';
    }
    return 'low';
  }

  /**
   * Validate refinance request data
   */
  validateRefinanceRequest(data: RefinanceFormData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Basic validation
    if (!data.firstName || !data.lastName) {
      errors.push('First and last name are required');
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Valid email is required');
    }

    if (!data.phone || data.phone.length < 10) {
      errors.push('Valid phone number is required');
    }

    // Property validation
    if (!data.propertyAddress || !data.propertyCity || !data.propertyState) {
      errors.push('Complete property address is required');
    }

    if (!data.currentPropertyValue || data.currentPropertyValue <= 0) {
      errors.push('Valid property value is required');
    }

    // Loan validation
    if (!data.currentLoanBalance || data.currentLoanBalance <= 0) {
      errors.push('Valid loan balance is required');
    }

    if (!data.currentInterestRate || data.currentInterestRate <= 0) {
      errors.push('Valid interest rate is required');
    }

    if (!data.currentMonthlyPayment || data.currentMonthlyPayment <= 0) {
      errors.push('Valid monthly payment is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const refinanceService = RefinanceService.getInstance();
