
import { NextRequest, NextResponse } from 'next/server'
import { rpcFunctions } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const { token, rage = 0 } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    console.log(`Notifying driver for token: ${token}, rage: ${rage}`)

    // Call Supabase RPC to handle notification
    const result = await rpcFunctions.notifyDriver(token, rage)

    // In a real implementation, this would trigger n8n webhook
    // For now, we'll just log it
    const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/notify'
    
    console.log(`Would call n8n webhook: ${webhookUrl}`, {
      token,
      rage,
      timestamp: new Date().toISOString(),
    })

    // Mock webhook call (in production, this would be a real HTTP request)
    try {
      // fetch(webhookUrl, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, rage, timestamp: new Date().toISOString() })
      // })
    } catch (webhookError) {
      console.error('Webhook call failed:', webhookError)
      // Don't fail the main request if webhook fails
    }

    return NextResponse.json({ 
      success: true,
      message: 'Driver notification sent',
      data: result 
    })

  } catch (error) {
    console.error('Notify API error:', error)
    return NextResponse.json(
      { error: 'Failed to notify driver' },
      { status: 500 }
    )
  }
}
