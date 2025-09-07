import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface BoxCountResult {
  city: string;
  count: number;
}

export async function GET(request: NextRequest) {
  try {
    // Environment variable validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing required environment variables for Supabase connection');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Service configuration error',
          message: 'Database connection not properly configured'
        },
        { status: 500 }
      );
    }

    // Create Supabase client with service role for public data access
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Use SQL aggregation for efficient counting - much better than fetching all records
    const { data: boxesCount, error } = await supabase
      .rpc('get_boxes_count_by_city');

    // Fallback to manual counting if RPC function doesn't exist
    if (error && error.code === 'PGRST202') {
      console.log('RPC function not found, using fallback query');
      
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('boxes')
        .select('city')
        .eq('status', 'active')
        .not('city', 'is', null);

      if (fallbackError) {
        console.error('Database error fetching boxes count by city:', fallbackError);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Database query failed',
            message: 'Unable to retrieve box counts at this time',
            details: fallbackError.message,
            code: fallbackError.code
          },
          { status: 500 }
        );
      }

      // Process fallback data
      const countByCity: Record<string, number> = {};
      if (fallbackData && Array.isArray(fallbackData)) {
        fallbackData.forEach((box: { city: string }) => {
          if (box.city && typeof box.city === 'string') {
            const cityName = box.city.trim();
            if (cityName) {
              countByCity[cityName] = (countByCity[cityName] || 0) + 1;
            }
          }
        });
      }

      return NextResponse.json({
        success: true,
        data: countByCity,
        meta: {
          totalCities: Object.keys(countByCity).length,
          totalBoxes: Object.values(countByCity).reduce((sum, count) => sum + count, 0),
          timestamp: new Date().toISOString(),
          method: 'fallback'
        }
      });
    }

    if (error) {
      console.error('Database error fetching boxes count by city:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database query failed',
          message: 'Unable to retrieve box counts at this time',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }

    // Process RPC result
    const countByCity: Record<string, number> = {};
    if (boxesCount && Array.isArray(boxesCount)) {
      boxesCount.forEach((result: BoxCountResult) => {
        if (result.city && typeof result.city === 'string' && typeof result.count === 'number') {
          const cityName = result.city.trim();
          if (cityName) {
            countByCity[cityName] = result.count;
          }
        }
      });
    }

    // Return successful response with proper data structure
    return NextResponse.json({
      success: true,
      data: countByCity,
      meta: {
        totalCities: Object.keys(countByCity).length,
        totalBoxes: Object.values(countByCity).reduce((sum, count) => sum + count, 0),
        timestamp: new Date().toISOString(),
        method: 'rpc'
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/boxes/count-by-city:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
