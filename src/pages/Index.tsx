
'use client'

import { useSearchParams, useParams, useLocation } from 'react-router-dom'
import { ScanPage } from './ScanPage'
import { DriverDashboard } from './DriverDashboard'
import { StickerGenerator } from './StickerGenerator'
import { AdminDashboard } from './AdminDashboard'
import { LandingPage } from '../components/LandingPage'

export default function Index() {
  const [searchParams] = useSearchParams()
  const { token } = useParams()
  const location = useLocation()
  
  // Get token from URL params or search params
  const scanToken = token || searchParams.get('token')
  
  // If we have a token, show the scan page
  if (scanToken) {
    return <ScanPage token={scanToken} />
  }

  // Route based on pathname
  switch (location.pathname) {
    case '/stickers':
      return <StickerGenerator />
    case '/dashboard':
      return <DriverDashboard />
    case '/admin':
      return <AdminDashboard />
    default:
      // Also check for page parameter for backward compatibility
      const page = searchParams.get('page')
      switch (page) {
        case 'stickers':
          return <StickerGenerator />
        case 'dashboard':
          return <DriverDashboard />
        case 'admin':
          return <AdminDashboard />
        default:
          return <LandingPage />
      }
  }
}
