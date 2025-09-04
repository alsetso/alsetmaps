# Frontend-Backend Integration Guide

This document shows how all database tables work together to create a seamless user experience in the Alset property search platform.

## 🏠 Home Page User Experience Flow

### **1. Property Search Interface**

#### **User Action: Search for Property**
```typescript
// Frontend Component: PropertySearchForm
interface PropertySearchRequest {
  address: string;
  searchType: 'basic' | 'advanced' | 'comprehensive';
  searchTier: 'basic' | 'smart' | 'premium';
  filters: {
    priceRange?: [number, number];
    bedrooms?: number;
    propertyType?: string[];
    // ... other filters
  };
}
```

#### **Backend Flow:**
```sql
-- 1. Check if user has enough credits
SELECT balance FROM user_credits WHERE user_id = $1;

-- 2. Check property cache first
SELECT * FROM property_data_cache 
WHERE normalized_address = $1 AND cache_expires_at > NOW();

-- 3. If cache miss, check credit requirements
-- Basic search: 1 credit, Smart: 2 credits, Premium: 3 credits

-- 4. Log the search attempt
INSERT INTO search_history (
  user_id, session_id, search_address, search_type, 
  search_tier, credits_consumed, search_filters, success
) VALUES ($1, $2, $3, $4, $5, $6, $7, true);

-- 5. Deduct credits
INSERT INTO credit_transactions (
  user_id, amount, type, reference_id, 
  reference_table, description
) VALUES ($1, -$2, 'search', $3, 'search_history', 'Property search');

-- 6. Update user credits
UPDATE user_credits 
SET balance = balance - $1, total_spent = total_spent + $1, last_updated = NOW()
WHERE user_id = $2;
```

#### **Tables Used:**
- `user_credits` → Check available balance
- `property_data_cache` → Check for cached results
- `search_history` → Log search attempt
- `credit_transactions` → Track credit usage
- `search_results` → Store new results

### **2. Credit Dashboard Widget**

#### **Frontend Component: CreditStatusWidget**
```typescript
interface CreditStatus {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  subscriptionStatus: 'active' | 'canceled' | 'past_due';
  creditsPerMonth: number;
  nextRenewal: Date;
}
```

#### **Backend Query:**
```sql
-- Get comprehensive credit status
SELECT 
  uc.balance,
  uc.total_earned,
  uc.total_spent,
  us.status as subscription_status,
  us.credits_per_month,
  us.current_period_end as next_renewal
FROM user_credits uc
LEFT JOIN user_subscriptions us ON uc.user_id = us.user_id 
  AND us.status = 'active'
WHERE uc.user_id = $1;
```

#### **Tables Used:**
- `user_credits` → Current balance and totals
- `user_subscriptions` → Subscription details

### **3. Recent Search Results**

#### **Frontend Component: RecentSearches**
```typescript
interface RecentSearch {
  id: string;
  address: string;
  searchType: string;
  creditsConsumed: number;
  success: boolean;
  resultCount: number;
  createdAt: Date;
}
```

#### **Backend Query:**
```sql
-- Get recent searches with result counts
SELECT 
  sh.id,
  sh.search_address,
  sh.search_type,
  sh.credits_consumed,
  sh.success,
  COUNT(sr.id) as result_count,
  sh.created_at
FROM search_history sh
LEFT JOIN search_results sr ON sh.id = sr.search_history_id
WHERE sh.user_id = $1
GROUP BY sh.id, sh.search_address, sh.search_type, sh.credits_consumed, sh.success, sh.created_at
ORDER BY sh.created_at DESC
LIMIT 10;
```

#### **Tables Used:**
- `search_history` → Search metadata
- `search_results` → Result counts

## ⚙️ Settings Page User Experience Flow

### **1. Account Management**

#### **Frontend Component: AccountSettings**
```typescript
interface AccountSettings {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  billing: {
    stripeCustomerId: string;
    subscriptionStatus: string;
    nextBillingDate: Date;
  };
  preferences: {
    defaultSearchType: string;
    defaultSearchTier: string;
    emailNotifications: boolean;
  };
}
```

#### **Backend Operations:**
```sql
-- Update personal information
UPDATE accounts 
SET first_name = $1, last_name = $2, phone = $3, updated_at = NOW()
WHERE id = $4;

-- Get billing information
SELECT 
  a.stripe_customer_id,
  us.status as subscription_status,
  us.current_period_end as next_billing_date,
  us.plan_type,
  us.credits_per_month
FROM accounts a
LEFT JOIN user_subscriptions us ON a.id = us.user_id AND us.status = 'active'
WHERE a.id = $1;
```

#### **Tables Used:**
- `accounts` → Personal information
- `user_subscriptions` → Billing details

### **2. Credit Management**

#### **Frontend Component: CreditManagement**
```typescript
interface CreditManagement {
  availablePackages: CreditPackage[];
  currentSubscription: SubscriptionPlan;
  transactionHistory: CreditTransaction[];
  purchaseHistory: PurchaseRecord[];
}
```

