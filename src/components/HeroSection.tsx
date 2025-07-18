import React from 'react'
import { Button } from './ui/button'
import { QrCode, Car } from 'lucide-react'
import { FadeawayCars } from './animations'
import { HeroSectionProps } from '../interfaces/components'

export function HeroSection({ onNavigation }: HeroSectionProps) {
  return (
    <div className="relative text-center mb-16">
      {/* Advanced Multi-Layer Particle System */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Background Layer - Slow moving large particles */}
        <div className="particles-bg">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`bg-${i}`}
              className="particle-bg absolute rounded-full opacity-20"
              style={{
                width: `${4 + Math.random() * 8}px`,
                height: `${4 + Math.random() * 8}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `linear-gradient(45deg, #f97316, #ea580c)`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Mid Layer - Medium particles with physics */}
        <div className="particles-mid">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={`mid-${i}`}
              className="particle-mid absolute rounded-full"
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: i % 2 === 0 
                  ? `radial-gradient(circle, #f97316, transparent)` 
                  : `radial-gradient(circle, #6b7280, transparent)`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${8 + Math.random() * 6}s`,
              }}
            />
          ))}
        </div>

        {/* Foreground Layer - Fast small particles */}
        <div className="particles-fg">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`fg-${i}`}
              className="particle-fg absolute rounded-full"
              style={{
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `rgba(249, 115, 22, ${0.3 + Math.random() * 0.4})`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Special Effect - Orbital particles */}
        <div className="particles-orbital">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`orbital-${i}`}
              className="particle-orbital absolute w-0.5 h-0.5 rounded-full bg-orange-400/20"
              style={{
                left: '50%',
                top: '50%',
                animationDelay: `${i * 0.5}s`,
                animationDuration: '12s',
              }}
            />
          ))}
        </div>

        {/* Animated Fadeaway Cars */}
        <FadeawayCars 
          carCount={12}
          speed="medium"
          density="medium"
          className="opacity-70 dark:opacity-80"
        />
      </div>

      {/* Glassmorphism container with better borders */}
      <div className="hero-container relative backdrop-blur-md bg-white/20 dark:bg-black/30 border-2 border-gray-300/60 dark:border-orange-400/60 rounded-3xl p-12 mx-4 shadow-2xl dark:shadow-orange-500/20">
        <h2 className="hero-title text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Never get trapped by a <br />
          <span className="gradient-text-animated">parked car</span> again
        </h2>
        <p className="hero-subtitle text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Smart QR stickers that instantly notify drivers via WhatsApp when their vehicle is blocking someone. 
          AI-powered, hassle-free, and gets results in minutes.
        </p>
        
        <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="button-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white transform hover:scale-105"
            onClick={() => onNavigation('stickers')}
          >
            <QrCode className="w-5 h-5 mr-2" />
            Generate My Sticker
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="button-secondary text-lg px-8 py-3 backdrop-blur-sm bg-white/30 dark:bg-black/30 border-2 border-gray-400/60 dark:border-orange-400/60 hover:bg-gray-50/50 dark:hover:bg-black/40 shadow-lg hover:shadow-xl transition-all duration-300 text-gray-900 dark:text-white hover:border-orange-500 dark:hover:border-orange-300 transform hover:scale-105"
            onClick={() => onNavigation('dashboard')}
          >
            <Car className="w-5 h-5 mr-2" />
            Driver Dashboard
          </Button>
        </div>
      </div>

      <style>{`
        /* Advanced Particle Physics Animations */
        @keyframes floatBg {
          0%, 100% { 
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 0.1;
          }
          25% { 
            transform: translate(20px, -30px) rotate(90deg) scale(1.2);
            opacity: 0.3;
          }
          50% { 
            transform: translate(-15px, -60px) rotate(180deg) scale(0.8);
            opacity: 0.2;
          }
          75% { 
            transform: translate(-30px, -20px) rotate(270deg) scale(1.1);
            opacity: 0.25;
          }
        }

        @keyframes floatMid {
          0%, 100% { 
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 0.4;
          }
          33% { 
            transform: translate(-25px, -40px) rotate(120deg) scale(1.3);
            opacity: 0.7;
          }
          66% { 
            transform: translate(30px, -25px) rotate(240deg) scale(0.7);
            opacity: 0.3;
          }
        }

        @keyframes floatFg {
          0%, 100% { 
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 0.6;
          }
          50% { 
            transform: translate(${Math.random() > 0.5 ? '-' : ''}${20 + Math.random() * 40}px, -${30 + Math.random() * 50}px) rotate(180deg) scale(${0.5 + Math.random() * 1});
            opacity: ${0.2 + Math.random() * 0.6};
          }
        }

        @keyframes orbital {
          0% { 
            transform: translate(-50%, -50%) rotate(0deg) translateX(150px) rotate(0deg);
            opacity: 0;
          }
          10%, 90% {
            opacity: 0.6;
          }
          100% { 
            transform: translate(-50%, -50%) rotate(360deg) translateX(150px) rotate(-360deg);
            opacity: 0;
          }
        }



        @keyframes heroGlow {
          0%, 100% { 
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
          }
          50% { 
            box-shadow: 0 25px 50px -12px rgba(249, 115, 22, 0.15);
          }
        }
        
        /* Particle Assignments */
        .particle-bg {
          animation: floatBg var(--duration) ease-in-out infinite;
        }
        
        .particle-mid {
          animation: floatMid var(--duration) ease-in-out infinite;
        }
        
        .particle-fg {
          animation: floatFg var(--duration) ease-in-out infinite;
        }

        .particle-orbital {
          animation: orbital var(--duration) linear infinite;
        }


        
        .hero-container {
          animation: heroGlow 4s ease-in-out infinite;
        }
        
        .hero-container:hover {
          transform: translateY(-2px);
          transition: transform 0.3s ease;
        }
        
        /* Animated Gradient Text Effect for "parked car" */
        .gradient-text-animated {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 20%, #dc2626 40%, #ea580c 60%, #f97316 80%, #fb923c 100%);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 4s ease-in-out infinite;
          position: relative;
          display: inline-block;
        }

        @keyframes gradientShift {
          0% { 
            background-position: 0% 50%;
            transform: scale(1);
          }
          25% {
            background-position: 50% 0%;
            transform: scale(1.02);
          }
          50% { 
            background-position: 100% 50%;
            transform: scale(1);
          }
          75% {
            background-position: 50% 100%;
            transform: scale(1.01);
          }
          100% { 
            background-position: 0% 50%;
            transform: scale(1);
          }
        }
        
        .button-primary:hover {
          box-shadow: 0 20px 40px rgba(249, 115, 22, 0.3);
        }
        
        .button-secondary:hover {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .hero-buttons {
          animation: fadeInUp 0.8s ease-out 0.3s both;
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
        
        .hero-subtitle {
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }
        
        .hero-title {
          animation: fadeInUp 0.8s ease-out 0.1s both;
        }

        /* Dark mode adjustments */
        .dark .gradient-text-animated {
          background: linear-gradient(135deg, #fb923c 0%, #f97316 20%, #ea580c 40%, #f97316 60%, #fb923c 80%, #fdba74 100%);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  )
}
