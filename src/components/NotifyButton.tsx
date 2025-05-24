
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { useNotifyDriver } from '@/lib/hooks/useIncidents'
import { Bell } from 'lucide-react'

interface NotifyButtonProps {
  token: string
  disabled?: boolean
  className?: string
}

export function NotifyButton({ token, disabled, className }: NotifyButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const notifyMutation = useNotifyDriver()

  const handleNotify = async () => {
    setIsLoading(true)
    try {
      await notifyMutation.mutateAsync({ token })
      toast({
        title: "Driver Notified!",
        description: "The driver has been notified via WhatsApp and will be with you shortly.",
      })
    } catch (error) {
      console.error('Notification error:', error)
      toast({
        title: "Notification Failed",
        description: "Unable to notify the driver. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleNotify}
      disabled={disabled || isLoading}
      size="lg"
      className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 ${className}`}
    >
      <Bell className="w-5 h-5 mr-2" />
      {isLoading ? 'Notifying...' : 'Notify Driver'}
    </Button>
  )
}
