export type PropertyType = 'single-family' | 'multi-family' | 'condo' | 'townhouse' | 'land' | 'commercial' | 'investment' | 'fixer-upper' | 'new-construction';

export type FinancingType = 'cash' | 'conventional' | 'fha' | 'va' | 'usda' | 'hard-money' | 'private-money' | 'seller-financing' | 'lease-option';

export type Timeline = 'asap' | '1-3months' | '3-6months' | '6-12months' | 'flexible' | 'investor';

export type AgentPreference = 'working-with-agent' | 'no-agent' | 'need-agent-referral' | 'open-to-agent';

export type InvestmentStrategy = 'primary-residence' | 'rental-income' | 'flip' | 'wholesale' | 'land-development' | 'commercial-use';

export type PropertyCondition = 'move-in-ready' | 'minor-updates' | 'major-renovation' | 'tear-down' | 'new-construction';

export interface LocationPreference {
  specificAddress?: string;
  city: string;
  state: string;
  zipCode?: string;
  neighborhoods?: string[];
  schoolDistricts?: string[];
  commuteTime?: number; // minutes to work
  radius?: number; // miles from specific location
}

export interface PropertyCriteria {
  propertyType: PropertyType[];
  condition: PropertyCondition[];
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  minSqft?: number;
  maxSqft?: number;
  minLotSize?: number;
  maxLotSize?: number;
  yearBuilt?: {
    min?: number;
    max?: number;
  };
  features?: string[]; // pool, garage, basement, etc.
}

export interface FinancialCriteria {
  maxPrice: number;
  minPrice?: number;
  downPayment?: number;
  monthlyPayment?: number;
  financingType: FinancingType[];
  creditScore?: number;
  preApproved?: boolean;
  preApprovalAmount?: number;
}

export interface BuyerIntentData {
  // Basic Info
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  
  // Location Preferences
  locationPreference: LocationPreference;
  
  // Property Criteria
  propertyCriteria: PropertyCriteria;
  
  // Financial Criteria
  financialCriteria: FinancialCriteria;
  
  // Buying Intent
  timeline: Timeline;
  agentPreference: AgentPreference;
  investmentStrategy: InvestmentStrategy;
  
  // Additional Details
  mustHaves: string[];
  dealBreakers: string[];
  additionalNotes?: string;
  
  // Search Preferences
  searchRadius: number;
  emailAlerts: boolean;
  smsAlerts: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface BuyerIntentOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}

export interface MarketInsight {
  averagePrice: number;
  pricePerSqft: number;
  daysOnMarket: number;
  inventoryLevel: 'low' | 'medium' | 'high';
  marketTrend: 'rising' | 'stable' | 'declining';
  recommendedPriceRange: [number, number];
}
