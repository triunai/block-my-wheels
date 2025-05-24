
// Simple API function for notify endpoint
export async function notifyDriver(token: string, rage: number = 0) {
  try {
    console.log(`Notifying driver for token: ${token}, rage: ${rage}`)

    // This would normally be handled by a backend API
    // For now, we'll simulate the API call
    const response = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, rage })
    })

    if (!response.ok) {
      throw new Error('Failed to notify driver')
    }

    return await response.json()
  } catch (error) {
    console.error('Notify API error:', error)
    throw error
  }
}
