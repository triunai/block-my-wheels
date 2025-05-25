import React from 'react'
import { QrCode } from 'lucide-react'
import { Badge } from './ui/badge'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-white/20 dark:border-orange-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode className="w-8 h-8 text-blue-600 dark:text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Block My Wheels</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30">
              Beta
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}
