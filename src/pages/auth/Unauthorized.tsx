import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Shield, ArrowLeft, Home } from 'lucide-react'
import { AnimatedElement } from '../../components/animations'
import { useAuth } from '../../contexts/AuthContext'

export const Unauthorized: React.FC = () => {
  const { profile } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-black dark:via-gray-900 dark:to-orange-950 flex items-center justify-center p-4">
      <AnimatedElement preset="fadeIn" duration={0.6}>
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-black/50 backdrop-blur-sm text-center">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-16 h-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Access Denied
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-gray-600 dark:text-gray-300">
                This page requires {profile?.user_type === 'driver' ? 'admin' : 'driver'} access.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your account type: <span className="font-semibold capitalize">{profile?.user_type}</span>
              </p>
            </div>

            <div className="space-y-3">
              <Link to="/" className="block">
                <Button 
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </Button>
              </Link>

              <Link to={profile?.user_type === 'driver' ? '/dashboard' : '/admin'} className="block">
                <Button 
                  variant="outline"
                  className="w-full h-12 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-black/30 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go to {profile?.user_type === 'driver' ? 'Driver' : 'Admin'} Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </AnimatedElement>
    </div>
  )
} 