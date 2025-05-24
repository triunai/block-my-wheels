
'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import type { Incident } from '@/lib/supabaseClient'

interface AckModalProps {
  incident: Incident | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AckModal({ incident, isOpen, onOpenChange }: AckModalProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    if (!incident?.ack_at || !incident?.eta_minutes) return

    const interval = setInterval(() => {
      const ackTime = new Date(incident.ack_at!).getTime()
      const etaTime = ackTime + (incident.eta_minutes! * 60 * 1000)
      const now = Date.now()
      const diff = etaTime - now

      if (diff <= 0) {
        setTimeLeft('Driver should be here now!')
        return
      }

      const minutes = Math.floor(diff / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }, 1000)

    return () => clearInterval(interval)
  }, [incident])

  if (!incident || incident.status !== 'ack') return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            Driver Acknowledged
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-lg px-4 py-2">
              ✓ Driver is on the way!
            </Badge>
          </div>
          
          {incident.eta_minutes && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 mb-1">Estimated arrival:</div>
              <div className="text-2xl font-bold text-blue-800">{timeLeft}</div>
            </div>
          )}
          
          <div className="text-sm text-gray-600 text-center">
            The driver has been notified and will be there shortly. 
            Please wait by your vehicle.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
