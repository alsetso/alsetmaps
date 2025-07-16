# Alset Platform - Meta Documentation

## Project Overview
**Alset** is an AI-powered business transformation platform that helps organizations unlock the power of artificial intelligence through automation, intelligent workflows, and autonomous agents.

## Technical Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with OAuth
- **UI Framework**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Routing**: React Router DOM

## Application Pages & Routes

### 1. Landing Page (`/`)
- **Title**: "Alset - AI for Business"
- **Description**: "Transform your business with AI-powered automation, intelligent workflows, and autonomous agents"
- **Component**: `Index.tsx`
- **Features**:
  - Hero section with AI transformation messaging
  - Journey steps showcase (4-step process)
  - AI capabilities overview
  - Success metrics and testimonials
  - Call-to-action sections
- **Keywords**: AI transformation, business automation, artificial intelligence, intelligent workflows
- **Target Audience**: Business leaders, organizations seeking AI adoption

### 2. Dashboard (`/dashboard`)
- **Title**: "Dashboard - Alset AI Platform"
- **Description**: "Access your AI services including endpoints, workflows, agents, data, and tools"
- **Component**: `Dashboard.tsx`
- **Authentication**: Required
- **Features**:
  - Core services grid (5 main services)
  - Documentation sections
  - Recent activity
  - Quick actions
- **Services Available**:
  - 📥 Endpoints
  - 🤖 Agents
  - 🔁 Workflows
  - 📊 Data
  - 🛠️ Tools

### 3. Authentication (`/login`)
- **Title**: "Login - Alset Platform"
- **Description**: "Sign in to access your AI transformation tools and services"
- **Component**: `Login.tsx`
- **Features**:
  - Email/password authentication
  - OAuth integration (Google, GitHub)
  - Sign up/sign in toggle
  - Password reset functionality
- **Redirect**: Authenticated users redirect to dashboard

### 4. User Settings (`/settings`)
- **Title**: "Settings - Alset Platform"
- **Description**: "Manage your account preferences and application settings"
- **Component**: `Settings.tsx`
- **Authentication**: Required
- **Features**:
  - Theme toggle (dark/light mode)
  - Account information management
  - Notification preferences
  - Privacy settings

### 5. Billing & Subscription (`/billing`)
- **Title**: "Billing - Alset Platform"
- **Description**: "Manage your subscription and billing information"
- **Component**: `Billing.tsx`
- **Authentication**: Required
- **Features**:
  - Current plan display
  - Payment method management
  - Billing history
  - Upgrade options
- **Current Model**: Freemium (Free tier with upgrade options)

### 6. Search (`/search`)
- **Title**: "Search - Alset Platform"
- **Description**: "Search through documentation, services, and platform content"
- **Component**: `Search.tsx`
- **Features**:
  - Global search functionality
  - Filtered results
  - Search suggestions

### 7. Bookmarks (`/bookmarks`)
- **Title**: "Bookmarks - Alset Platform"
- **Description**: "Access your saved articles and documentation"
- **Component**: `Bookmarks.tsx`
- **Authentication**: Required
- **Features**:
  - Saved content management
  - Bookmark organization
  - Quick access to favorite resources

### 8. Core Service Pages
Each service has a dedicated page with Details and Projects tabs:

#### Endpoints (`/endpoints`)
- **Title**: "Endpoints - Universal Data Intake"
- **Tagline**: "Receive Any Result. From Any System. Instantly."
- **Component**: `Endpoints.tsx`
- **Description**: Universal data intake layer capable of receiving inputs from any system, format, or source
- **Keywords**: webhook listener, data intake API, file upload handler, JSON transformation
- **Use Cases**: Diagnostic reports, legal documents, CRM webhooks, API responses
- **Features**: Details tab with documentation, Projects tab for managing endpoints

