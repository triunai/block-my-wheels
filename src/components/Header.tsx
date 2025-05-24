
import { QrCode } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function Header() {
  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QrCode className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">AI Driver Alert</h1>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Beta
          </Badge>
        </div>
      </div>
    </div>
  )
}