#### **Backend Operations:**
```sql
-- Get available credit packages
SELECT * FROM credit_packages WHERE is_active = true ORDER BY price_cents;

-- Get transaction history
SELECT 
  ct.*,
  cp.name as package_name,
  cp.credits as package_credits
FROM credit_transactions ct
LEFT JOIN credit_packages cp ON ct.reference_id = cp.id
WHERE ct.user_id = $1
ORDER BY ct.created_at DESC
LIMIT 50;

-- Get current subscription
SELECT * FROM user_subscriptions 
WHERE user_id = $1 AND status = 'active';
```

#### **Tables Used:**
- `credit_packages` → Available packages
- `credit_transactions` → Transaction history
- `user_subscriptions` → Current subscription

### **3. Search Preferences & History**

#### **Frontend Component: SearchPreferences**
```typescript
interface SearchPreferences {
  defaultSettings: {
    searchType: string;
    searchTier: string;
    autoCache: boolean;
  };
  searchHistory: SearchHistoryItem[];
  cacheSettings: {
    maxCacheAge: number;
    autoRefresh: boolean;
  };
}
```

#### **Backend Operations:**
```sql
-- Get search history with analytics
SELECT 
  sh.*,
  COUNT(sr.id) as result_count,
  CASE 
    WHEN sh.credits_consumed = 1 THEN 'Basic'
    WHEN sh.credits_consumed = 2 THEN 'Smart'
    WHEN sh.credits_consumed = 3 THEN 'Premium'
  END as search_complexity
FROM search_history sh
LEFT JOIN search_results sr ON sh.id = sr.search_history_id
WHERE sh.user_id = $1
GROUP BY sh.id
ORDER BY sh.created_at DESC;

-- Get cache statistics
SELECT 
  data_source,
  COUNT(*) as total_cached,
  COUNT(*) FILTER (WHERE cache_expires_at > NOW()) as active_cache,
  AVG(access_count) as avg_accesses
FROM property_data_cache
GROUP BY data_source;
```

#### **Tables Used:**
- `search_history` → User search patterns
- `search_results` → Result analytics
- `property_data_cache` → Cache performance

## 🔄 Complete User Journey Integration

### **New User Onboarding Flow:**

#### **1. User Registration**
```sql
-- Trigger: handle_new_user()
-- Creates user_credits record with welcome bonus
INSERT INTO user_credits (user_id, balance, total_earned, total_spent)
VALUES (NEW.id, 10, 10, 0); -- 10 welcome credits
```

#### **2. First Property Search**
```sql
-- Check welcome credits
SELECT balance FROM user_credits WHERE user_id = $1;

-- Log first search
INSERT INTO search_history (user_id, search_address, search_type, search_tier, credits_consumed)
VALUES ($1, $2, 'basic', 'basic', 1);

-- Deduct credits
INSERT INTO credit_transactions (user_id, amount, type, description)
VALUES ($1, -1, 'search', 'First property search');
```

#### **3. Credit Purchase Flow**
```sql
-- User selects package
SELECT * FROM credit_packages WHERE id = $1 AND is_active = true;

-- Process purchase (after Stripe payment)
SELECT purchase_credits($1, $2, $3); -- user_id, package_id, stripe_payment_intent

-- Function automatically:
-- 1. Adds credits to user_credits
-- 2. Logs transaction in credit_transactions
-- 3. Updates balance atomically
```

### **Returning User Experience:**

#### **1. Quick Property Lookup**
```sql
-- Check cache first (fastest)
SELECT * FROM property_data_cache 
WHERE normalized_address = $1 AND cache_expires_at > NOW();

-- If cache miss, check credits and search
SELECT balance FROM user_credits WHERE user_id = $1;
```

#### **2. Subscription Renewal**
```sql
-- Monthly credit refresh
SELECT refresh_monthly_credits();

-- Function automatically:
-- 1. Adds monthly credits to active subscriptions
-- 2. Logs transactions
-- 3. Updates user balances
```

## 📊 Analytics & Insights

### **User Dashboard Analytics:**
```sql
-- Get user's search patterns
SELECT 
  search_type,
  search_tier,
  COUNT(*) as search_count,
  SUM(credits_consumed) as total_credits_used,
  AVG(CASE WHEN success THEN 1 ELSE 0 END) as success_rate
FROM search_history
WHERE user_id = $1
GROUP BY search_type, search_tier;

-- Get credit usage trends
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as credits_earned,
  SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as credits_spent
FROM credit_transactions
WHERE user_id = $1
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

### **Tables Used for Analytics:**
- `search_history` → Search patterns and success rates
- `credit_transactions` → Credit usage trends
- `property_data_cache` → Cache performance
- `user_subscriptions` → Subscription analytics

## 🎯 Key Integration Points

### **1. Credit System Integration:**
- Every search consumes credits
- Credits can be purchased or earned via subscription
- Automatic monthly renewal for subscribers
- Complete audit trail of all credit movements

### **2. Search & Cache Integration:**
- Property searches check cache first
- Cache misses trigger API calls and credit consumption
- Search results are stored and linked to history
- Cache expiration management

### **3. User Experience Integration:**
- Real-time credit balance updates
- Search history with result counts
- Subscription management and billing
- Personalized search preferences

### **4. Performance Integration:**
- Materialized views for analytics
- Optimized indexes for common queries
- Partial indexes for active data only
- Efficient credit balance calculations

This integration creates a **seamless, performant, and user-friendly** property search platform where all database operations support the frontend user experience efficiently.

