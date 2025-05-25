import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from './Header'
import { HeroSection } from './HeroSection'
import { HowItWorks } from './HowItWorks'
import { Features } from './Features'
import { QuickActions } from './QuickActions'
import { Footer } from './Footer'
import { isTemplateMode } from '../lib/supabaseClient'

export function LandingPage() {
  const navigate = useNavigate()

  const handleNavigation = (page: string) => {
    navigate(`/${page}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Template Mode Banner */}
      {isTemplateMode && (
        <div className="bg-yellow-500 text-yellow-900 px-4 py-2 text-center font-medium relative z-50">
          🚧 Template Mode - This is a demo version. Backend functions are mocked.
        </div>
      )}
      
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        <HeroSection onNavigation={handleNavigation} />
        <HowItWorks />
        <Features />
        <QuickActions onNavigation={handleNavigation} />
      </div>

      <Footer onNavigation={handleNavigation} />
    </div>
  )
}
