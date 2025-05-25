import React from 'react'
import { Button } from './ui/button'
import { QrCode, Users } from 'lucide-react'

interface FooterProps {
  onNavigation: (page: string) => void
}

export function Footer({ onNavigation }: FooterProps) {
  return (
    <div className="bg-gray-50/80 dark:bg-black/40 border-t border-gray-200 dark:border-orange-500/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <QrCode className="w-6 h-6 text-blue-600 dark:text-orange-500" />
            <span className="font-semibold text-gray-700 dark:text-white">Block My Wheels</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="dark:text-gray-300 dark:hover:text-orange-500 dark:hover:bg-orange-500/10"
            onClick={() => onNavigation('admin')}
          >
            <Users className="w-4 h-4 mr-1" />
            Admin
          </Button>
        </div>
      </div>
    </div>
  )
}
