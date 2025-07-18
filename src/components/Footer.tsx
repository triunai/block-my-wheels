import React from 'react'
import { Button } from './ui/button'
import { QrCode, Users } from 'lucide-react'
import { FooterProps } from '../interfaces/components'

export function Footer({ onNavigation }: FooterProps) {
  return (
    <div className="bg-gray-50/80 dark:bg-black/40 border-t border-orange-200/50 dark:border-orange-500/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <QrCode className="w-6 h-6 text-orange-500 dark:text-orange-500" />
            <span className="font-semibold text-gray-700 dark:text-white">Block My Wheels</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-600 hover:text-orange-500 hover:bg-orange-50 dark:text-gray-300 dark:hover:text-orange-500 dark:hover:bg-orange-500/10"
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
