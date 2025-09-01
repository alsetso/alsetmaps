# Alset SO - Universal Evergreen System Schema

## Overview

This document describes the comprehensive database schema for Alset SO, a sophisticated real estate platform that serves as the single source of truth for all database architecture. The schema is designed to be evergreen, scalable, and flexible to accommodate future growth and feature additions.

## Core Philosophy

The schema follows these key principles:

1. **Universal Address System** - Every location reference goes through a single, normalized addresses table
2. **Entity-Relationship Model** - Clear relationships between properties, users, agents, and intents
3. **Workflow Integration** - Built-in approval processes and status tracking for all major actions
4. **Credit-Based Access Control** - Monetization and usage tracking integrated throughout the system
5. **JSONB Flexibility** - Type-specific data stored in flexible JSONB fields for future extensibility
6. **Performance Optimization** - Strategic indexing and triggers for automation

## Schema Architecture

### 1. Foundation Layer

#### `accounts` Table
- **Purpose**: Central user management with role-based access control
- **Key Features**: 
  - Role-based permissions (user, agent, admin, moderator)
  - Stripe integration for payments
  - Verification system
  - Flexible preferences storage

#### `addresses` Table
- **Purpose**: Universal address system for all location-based features
- **Key Features**:
  - Normalized address storage
  - Geographic coordinates (latitude/longitude)
  - Property data caching from external APIs
  - Search and usage analytics

### 2. Property Management Layer

#### `properties` Table
- **Purpose**: Universal property registry
- **Key Features**:
  - Physical characteristics (bedrooms, bathrooms, square footage)
  - Financial data (estimated value, list price, sold price)
  - Ownership verification
  - Feature and image management

#### `property_listings` Table
- **Purpose**: Marketplace listings with approval workflow
- **Key Features**:
  - Multiple listing types (FSBO, agent, wholesale, auction)
  - Approval workflow for team review
  - Expiration management
  - Featured listing capabilities

### 3. User Interaction Layer

#### `pins` Table
- **Purpose**: Universal pin system for user interactions
- **Pin Types**:
  - `buyer_intent` - Buyer interest markers
  - `seller_listing` - Seller interest markers
  - `market_analysis` - Research and analysis pins

#### `intents` Table
- **Purpose**: Unified intent system for all user intentions
- **Intent Types**:
  - `buy` - Buyer intentions
  - `sell` - Seller intentions
  - `refinance` - Refinancing intentions
  - `wholesale` - Wholesale intentions

#### `sell` Table
- **Purpose**: Dedicated table for property selling intents with full form data
- **Key Features**:
  - Complete property information (address, coordinates, type)
  - Selling intent details (FSBO, agent, wholesale)
  - Pricing information (estimated value, desired price)
  - Contact information for both authenticated and anonymous users
  - Workflow status management (pending, approved, rejected, contacted)
  - Anonymous user support via session_id and anonymous_id
  - Geographic search and filtering capabilities

#### `buy` Table
- **Purpose**: Dedicated table for property buying intents with simplified, focused schema
- **Key Features**:
  - Primary intent classification (personal vs investment)
  - Location preferences (cities array, state)
  - Budget range (min/max budget)
  - Property criteria (types, beds/baths ranges)
  - Timeline and agent preference
  - Contact information for both authenticated and anonymous users
  - Workflow status management (pending, approved, rejected, contacted)
  - Anonymous user support via session_id and anonymous_id
  - Simplified schema focused on essential buying criteria

### 4. Business Logic Layer

#### `user_credits` Table
- **Purpose**: Credit-based access control system
- **Key Features**:
  - Free and paid credit balances
  - Subscription plan management
  - Stripe integration

#### `credit_transactions` Table
- **Purpose**: Detailed credit usage tracking
- **Transaction Types**:
  - `purchase` - Credit package purchases
  - `usage` - Credit consumption
  - `refund` - Credit refunds
  - `bonus` - Promotional credits

#### `agents` Table
- **Purpose**: Professional agent directory
- **Key Features**:
  - License verification
  - Specialty and service area management
  - SEO optimization (slug, keywords)
  - Featured agent system

### 5. Analytics & Discovery Layer

#### `search_sessions` Table
- **Purpose**: Search analytics and user behavior tracking
- **Key Features**:
  - Search performance metrics
  - Credit consumption tracking
  - User interaction analytics

