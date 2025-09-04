# 🏠 Smart Search System Setup Guide

## Overview
The Smart Search system now integrates with the real Zillow API to provide enhanced property data. Basic searches remain free, while smart searches cost 1 credit and return comprehensive property information.

## 🚀 Quick Start

### 1. Database Setup
Run the following SQL script to add the `smart_data` column:

```sql
-- Run this in your Supabase SQL editor
ALTER TABLE public.search_history 
ADD COLUMN smart_data JSONB;

-- Add a comment to document the column purpose
COMMENT ON COLUMN public.search_history.smart_data IS 'Stores the full API response data from Zillow for smart searches. NULL for basic searches.';

-- Create an index on the smart_data column for better query performance
CREATE INDEX idx_search_history_smart_data ON public.search_history USING GIN (smart_data);
```

### 2. Environment Variables
Add your RapidAPI key to your `.env.local` file:

```bash
# RapidAPI Configuration
NEXT_PUBLIC_RAPIDAPI_KEY=f4a7d42741mshbc2b95a8fd24074p1cf1a6jsn44343abb32e8
```

**Note**: The system includes a fallback API key for testing, but you should use your own for production.

### 3. Test the System
1. Go to `/` and perform a search
2. Toggle between "Basic" and "Smart" search types
3. View your search history at `/search-history`

## 🔧 How It Works

### Search Types

#### Basic Search (Free)
- No credits required
- Basic property information
- Minimal data stored

#### Smart Search (1 Credit)
- Requires 1 credit
- Calls real Zillow API
- Stores full API response in `smart_data` column
- Enhanced property insights

### Data Flow
```
User Input → Address Selection → Search Type Selection → API Call → Credit Deduction → Data Storage → Results Display
```

### Credit System
- **Basic searches**: 0 credits (free)
- **Smart searches**: 1 credit
- Credits are automatically deducted from user's account
- Insufficient credits prevent smart searches

## 📊 Database Schema

### `search_history` Table
```sql
CREATE TABLE public.search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.accounts(id),
    search_address TEXT NOT NULL,
    search_type TEXT CHECK (search_type IN ('basic', 'smart')),
    credits_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    smart_data JSONB  -- NEW: Stores Zillow API response
);
```

### `credits` Table
```sql
CREATE TABLE public.credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.accounts(id),
    available_credits INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🎯 API Integration

### Zillow API Endpoint
```
GET https://zillow56.p.rapidapi.com/search_address
```

### Headers
```
x-rapidapi-host: zillow56.p.rapidapi.com
x-rapidapi-key: YOUR_RAPIDAPI_KEY
```

### Example Response Storage
The full Zillow API response is stored in the `smart_data` column as JSON:

```json
{
  "type": "smart",
  "address": "1161 Natchez Dr College Station Texas 77845",
  "timestamp": "2025-01-02T21:38:02.000Z",
  "zillowData": {
    // Full Zillow API response here
  },
  "message": "Smart search completed with real Zillow data"
}
```

## 🧪 Testing

### Test Basic Search
1. Select "Basic" search type
2. Enter an address
3. Verify: No credits deducted, minimal data stored

### Test Smart Search
1. Select "Smart" search type
2. Enter an address
3. Verify: 1 credit deducted, full Zillow data stored
4. Check `/search-history` for stored data

### Test Credit System
1. Perform multiple smart searches
2. Monitor credit balance
3. Verify credits are properly deducted

## 🔍 Search History Page

### Features
- **Stats Dashboard**: Total searches, basic/smart counts, credits used
- **Search Details**: Address, type, credits, timestamp
- **Smart Data Display**: Full Zillow API response for smart searches
- **Responsive Design**: Works on all devices

### Navigation
- Main nav: "Search History" link
- SmartSearch component: "View Your Search History" link
- Direct URL: `/search-history`

## 🚨 Troubleshooting

### Common Issues

#### "Insufficient credits for smart search"
- User doesn't have enough credits
- Check `credits.available_credits` in database
- Add credits via database or admin interface

#### "Zillow API error"
- Check RapidAPI key validity
- Verify API endpoint accessibility
- Check network connectivity

#### "Smart data not available"
- Smart search may have failed
- Check browser console for errors
- Verify `smart_data` column exists

### Debug Steps
1. Check browser console for errors
2. Verify environment variables
3. Check Supabase logs
4. Verify database schema
5. Test API endpoint directly

## 🔒 Security Considerations

### Row Level Security (RLS)
- Users can only see their own search history
- `smart_data` is protected by existing RLS policies
- No additional policies needed

### API Key Security
- RapidAPI key is exposed to client (required for frontend calls)
- Consider rate limiting for production use
- Monitor API usage and costs

## 📈 Production Considerations

### Rate Limiting
- Implement rate limiting for smart searches
- Monitor credit usage patterns
- Set reasonable limits per user

### Cost Management
- Monitor RapidAPI usage costs
- Implement credit purchase system
- Set credit limits and expiration

### Performance
- `smart_data` column is indexed for fast queries
- Consider archiving old search data
- Monitor database size growth

## 🎉 Success Metrics

### User Experience
- ✅ Basic searches work without credits
- ✅ Smart searches provide enhanced data
- ✅ Credit system functions correctly
- ✅ Search history is comprehensive

### Technical
- ✅ Zillow API integration working
- ✅ Data storage in `smart_data` column
- ✅ Credit deduction system operational
- ✅ Search history page functional

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review browser console errors
3. Check Supabase logs
4. Verify database schema
5. Test API endpoints directly

---

**Happy Searching! 🏠✨**
