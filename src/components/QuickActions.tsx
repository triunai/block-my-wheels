
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface QuickActionsProps {
  onNavigation: (page: string) => void
}

export function QuickActions({ onNavigation }: QuickActionsProps) {
  return (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <CardContent className="p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
        <p className="mb-6 opacity-90">Join thousands of drivers already using AI Driver Alert</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => onNavigation('stickers')}
          >
            Create My Sticker
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
            onClick={() => window.open('/?token=demo', '_blank')}
          >
            Try Demo Scan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
