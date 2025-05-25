import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { QrCode, Bell, Car } from 'lucide-react'

export function HowItWorks() {
  return (
    <div className="grid md:grid-cols-3 gap-8 mb-16">
      <Card className="how-it-works-card text-center hover:shadow-2xl hover:shadow-orange-200/50 dark:hover:shadow-orange-500/20 transition-all duration-500 transform hover:-translate-y-2 shadow-lg bg-white/90 dark:bg-black/50 backdrop-blur-sm border-2 border-gray-300/50 dark:border-orange-400/50" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle className="flex flex-col items-center dark:text-white">
            <div className="icon-container mb-4">
              <QrCode className="w-12 h-12 text-orange-500 dark:text-orange-500 transition-transform duration-300" />
            </div>
            1. Generate Sticker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-300">
            Create a personalized QR sticker with your license plate and place it on your windscreen.
          </p>
        </CardContent>
      </Card>

      <Card className="how-it-works-card text-center hover:shadow-2xl hover:shadow-orange-200/50 dark:hover:shadow-orange-500/20 transition-all duration-500 transform hover:-translate-y-2 shadow-lg bg-white/90 dark:bg-black/50 backdrop-blur-sm border-2 border-gray-300/50 dark:border-orange-400/50" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle className="flex flex-col items-center dark:text-white">
            <div className="icon-container mb-4">
              <Bell className="w-12 h-12 text-orange-600 dark:text-orange-400 transition-transform duration-300" />
            </div>
            2. Get Notified
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-300">
            When someone scans your sticker, you instantly receive a WhatsApp notification with their urgency level.
          </p>
        </CardContent>
      </Card>

      <Card className="how-it-works-card text-center hover:shadow-2xl hover:shadow-orange-200/50 dark:hover:shadow-orange-500/20 transition-all duration-500 transform hover:-translate-y-2 shadow-lg bg-white/90 dark:bg-black/50 backdrop-blur-sm border-2 border-gray-300/50 dark:border-orange-400/50" style={{ animationDelay: '0.3s' }}>
        <CardHeader>
          <CardTitle className="flex flex-col items-center dark:text-white">
            <div className="icon-container mb-4">
              <Car className="w-12 h-12 text-orange-700 dark:text-orange-300 transition-transform duration-300" />
            </div>
            3. Respond Fast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-300">
            Acknowledge the notification and set your ETA. The person waiting gets real-time updates.
          </p>
        </CardContent>
      </Card>

      <style>{`
        .how-it-works-card {
          animation: fadeInUp 0.6s ease-out both;
        }
        
        .how-it-works-card:hover .icon-container {
          transform: scale(1.1) rotate(5deg);
        }
        
        .how-it-works-card:hover {
          border-color: rgba(249, 115, 22, 0.6);
        }
        
        .icon-container {
          transition: transform 0.3s ease;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
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
