import { logger } from '../../lib/utils'
import { rpcFunctions } from '../../lib/supabaseClient'
import { sanitizeAndValidate } from '../../lib/validation'
import type { NotifyDriverRequest } from '../../interfaces/requests'
import type { NotifyDriverResponse, ApiResponse } from '../../interfaces/responses'

// API route handler for notify endpoint
export async function POST(request: Request): Promise<Response> {
  try {
    const body: NotifyDriverRequest = await request.json()
    const { token: rawToken, rage: rawRage = 0 } = body
    
    // Validate and sanitize inputs
    const tokenResult = sanitizeAndValidate.token(rawToken)
    const rageResult = sanitizeAndValidate.rageLevel(rawRage)
    
    if (!tokenResult.isValid) {
      logger.warn('Invalid token provided to notify API', { token: rawToken })
      const errorResponse: ApiResponse = { 
        success: false, 
        error: 'Invalid token format' 
      }
      return new Response(
        JSON.stringify(errorResponse), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!rageResult.isValid) {
      logger.warn('Invalid rage level provided to notify API', { rage: rawRage })
      const errorResponse: ApiResponse = { 
        success: false, 
        error: 'Invalid rage level (must be 0-10)' 
      }
      return new Response(
        JSON.stringify(errorResponse), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    logger.info(`Notifying driver for token: ${tokenResult.value}, rage: ${rageResult.value}`)

    // Use Supabase RPC function directly
    const result = await rpcFunctions.notifyDriver(tokenResult.value, rageResult.value)

    const response: ApiResponse<NotifyDriverResponse> = {
      success: true,
      data: {
        success: true,
        message: 'Driver notified successfully',
        incidentId: result?.incidentId
      }
    }

    return new Response(
      JSON.stringify(response), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    logger.error('Notify API error', error)
    const errorResponse: ApiResponse = {
      success: false,
      error: 'Failed to notify driver'
    }
    return new Response(
      JSON.stringify(errorResponse), 
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