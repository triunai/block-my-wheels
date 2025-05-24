
import { NextRequest, NextResponse } from 'next/server'
import { rpcFunctions } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const { incidentId, etaMinutes } = await request.json()

    if (!incidentId) {
      return NextResponse.json(
        { error: 'Incident ID is required' },
        { status: 400 }
      )
    }

    console.log(`Acknowledging incident: ${incidentId}, ETA: ${etaMinutes} minutes`)

    // Call Supabase RPC to acknowledge incident
    const result = await rpcFunctions.ackIncident(incidentId, etaMinutes)

    return NextResponse.json({ 
      success: true,
      message: 'Incident acknowledged',
      data: result 
    })

  } catch (error) {
    console.error('Acknowledge API error:', error)
    return NextResponse.json(
      { error: 'Failed to acknowledge incident' },
      { status: 500 }
    )
  }
}
