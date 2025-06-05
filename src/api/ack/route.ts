import { logger } from '../../lib/utils'
import { rpcFunctions } from '../../lib/supabaseClient'
import { sanitizeAndValidate, validate } from '../../lib/validation'

// API route handler for acknowledge endpoint
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { incidentId: rawIncidentId, etaMinutes: rawEtaMinutes } = body
    
    // Validate incident ID
    if (!validate.incidentId(rawIncidentId)) {
      logger.warn('Invalid incident ID provided to ack API', { incidentId: rawIncidentId })
      return new Response(
        JSON.stringify({ error: 'Invalid incident ID format' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate ETA minutes if provided
    let etaMinutes: number | undefined
    if (rawEtaMinutes !== undefined && rawEtaMinutes !== null) {
      const etaResult = sanitizeAndValidate.etaMinutes(rawEtaMinutes)
      if (!etaResult.isValid) {
        logger.warn('Invalid ETA minutes provided to ack API', { etaMinutes: rawEtaMinutes })
        return new Response(
          JSON.stringify({ error: 'Invalid ETA minutes (must be 0-1440)' }), 
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
      etaMinutes = etaResult.value
    }

    logger.info(`Acknowledging incident: ${rawIncidentId}, ETA: ${etaMinutes} minutes`)

    // Use Supabase RPC function directly
    const result = await rpcFunctions.ackIncident(rawIncidentId, etaMinutes)

    return new Response(
      JSON.stringify({ success: true, data: result }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    logger.error('Acknowledge API error', error)
    return new Response(
      JSON.stringify({ error: 'Failed to acknowledge incident' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Legacy function for backward compatibility
export async function ackIncident(incidentId: string, etaMinutes?: number) {
  try {
    // Validate incident ID
    if (!validate.incidentId(incidentId)) {
      throw new Error('Invalid incident ID format')
    }
    
    // Validate ETA minutes if provided
    if (etaMinutes !== undefined) {
      const etaResult = sanitizeAndValidate.etaMinutes(etaMinutes)
      if (!etaResult.isValid) {
        throw new Error('Invalid ETA minutes')
      }
      etaMinutes = etaResult.value
    }
    
    logger.info(`Legacy ack function called for incident: ${incidentId}, ETA: ${etaMinutes} minutes`)
    return await rpcFunctions.ackIncident(incidentId, etaMinutes)
  } catch (error) {
    logger.error('Legacy ack function error', error)
    throw error
  }
} 