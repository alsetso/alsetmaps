import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { account_id, address_id, form_data, source = 'web_form', tags = [] } = body;

    // Validate required fields
    if (!account_id || !form_data) {
      return NextResponse.json(
        { error: 'Missing required fields: account_id and form_data are required' },
        { status: 400 }
      );
    }

    // Transform form data to database format
    const refinanceRequest = {
      account_id,
      address_id,
      status: 'pending',
      priority: determinePriority(form_data.timeline, form_data.urgencyReason),
      
      // Personal Information
      first_name: form_data.firstName,
      last_name: form_data.lastName,
      email: form_data.email,
      phone: form_data.phone,
      
      // Property Information
      property_address: form_data.propertyAddress,
      property_city: form_data.propertyCity,
      property_state: form_data.propertyState,
      property_zip: form_data.propertyZip,
      current_property_value: form_data.currentPropertyValue,
      
      // Current Loan Information
      current_lender: form_data.currentLender,
      current_loan_balance: form_data.currentLoanBalance,
      current_interest_rate: form_data.currentInterestRate,
      current_monthly_payment: form_data.currentMonthlyPayment,
      current_loan_term: form_data.currentLoanTerm,
      current_loan_type: form_data.currentLoanType,
      current_loan_origination_date: form_data.currentLoanOriginationDate,
      current_pmi_amount: form_data.currentPmiAmount || 0,
      
      // Refinance Goals & Preferences
      refinance_type: form_data.refinanceType,
      primary_reason: form_data.primaryReason,
      secondary_reasons: form_data.secondaryReasons || [],
      
      // Desired Terms
      desired_interest_rate: form_data.desiredInterestRate,
      desired_loan_term: form_data.desiredLoanTerm,
      desired_loan_type: form_data.desiredLoanType,
      cash_out_amount: form_data.cashOutAmount || 0,
      
      // Financial Profile
      credit_score_range: form_data.creditScoreRange,
      gross_monthly_income: form_data.grossMonthlyIncome,
      employment_status: form_data.employmentStatus,
      years_employed: form_data.yearsEmployed,
      
      // Timeline & Urgency
      timeline: form_data.timeline,
      urgency_reason: form_data.urgencyReason,
      
      // Additional Information
      additional_notes: form_data.additionalNotes,
      special_circumstances: form_data.specialCircumstances,
      
      // Metadata
      source,
      tags,
      
      // Timestamps
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
    };

    // Insert into database
    const { data, error } = await supabase
      .from('refinance_requests')
      .insert([refinanceRequest])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create refinance request' },
        { status: 500 }
      );
    }

    // Also create an entry in the intents table for backward compatibility
    const intentData = {
      account_id,
      address_id,
      intent_type: 'refinance',
      status: 'active',
      intent_data: {
        ...form_data,
        request_id: data.id,
        created_at: new Date().toISOString(),
      },
      is_public: false,
      requires_approval: true,
    };

    await supabase
      .from('intents')
      .insert([intentData]);

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Error creating refinance request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build query with filters
    let query = supabase
      .from('refinance_requests')
      .select('*', { count: 'exact' });

    // Apply filters
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const refinance_type = searchParams.get('refinance_type');
    const primary_reason = searchParams.get('primary_reason');
    const timeline = searchParams.get('timeline');
    const assigned_to = searchParams.get('assigned_to');
    const property_state = searchParams.get('property_state');
    const credit_score_range = searchParams.get('credit_score_range');
    const created_after = searchParams.get('created_after');
    const created_before = searchParams.get('created_before');

    if (status) query = query.in('status', status.split(','));
    if (priority) query = query.in('priority', priority.split(','));
    if (refinance_type) query = query.in('refinance_type', refinance_type.split(','));
    if (primary_reason) query = query.in('primary_reason', primary_reason.split(','));
    if (timeline) query = query.in('timeline', timeline.split(','));
    if (assigned_to) query = query.eq('assigned_to', assigned_to);
    if (property_state) query = query.in('property_state', property_state.split(','));
    if (credit_score_range) query = query.in('credit_score_range', credit_score_range.split(','));
    if (created_after) query = query.gte('created_at', created_after);
    if (created_before) query = query.lte('created_at', created_before);

    // Apply sorting
    const sort_by = searchParams.get('sort_by') || 'created_at';
    const sort_order = searchParams.get('sort_order') || 'desc';
    query = query.order(sort_by, { ascending: sort_order === 'asc' });

    // Apply pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch refinance requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      requests: data || [],
      total: count || 0,
      page,
      limit,
    });

  } catch (error) {
    console.error('Error fetching refinance requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to determine priority
function determinePriority(timeline: string, urgencyReason?: string): string {
  if (timeline === 'asap' || urgencyReason?.toLowerCase().includes('urgent')) {
    return 'urgent';
  }
  if (timeline === '1-3months') {
    return 'high';
  }
  if (timeline === '3-6months') {
    return 'normal';
  }
  return 'low';
}
