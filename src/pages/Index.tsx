
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QrCode, Car, Bell, Users } from 'lucide-react'
import { ScanPage } from './ScanPage'
import { DriverDashboard } from './DriverDashboard'
import { StickerGenerator } from './StickerGenerator'
import { AdminDashboard } from './AdminDashboard'

export default function Index() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')
  
  // Simple routing based on URL parameters
  const page = searchParams?.get('page')
  
  // If we have a token, show the scan page
  if (token) {
    return <ScanPage token={token} />
  }

  // Route to different pages based on page parameter
  switch (page) {
    case 'dashboard':
      return <DriverDashboard />
    case 'stickers':
      return <StickerGenerator />
    case 'admin':
      return <AdminDashboard />
    default:
      return <LandingPage />
  }
}

function LandingPage() {
  const router = useRouter()

  const handleNavigation = (page: string) => {
    router.push(`/?page=${page}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <QrCode className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">AI Driver Alert</h1>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Beta
            </Badge>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Never get trapped by a <br />
            <span className="text-blue-600">parked car</span> again
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Smart QR stickers that instantly notify drivers via WhatsApp when their vehicle is blocking someone. 
            AI-powered, hassle-free, and gets results in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={() => handleNavigation('stickers')}
            >
              <QrCode className="w-5 h-5 mr-2" />
              Generate My Sticker
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={() => handleNavigation('dashboard')}
            >
              <Car className="w-5 h-5 mr-2" />
              Driver Dashboard
            </Button>
          </div>
        </div>

        {/* How It Works */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex flex-col items-center">
                <QrCode className="w-12 h-12 text-blue-600 mb-4" />
                1. Generate Sticker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create a personalized QR sticker with your license plate and place it on your windscreen.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex flex-col items-center">
                <Bell className="w-12 h-12 text-green-600 mb-4" />
                2. Get Notified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                When someone scans your sticker, you instantly receive a WhatsApp notification with their urgency level.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex flex-col items-center">
                <Car className="w-12 h-12 text-purple-600 mb-4" />
                3. Respond Fast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Acknowledge the notification and set your ETA. The person waiting gets real-time updates.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
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

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
            <p className="mb-6 opacity-90">Join thousands of drivers already using AI Driver Alert</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => handleNavigation('stickers')}
              >
                Create My Sticker
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => window.open('/?token=demo', '_blank')}
              >
                Try Demo Scan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <QrCode className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-gray-700">AI Driver Alert</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleNavigation('admin')}
            >
              <Users className="w-4 h-4 mr-1" />
              Admin
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
