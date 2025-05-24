
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QrCode, Bell, Car } from 'lucide-react'

export function HowItWorks() {
  return (
    <div className="grid md:grid-cols-3 gap-8 mb-16">
      <Card className="text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
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

      <Card className="text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
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

      <Card className="text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
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
  )
}
