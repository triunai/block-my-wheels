import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { 
  Home, 
  Car, 
  QrCode, 
  ShieldCheck, 
  Settings, 
  Activity,
  LogIn,
  UserPlus,
  Sparkles,
  Gauge
} from 'lucide-react'

export const DemoNavigation: React.FC = () => {
  const sections = [
    {
      title: 'Public Pages',
      items: [
        { path: '/', label: 'Landing Page', icon: Home, description: 'Main landing page' },
        { path: '/login', label: 'Login', icon: LogIn, description: 'User login page' },
        { path: '/signup', label: 'Sign Up', icon: UserPlus, description: 'User registration' },
      ]
    },
    {
      title: 'Main Features',
      items: [
        { path: '/dashboard', label: 'Driver Dashboard', icon: Car, description: 'Main driver interface' },
        { path: '/stickers', label: 'Sticker Generator', icon: QrCode, description: 'Generate QR code stickers' },
        { path: '/admin', label: 'Admin Dashboard', icon: ShieldCheck, description: 'Admin control panel' },
      ]
    },
    {
      title: 'Utilities & Diagnostics',
      items: [
        { path: '/diagnostics', label: 'Database Diagnostics', icon: Activity, description: 'Test database & RLS' },
        { path: '/t/demo-token', label: 'Scan Page Demo', icon: QrCode, description: 'QR code scan simulation' },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-black dark:via-gray-900 dark:to-orange-950 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🚗 Block My Wheels - Demo Navigation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            All features accessible without authentication for demo purposes
          </p>
        </div>

        <div className="grid gap-6">
          {sections.map((section) => (
            <Card key={section.title} className="overflow-hidden">
              <CardHeader className="bg-orange-50 dark:bg-orange-900/20">
                <CardTitle className="text-xl">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link key={item.path} to={item.path}>
                        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer hover:border-orange-400">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <Icon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm mb-1">{item.label}</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Gauge className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold">Quick Actions for Demo</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600">✓</span>
                <span>All routes are now publicly accessible</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600">✓</span>
                <span>Authentication requirements removed for demo</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600">✓</span>
                <span>Database diagnostics work without login</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-600">ℹ️</span>
                <span>Some features may show limited data without auth</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 