export interface UserCredits {
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  last_updated: string;
  version: number;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'purchase' | 'monthly_subscription' | 'search' | 'pin' | 'intent' | 'research' | 'market_analysis';
  reference_id?: string;
  reference_table?: string;
  description: string;
  metadata: any;
  created_at: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_cents: number;
  is_popular: boolean;
  created_at: string;
}

export interface CreditStatus {
  balance: number;
  total_earned: number;
  total_spent: number;
  subscription_plan: 'free' | 'premium';
  subscription_expires_at?: string;
}

export interface CreditConsumptionResult {
  success: boolean;
  credits_consumed: number;
  remaining_credits: number;
  message: string;
}

export interface CreditPurchaseData {
  package_id: string;
  user_id: string;
  payment_method_id: string;
}

export interface SubscriptionData {
  user_id: string;
  payment_method_id: string;
  plan_type: 'premium';
}

export interface CreditUsageBreakdown {
  searches: number;
  pins: number;
  intents: number;
  research: number;
  market_analysis: number;
  total_credits_used: number;
}

export interface CreditHistoryItem {
  date: string;
  credits_used: number;
  action_type: string;
  description: string;
  reference_id?: string;
}
