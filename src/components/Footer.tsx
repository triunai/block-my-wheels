import React from 'react'
import { Button } from './ui/button'
import { QrCode, Users } from 'lucide-react'

interface FooterProps {
  onNavigation: (page: string) => void
}

export function Footer({ onNavigation }: FooterProps) {
  return (
    <div className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <QrCode className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-gray-700">Block My Wheels</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
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
