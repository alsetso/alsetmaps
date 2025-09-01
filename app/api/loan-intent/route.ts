import { NextRequest, NextResponse } from 'next/server';
import { LoanLeadData } from '@/features/marketplace-intents/types/loan-intent';

export async function POST(request: NextRequest) {
  try {
    const body: LoanLeadData = await request.json();
    
    // Validate required fields
    if (!body.scenario) {
      return NextResponse.json(
        { error: 'Loan scenario is required' },
        { status: 400 }
      );
    }

    if (body.scenario === 'prequalify' && !body.preQualification) {
      return NextResponse.json(
        { error: 'Pre-qualification data is required' },
        { status: 400 }
      );
    }

    if (body.scenario === 'rate-beat' && !body.rateBeat) {
      return NextResponse.json(
        { error: 'Rate beat data is required' },
        { status: 400 }
      );
    }

    // Generate lead ID
    const leadId = `LOAN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add timestamp and lead ID
    const enrichedData = {
      ...body,
      leadId,
      timestamp: new Date(),
    };

    // TODO: Save to database
    // TODO: Send notification emails
    // TODO: Integrate with CRM system
    // TODO: Route to appropriate loan officers
    
    // Log the submission for now
    console.log('Loan Lead Submission:', {
      leadId,
      scenario: body.scenario,
      timestamp: new Date().toISOString(),
      data: enrichedData,
    });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      leadId,
      message: 'Loan inquiry submitted successfully',
    });

  } catch (error) {
    console.error('Error processing loan lead:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
