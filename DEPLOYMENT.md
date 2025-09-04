# AlsetMaps Deployment Guide

This guide covers deploying the AlsetMaps platform to various hosting providers.

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended)

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your `alsetso/alsetmaps` repository

2. **Configure Environment Variables:**
   Add these environment variables in your Vercel project settings:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
   NEXT_PUBLIC_RAPIDAPI_KEY=your_rapidapi_key
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   ```

3. **Deploy:**
   - Vercel will automatically deploy on every push to main
   - Your app will be available at `https://your-project.vercel.app`

### Option 2: Netlify

1. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign in with GitHub
   - Click "New site from Git"
   - Select your `alsetso/alsetmaps` repository

2. **Build Settings:**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Environment Variables:**
   Add the same environment variables as Vercel in Netlify's site settings.

### Option 3: Railway

1. **Connect to Railway:**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `alsetso/alsetmaps` repository

2. **Environment Variables:**
   Add the required environment variables in Railway's project settings.

## 🔧 Manual Deployment

### Prerequisites
- Node.js 18+
- npm or yarn
- All required API keys and services configured

### Steps

1. **Clone and Install:**
   ```bash
   git clone https://github.com/alsetso/alsetmaps.git
   cd alsetmaps
   npm install
   ```

2. **Environment Setup:**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Build:**
   ```bash
   npm run build
   ```

4. **Start:**
   ```bash
   npm start
   ```

## 🗄️ Database Setup

### Supabase Setup

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run Database Schema:**
   ```sql
   -- Run the SQL from supabase/database/tables/tables.sql
   -- This creates all necessary tables and functions
   ```

3. **Configure Authentication:**
   - Enable email authentication in Supabase Auth settings
   - Configure OAuth providers if needed
   - Set up email templates

## 🔑 Required API Keys

### Mapbox
1. Go to [mapbox.com](https://mapbox.com)
2. Create an account and get your access token
3. Add to environment variables as `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

### RapidAPI (Optional)
1. Go to [rapidapi.com](https://rapidapi.com)
2. Subscribe to property data APIs
3. Add your API key as `NEXT_PUBLIC_RAPIDAPI_KEY`

## 🚀 GitHub Actions CI/CD

The repository includes a GitHub Actions workflow that:
- Runs on every push to main
- Performs linting and type checking
- Builds the application
- Deploys to Vercel (if configured)

### Setting up GitHub Actions Secrets

Add these secrets to your GitHub repository:
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID
- All environment variables for the build process

## 📊 Monitoring and Analytics

### Vercel Analytics
- Automatically enabled on Vercel deployments
- Provides performance metrics and user analytics

### Custom Analytics
- Add your preferred analytics service
- Configure in the app layout or specific components

## 🔒 Security Considerations

1. **Environment Variables:**
   - Never commit `.env.local` to version control
   - Use different keys for development and production
   - Rotate keys regularly

2. **Database Security:**
   - Enable Row Level Security (RLS) in Supabase
   - Use service role keys only on the server side
   - Implement proper authentication checks

3. **API Rate Limiting:**
   - Implement rate limiting for API endpoints
   - Monitor usage and set appropriate limits

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check all environment variables are set
   - Ensure all dependencies are installed
   - Review build logs for specific errors

2. **Database Connection Issues:**
   - Verify Supabase URL and keys
   - Check database permissions
   - Ensure tables are created properly

3. **Map Not Loading:**
   - Verify Mapbox access token
   - Check domain restrictions in Mapbox settings
   - Ensure token has correct permissions

### Getting Help

- Check the [GitHub Issues](https://github.com/alsetso/alsetmaps/issues)
- Review the documentation in the `/docs` folder
- Join our community discussions

## 📈 Performance Optimization

1. **Image Optimization:**
   - Use Next.js Image component
   - Implement proper image sizing
   - Consider using a CDN

2. **Code Splitting:**
   - Leverage Next.js automatic code splitting
   - Use dynamic imports for heavy components

3. **Caching:**
   - Implement proper caching strategies
   - Use Supabase's built-in caching features
   - Consider Redis for session storage

## 🔄 Updates and Maintenance

1. **Regular Updates:**
   - Keep dependencies updated
   - Monitor security advisories
   - Test updates in staging environment

2. **Backup Strategy:**
   - Regular database backups
   - Version control for all code changes
   - Document configuration changes

---

For more detailed information, see the main [README.md](README.md) file.
