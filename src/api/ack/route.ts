
// Simple API function for acknowledge endpoint
export async function ackIncident(incidentId: string, etaMinutes?: number) {
  try {
    console.log(`Acknowledging incident: ${incidentId}, ETA: ${etaMinutes} minutes`)

    // This would normally be handled by a backend API
    // For now, we'll simulate the API call
    const response = await fetch('/api/ack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentId, etaMinutes })
    })

    if (!response.ok) {
      throw new Error('Failed to acknowledge incident')
    }

    return await response.json()
  } catch (error) {
    console.error('Acknowledge API error:', error)
    throw error
  }
}
