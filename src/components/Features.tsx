import React from 'react'

export function Features() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      <div className="feature-item text-center" style={{ animationDelay: '0.1s' }}>
        <div className="feature-emoji text-3xl mb-2">⚡</div>
        <h3 className="font-semibold mb-1 dark:text-white">Instant Notifications</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">WhatsApp alerts in seconds</p>
      </div>
      <div className="feature-item text-center" style={{ animationDelay: '0.2s' }}>
        <div className="feature-emoji text-3xl mb-2">🤖</div>
        <h3 className="font-semibold mb-1 dark:text-white">AI-Powered</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">Smart urgency detection</p>
      </div>
      <div className="feature-item text-center" style={{ animationDelay: '0.3s' }}>
        <div className="feature-emoji text-3xl mb-2">🔒</div>
        <h3 className="font-semibold mb-1 dark:text-white">Privacy Protected</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">No personal data exposed</p>
      </div>
      <div className="feature-item text-center" style={{ animationDelay: '0.4s' }}>
        <div className="feature-emoji text-3xl mb-2">📱</div>
        <h3 className="font-semibold mb-1 dark:text-white">Mobile First</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">Works on any smartphone</p>
      </div>

      <style>{`
        .feature-item {
          animation: fadeInUp 0.6s ease-out both;
          transition: transform 0.3s ease;
          padding: 1rem;
          border-radius: 0.75rem;
        }
        
        .feature-item:hover {
          transform: translateY(-5px);
          background: rgba(249, 115, 22, 0.05);
        }
        
        .feature-emoji {
          transition: transform 0.3s ease;
        }
        
        .feature-item:hover .feature-emoji {
          transform: scale(1.2) rotate(10deg);
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
