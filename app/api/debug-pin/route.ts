import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClientFromRequest } from '@/integrations/supabase/server-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pinId = searchParams.get('id');
    
    if (!pinId) {
      return NextResponse.json({ error: 'Pin ID required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClientFromRequest(request);
    
    // Get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('🔍 DEBUG: User:', user);
    console.log('🔍 DEBUG: Auth error:', authError);
    
    // Check if pin exists at all
    const { data: allPins, error: allPinsError } = await supabase
      .from('pins')
      .select('*')
      .eq('id', pinId);
    
    console.log('🔍 DEBUG: All pins query:', { allPins, allPinsError });
    
    // Check if pin exists with account_id filter
    let accountFilterResult = null;
    if (user) {
      const { data: accountPins, error: accountPinsError } = await supabase
        .from('pins')
        .select('*')
        .eq('id', pinId)
        .eq('account_id', user.id);
      
      accountFilterResult = { accountPins, accountPinsError };
      console.log('🔍 DEBUG: Account filter query:', accountFilterResult);
    }
    
    return NextResponse.json({
      pinId,
      user: user ? { id: user.id, email: user.email } : null,
      authError,
      allPins,
      allPinsError,
      accountFilterResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('🔍 DEBUG: Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}