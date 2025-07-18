import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { QrCode, LogIn, LogOut, User, Settings, Home, Car } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Avatar, AvatarFallback } from './ui/avatar'

export function Header() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    // Redirect to home page after sign out
    navigate('/', { replace: true })
  }

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-white/20 dark:border-orange-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <QrCode className="w-8 h-8 text-orange-500 dark:text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Block My Wheels</h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30">
              Beta
            </Badge>
            
            {/* Main Navigation Links */}
            {user && (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400">
                    <Home className="w-4 h-4 mr-1" />
                    Home
                  </Button>
                </Link>
                <Link to="/stickers">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400">
                    <QrCode className="w-4 h-4 mr-1" />
                    Stickers
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400">
                    <Car className="w-4 h-4 mr-1" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            )}
            
            {user ? (
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-orange-500 text-white">
                          {getUserInitials(user.email || '')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {profile?.user_type || 'driver'} account
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    
                    {/* Mobile Navigation Links */}
                    <div className="md:hidden">
                      <DropdownMenuItem asChild>
                        <Link to="/" className="flex items-center">
                          <Home className="mr-2 h-4 w-4" />
                          Home
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/stickers" className="flex items-center">
                          <QrCode className="mr-2 h-4 w-4" />
                          Stickers
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="flex items-center">
                          <Car className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </div>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {profile?.user_type === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400">
                    <LogIn className="w-4 h-4 mr-1" />
                    Sign in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
            
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}
