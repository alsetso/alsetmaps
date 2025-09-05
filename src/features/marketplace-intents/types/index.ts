// Marketplace Types - Buy/Sell/Refinance/Loans types
// Explicit exports to avoid conflicts
export type { 
  PropertyType as BuyerPropertyType, 
  Timeline as BuyerTimeline,
  FinancingType,
  AgentPreference,
  InvestmentStrategy,
  PropertyCondition,
  LocationPreference,
  PropertyCriteria,
  FinancialCriteria,
  BuyerIntentData,
  BuyerIntentOption,
  MarketInsight
} from './buyer-intent';

export type { 
  PropertyType as SellerPropertyType, 
  Timeline as SellerTimeline,
  IntentType,
  SellIntentData,
  IntentTypeOption,
  PropertyTypeOption,
  TimelineOption
} from './sell-intent';

export * from './loan-intent';
