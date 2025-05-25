import { logger } from '../../lib/utils'
import { rpcFunctions } from '../../lib/supabaseClient'
import { sanitizeAndValidate } from '../../lib/validation'

// API route handler for notify endpoint
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token: rawToken, rage: rawRage = 0 } = body
    
    // Validate and sanitize inputs
    const tokenResult = sanitizeAndValidate.token(rawToken)
    const rageResult = sanitizeAndValidate.rageLevel(rawRage)
    
    if (!tokenResult.isValid) {
      logger.warn('Invalid token provided to notify API', { token: rawToken })
      return new Response(
        JSON.stringify({ error: 'Invalid token format' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!rageResult.isValid) {
      logger.warn('Invalid rage level provided to notify API', { rage: rawRage })
      return new Response(
        JSON.stringify({ error: 'Invalid rage level (must be 0-10)' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    logger.info(`Notifying driver for token: ${tokenResult.value}, rage: ${rageResult.value}`)

    // Use Supabase RPC function directly
    const result = await rpcFunctions.notifyDriver(tokenResult.value, rageResult.value)

    return new Response(
      JSON.stringify({ success: true, data: result }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    logger.error('Notify API error', error)
    return new Response(
      JSON.stringify({ error: 'Failed to notify driver' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Legacy function for backward compatibility
export async function notifyDriver(token: string, rage: number = 0) {
  try {
    // Validate inputs
    const tokenResult = sanitizeAndValidate.token(token)
    const rageResult = sanitizeAndValidate.rageLevel(rage)
    
    if (!tokenResult.isValid) {
      throw new Error('Invalid token format')
    }
    
    if (!rageResult.isValid) {
      throw new Error('Invalid rage level')
    }
    
    logger.info(`Legacy notify function called for token: ${tokenResult.value}, rage: ${rageResult.value}`)
    return await rpcFunctions.notifyDriver(tokenResult.value, rageResult.value)
  } catch (error) {
    logger.error('Legacy notify function error', error)
    throw error
  }
} 