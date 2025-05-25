import React from 'react'

export function Features() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      <div className="text-center">
        <div className="text-3xl mb-2">⚡</div>
        <h3 className="font-semibold mb-1 dark:text-white">Instant Notifications</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">WhatsApp alerts in seconds</p>
      </div>
      <div className="text-center">
        <div className="text-3xl mb-2">🤖</div>
        <h3 className="font-semibold mb-1 dark:text-white">AI-Powered</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">Smart urgency detection</p>
      </div>
      <div className="text-center">
        <div className="text-3xl mb-2">🔒</div>
        <h3 className="font-semibold mb-1 dark:text-white">Privacy Protected</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">No personal data exposed</p>
      </div>
      <div className="text-center">
        <div className="text-3xl mb-2">📱</div>
        <h3 className="font-semibold mb-1 dark:text-white">Mobile First</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">Works on any smartphone</p>
      </div>
    </div>
  )
}