#### `search_history` Table
- **Purpose**: Universal search history storage for both authenticated and anonymous users
- **Key Features**:
  - Address search tracking with geocoding support
  - Anonymous user support via session_id and anonymous_id
  - Search metadata and filters storage
  - Performance optimized with strategic indexing
  - Row Level Security (RLS) for data privacy

## Key Relationships

### Address-Centric Design
```
addresses (1) ←→ (many) properties
addresses (1) ←→ (many) pins
addresses (1) ←→ (many) intents
addresses (1) ←→ (many) sell (via coordinates)
search_history (many) ←→ (1) addresses (via coordinates)
```

### User-Centric Design
```
accounts (1) ←→ (many) properties (as owner)
accounts (1) ←→ (many) pins
accounts (1) ←→ (many) intents
accounts (1) ←→ (many) sell (as authenticated user)
accounts (1) ←→ (1) user_credits
accounts (1) ←→ (1) agents
accounts (1) ←→ (many) search_history
```

### Workflow Integration
```
property_listings → approval workflow → map display
intents → approval workflow → matching system
pins → verification workflow → public visibility
```

## Data Flow Patterns

### 1. Property Discovery Flow
1. User searches for properties → `search_sessions` created
2. Results displayed from `properties` + `property_listings`
3. User creates pin → `pins` table
4. Credit consumed → `credit_transactions` recorded

### 2. Intent Submission Flow
1. User submits intent → `intents` table
2. If approval required → status set to 'pending'
3. Team reviews → status updated to 'approved'/'rejected'
4. Approved intents become visible in matching system

### 3. Sell Intent Submission Flow
1. User submits sell form → `sell` table
2. Status automatically set to 'pending'
3. Team reviews submission → status updated to 'approved'/'rejected'/'contacted'
4. Approved sell intents become visible in agent matching system
5. Anonymous users can submit via session_id/anonymous_id tracking

### 3. Listing Approval Flow
1. Seller submits listing → `property_listings` with 'pending' status
2. Team reviews listing details
3. Approval decision recorded with timestamp and reviewer
4. Approved listings appear on map and in search results

## Performance Optimizations

### Strategic Indexing
- **Geographic queries**: `(latitude, longitude)` composite index
- **Status-based queries**: Status fields indexed for workflow filtering
- **User queries**: Account ID indexes for user-specific data retrieval
- **Search queries**: Type and status indexes for filtered searches

### Automation Triggers
- **Timestamp updates**: Automatic `updated_at` field maintenance
- **Data consistency**: Referential integrity through foreign keys
- **Audit trail**: Comprehensive tracking of all data modifications

## Extensibility Features

### JSONB Flexibility
- **Type-specific data**: Pin data, intent data, and preferences stored in JSONB
- **Schema evolution**: New fields can be added without table alterations
- **Query flexibility**: Complex queries possible on JSONB data

### Modular Design
- **Feature isolation**: Each major feature has dedicated tables
- **Clear interfaces**: Well-defined relationships between components
- **Scalable architecture**: Easy to add new features without breaking existing ones

## Security & Access Control

### Role-Based Permissions
- **User roles**: user, agent, admin, moderator
- **Feature access**: Different capabilities based on role
- **Data visibility**: Role-based data access controls

### Verification Systems
- **Property verification**: Multiple verification methods supported
- **Agent verification**: License and reference checking
- **User verification**: Email and phone verification

## Migration & Version Control

### Schema Version Tracking
- **Version table**: Tracks all schema changes
- **Migration history**: Complete audit trail of database evolution
- **Rollback capability**: Version-based rollback support

### Backward Compatibility
- **Soft deprecation**: Old fields maintained during transition
- **Data preservation**: All existing data preserved during migrations
- **Gradual migration**: Phased approach to schema updates

## Future Considerations

### Scalability
- **Horizontal scaling**: Schema designed for sharding and partitioning
- **Performance monitoring**: Built-in analytics for performance tracking
- **Load balancing**: Architecture supports read/write splitting

### Feature Expansion
- **New pin types**: Easy addition of new pin categories
- **New intent types**: Flexible intent system for future use cases
- **Integration points**: Clear interfaces for external system integration

## Conclusion

This universal evergreen system schema provides Alset SO with a robust, scalable, and flexible foundation that can grow with the platform while maintaining performance and data integrity. The address-centric design ensures consistent location handling, while the modular architecture allows for easy feature additions and modifications.

The schema is designed to be the single source of truth for all database operations, eliminating confusion and ensuring consistency across the entire platform.
