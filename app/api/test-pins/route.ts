import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test Pins API: Starting test');
    
    const supabase = createServerSupabaseClient();
    
    // Test 1: Check if pins table exists and is accessible
    const { data: allPins, error: allPinsError } = await supabase
      .from('pins')
      .select('id, user_id, created_at')
      .limit(5);
    
    console.log('🔍 Test Pins API: All pins query', {
      count: allPins?.length || 0,
      error: allPinsError?.message,
      errorCode: allPinsError?.code
    });
    
    // Test 2: Check accounts table
    const { data: allAccounts, error: allAccountsError } = await supabase
      .from('accounts')
      .select('id, auth_user_id, email')
      .limit(5);
    
    console.log('🔍 Test Pins API: All accounts query', {
      count: allAccounts?.length || 0,
      error: allAccountsError?.message,
      errorCode: allAccountsError?.code
    });
    
    return NextResponse.json({
      success: true,
      pins: {
        count: allPins?.length || 0,
        data: allPins,
        error: allPinsError?.message
      },
      accounts: {
        count: allAccounts?.length || 0,
        data: allAccounts,
        error: allAccountsError?.message
      }
    });
    
  } catch (error) {
    console.error('❌ Test Pins API: Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