#### Agents (`/agents`)
- **Title**: "Agents - Autonomous Task Execution"
- **Tagline**: "Intelligent AI agents for autonomous task execution and decision making"
- **Component**: `Agents.tsx`
- **Description**: Advanced AI agents for complex task automation and decision-making
- **Keywords**: autonomous agents, task automation, intelligent decision making
- **Use Cases**: Complex workflow execution, automated decision trees
- **Features**: Details tab with documentation, Projects tab for managing agents

#### Workflows (`/workflows`)
- **Title**: "Workflows - Automation Engine"
- **Tagline**: "Build Logic. Automate Response. Save Hours."
- **Component**: `Workflows.tsx`
- **Description**: Low-code automation engine for creating intelligent sequences triggered by events
- **Keywords**: workflow automation, low-code builder, event-driven automation, drag-and-drop
- **Use Cases**: Email automation, transaction processing, escalation workflows
- **Features**: Details tab with documentation, Projects tab for managing workflows

#### Data (`/data`)
- **Title**: "Data - Real-time Processing"
- **Tagline**: "Real-time data processing and analytics for actionable business insights"
- **Component**: `Data.tsx`
- **Description**: Advanced data processing engine for analytics and real-time processing
- **Keywords**: real-time processing, analytics engine, data transformation, streaming analytics
- **Use Cases**: Data analysis, pipeline automation, enterprise processing
- **Features**: Details tab with documentation, Projects tab for managing data pipelines

#### Tools (`/tools`)
- **Title**: "Tools - AI-powered Utilities"
- **Tagline**: "AI-powered tools and utilities for enhanced productivity"
- **Component**: `Tools.tsx`
- **Description**: Comprehensive suite of AI-powered tools for enhanced productivity
- **Keywords**: AI-powered tools, productivity utilities, workflow automation
- **Use Cases**: Document processing, data analysis, project management
- **Features**: Details tab with documentation, Projects tab for managing tools

### 9. Dynamic Document Pages (`/:id`)
- **Title**: Dynamic based on document type
- **Description**: Dynamic based on content
- **Component**: `DocumentView.tsx`
- **Note**: Legacy support for additional documentation pages

### 10. 404 Not Found (`/*`)
- **Title**: "Page Not Found - Alset Platform"
- **Description**: "The page you're looking for doesn't exist"
- **Component**: `NotFound.tsx`
- **Features**:
  - Friendly error message
  - Navigation suggestions
  - Return to home link

## SEO & Social Media Metadata

### Open Graph Tags
- **og:title**: "Alset - AI Business Transformation Platform"
- **og:description**: "Transform your business with AI-powered automation, intelligent workflows, and autonomous agents"
- **og:type**: "website"
- **og:image**: "/logo.svg"

### Twitter Card
- **twitter:card**: "summary_large_image"
- **twitter:site**: "@alset"
- **twitter:image**: "/logo.svg"

### Favicon & Branding
- **Favicon**: Custom Alset logo (SVG format)
- **Brand Colors**: Green gradient (#4ade80, #22c55e)
- **Logo**: Geometric "A" design with modern aesthetic

## Target Keywords & SEO Focus
- AI business transformation
- Intelligent automation platform
- AI workflow builder
- Business process automation
- Artificial intelligence for business
- AI-powered customer service
- Automated workflow management
- AI assistant platform
- Business intelligence automation
- AI endpoint management

## User Journey & Conversion Funnel
1. **Discovery**: Landing page with AI transformation messaging
2. **Education**: Service-specific documentation pages
3. **Registration**: Simple authentication with OAuth options
4. **Onboarding**: Dashboard with clear service navigation
5. **Engagement**: Feature-rich tools and documentation
6. **Conversion**: Freemium to paid subscription upgrade

## Technical SEO Features
- Responsive design (mobile-first)
- Fast loading with Vite bundling
- Modern web standards compliance
- Accessibility features
- Clean URL structure
- Semantic HTML markup
- Optimized images and assets

## Analytics & Tracking
- User authentication tracking
- Page view analytics
- Feature usage metrics
- Conversion funnel analysis
- Performance monitoring

## Security & Compliance
- Supabase authentication
- OAuth integration
- Secure data handling
- Privacy policy compliance
- GDPR considerations 