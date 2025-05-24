
import { Button } from '@/components/ui/button'
import { QrCode, Car } from 'lucide-react'

interface HeroSectionProps {
  onNavigation: (page: string) => void
}

export function HeroSection({ onNavigation }: HeroSectionProps) {
  return (
    <div className="relative text-center mb-16">
      {/* Particle background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="particle absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Glassmorphism container */}
      <div className="relative backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-12 mx-4 shadow-2xl">
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
            className="text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => onNavigation('stickers')}
          >
            <QrCode className="w-5 h-5 mr-2" />
            Generate My Sticker
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg px-8 py-3 backdrop-blur-sm bg-white/20 border-white/30 hover:bg-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => onNavigation('dashboard')}
          >
            <Car className="w-5 h-5 mr-2" />
            Driver Dashboard
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-30px) rotate(120deg); }
          66% { transform: translateY(-20px) rotate(240deg); }
        }
        .particle {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
