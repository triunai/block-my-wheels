
import { Button } from '@/components/ui/button'
import { QrCode, Car } from 'lucide-react'

interface HeroSectionProps {
  onNavigation: (page: string) => void
}

export function HeroSection({ onNavigation }: HeroSectionProps) {
  return (
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
          onClick={() => onNavigation('stickers')}
        >
          <QrCode className="w-5 h-5 mr-2" />
          Generate My Sticker
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="text-lg px-8 py-3"
          onClick={() => onNavigation('dashboard')}
        >
          <Car className="w-5 h-5 mr-2" />
          Driver Dashboard
        </Button>
      </div>
    </div>
  )
}
