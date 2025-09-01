# Production Setup Guide

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

### Required for Homepage Functionality

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mapbox Configuration (Required for maps and geocoding)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Stripe Configuration (Required for credit system)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PREMIUM_PRICE_ID=your_stripe_price_id

# Email Configuration (Required for auth verification)
RESEND_API_KEY=your_resend_api_key

# External APIs (Optional - for enhanced features)
NEXT_PUBLIC_RAPIDAPI_KEY=your_rapidapi_key

# Environment
NODE_ENV=production
```

## Getting API Keys

### 1. Mapbox
1. Go to [Mapbox](https://www.mapbox.com/)
2. Create an account and project
3. Get your access token from the project dashboard
4. Add to `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

### 2. Supabase
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Get your project URL and anon key from Settings > API
4. Add to `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Stripe
1. Go to [Stripe](https://stripe.com/)
2. Create an account and get your secret key
3. Create a price for premium credits
4. Add to `STRIPE_SECRET_KEY` and `STRIPE_PREMIUM_PRICE_ID`

### 4. Resend
1. Go to [Resend](https://resend.com/)
2. Create an account and get your API key
3. Add to `RESEND_API_KEY`

## Production Deployment Checklist

- [ ] All environment variables are set
- [ ] Database is properly configured and migrated
- [ ] SSL certificates are configured
- [ ] Domain is properly configured
- [ ] Environment validation passes
- [ ] All API keys have proper permissions
- [ ] Rate limiting is configured
- [ ] Error monitoring is set up
- [ ] Performance monitoring is configured

## Testing Environment Variables

Use the built-in environment check endpoint:

```bash
curl https://yourdomain.com/api/auth/check-env
```

This will verify that all required environment variables are properly configured.

## Troubleshooting

### Map Not Loading
- Check `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is set
- Verify the token has proper permissions
- Check browser console for errors

### Authentication Not Working
- Verify Supabase credentials
- Check `NEXT_PUBLIC_APP_URL` matches your domain
- Ensure Resend API key is valid

### Credit System Issues
- Verify Stripe credentials
- Check `STRIPE_PREMIUM_PRICE_ID` exists
- Ensure webhook endpoints are configured
