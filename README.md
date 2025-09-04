# Alset - Property Search & Real Estate Platform

A comprehensive real estate platform built with Next.js, Supabase, and modern web technologies. Alset provides property search, market analysis, and real estate tools for buyers, sellers, and agents.

## 🚀 Features

- **Property Search**: Advanced property search with Mapbox integration
- **User Authentication**: Secure authentication with Supabase Auth
- **Credit System**: Flexible credit-based access to premium features
- **Marketplace Intents**: Buyer, seller, and refinance intent management
- **Agent Directory**: Comprehensive agent management and search
- **Real-time Updates**: Live data updates and notifications
- **Responsive Design**: Mobile-first, responsive UI built with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Maps**: Mapbox API
- **Payments**: Stripe integration
- **Email**: Resend API
- **Property Data**: RapidAPI, Zillow API
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Mapbox account
- Stripe account (for payments)
- Resend account (for emails)
- RapidAPI account

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/alset-so.git
cd alset-so
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
npm install
```

### 3. Environment Setup

Copy the environment template and fill in your values:

```bash
cp env.example .env.local
```

Edit `.env.local` with your actual API keys and configuration:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PREMIUM_PRICE_ID=your_stripe_premium_price_id

# Resend (Email) Configuration
RESEND_API_KEY=your_resend_api_key

# RapidAPI Configuration
NEXT_PUBLIC_RAPIDAPI_KEY=your_rapidapi_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

#### Option A: Use Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL from `supabase/database/tables/tables.sql`
4. Run the SQL from `supabase/database/functions/functions_fixed.sql`

#### Option B: Use Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push the schema
supabase db push
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

The application uses a PostgreSQL database with the following main tables:

- **accounts**: User account information
- **user_credits**: Credit balance and transaction history
- **credit_transactions**: Detailed credit transaction logs
- **property_data_cache**: Cached property information
- **search_history**: User search history
- **marketplace_intents**: Buyer/seller/refinance intents
- **agents**: Agent directory and profiles

See `DATABASE_SCHEMA.md` for detailed schema information.

## 🔐 Authentication

Alset uses Supabase Auth with support for:
- Email/password authentication
- Google OAuth
- Email verification
- Password reset

## 💳 Credit System

The platform operates on a credit-based system:
- New users receive 10 welcome credits
- Credits are consumed for property searches
- Credits can be purchased or earned through subscriptions
- All transactions are logged for transparency

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm start
```

## 📁 Project Structure

```
alset-so/
├── app/                    # Next.js app router pages
├── src/
│   ├── features/          # Feature-based modules
│   │   ├── authentication/
│   │   ├── credit-system/
│   │   ├── property-search/
│   │   ├── marketplace-intents/
│   │   └── shared/
│   ├── integrations/      # Third-party service integrations
│   └── lib/              # Utility functions and helpers
├── supabase/              # Database schema and migrations
├── public/                # Static assets
└── components.json        # shadcn/ui configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the docs folder for detailed guides
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join the conversation in GitHub Discussions

## 🔗 Links

- [Live Demo](https://your-domain.com)
- [API Documentation](https://your-domain.com/api/docs)
- [Contributing Guidelines](CONTRIBUTING.md)

---

Built with ❤️ by the Alset team
