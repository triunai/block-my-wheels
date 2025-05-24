
'use client'

import { useSearchParams } from 'react-router-dom'
import { ScanPage } from './ScanPage'
import { DriverDashboard } from './DriverDashboard'
import { StickerGenerator } from './StickerGenerator'
import { AdminDashboard } from './AdminDashboard'
import { LandingPage } from '../components/LandingPage'

export default function Index() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  // Simple routing based on URL parameters
  const page = searchParams.get('page')
  
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
