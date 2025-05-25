import React from 'react'

export function Features() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      <div className="text-center">
        <div className="text-3xl mb-2">⚡</div>
        <h3 className="font-semibold mb-1">Instant Notifications</h3>
        <p className="text-sm text-gray-600">WhatsApp alerts in seconds</p>
      </div>
      <div className="text-center">
        <div className="text-3xl mb-2">🤖</div>
        <h3 className="font-semibold mb-1">AI-Powered</h3>
        <p className="text-sm text-gray-600">Smart urgency detection</p>
      </div>
      <div className="text-center">
        <div className="text-3xl mb-2">🔒</div>
        <h3 className="font-semibold mb-1">Privacy Protected</h3>
        <p className="text-sm text-gray-600">No personal data exposed</p>
      </div>
      <div className="text-center">
        <div className="text-3xl mb-2">📱</div>
        <h3 className="font-semibold mb-1">Mobile First</h3>
        <p className="text-sm text-gray-600">Works on any smartphone</p>
      </div>
    </div>
  )
}
