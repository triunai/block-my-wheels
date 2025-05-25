import React from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'

interface QuickActionsProps {
  onNavigation: (page: string) => void
}

export function QuickActions({ onNavigation }: QuickActionsProps) {
  return (
    <Card className="bg-gradient-to-r from-orange-400 to-orange-600 dark:from-black dark:to-orange-600 text-white shadow-2xl border-0 transform hover:scale-105 transition-all duration-300 dark:border-orange-500/30 backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
        <p className="mb-6 opacity-90">Join thousands of drivers already using Block My Wheels</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="secondary" 
            size="lg"
            className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white text-orange-600 hover:bg-orange-50 dark:bg-orange-500 dark:text-white dark:hover:bg-orange-400"
            onClick={() => onNavigation('stickers')}
          >
            Create My Sticker
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="bg-transparent border-white text-white hover:bg-white hover:text-orange-600 dark:hover:text-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 dark:border-orange-300 dark:hover:bg-orange-100"
            onClick={() => window.open('/t/DEMO123456', '_blank')}
          >
            Try Demo Scan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
