'use client'

import React, { useState } from 'react'
import { Button } from './ui/button'
import { useNotifyDriver } from '../lib/hooks/useIncidents'
import { toast } from '../hooks/use-toast'
import { logger } from '../lib/utils'
import { RageCounterProps } from '../interfaces/components'

const rageEmojis = ['😠', '😡', '🤬', '🔥', '💀']

export function RageCounter({ token, initialRage = 0, disabled }: RageCounterProps) {
  const [rageLevel, setRageLevel] = useState(initialRage)
  const notifyMutation = useNotifyDriver()

  const handleRageClick = async () => {
    const newRage = rageLevel + 1
    setRageLevel(newRage)
    
    try {
      await notifyMutation.mutateAsync({ token, rage: newRage })
      toast({
        title: `Rage level increased! ${rageEmojis[Math.min(newRage - 1, 4)] || '😠'}`,
        description: "The driver has been notified of your urgency.",
      })
    } catch (error) {
      logger.error('Rage update failed', error)
      toast({
        title: "Update Failed",
        description: "Unable to update urgency level. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getRageDisplay = () => {
    if (rageLevel === 0) return '😐'
    return rageEmojis[Math.min(rageLevel - 1, 4)] || '😠'
  }

  return (
    <div className="text-center">
      <div className="text-sm text-gray-600 mb-2">Urgency Level</div>
      <Button
        variant="outline"
        onClick={handleRageClick}
        disabled={disabled}
        className="text-2xl h-16 w-16 rounded-full hover:scale-110 transition-transform"
      >
        {getRageDisplay()}
      </Button>
      <div className="text-xs text-gray-500 mt-1">
        Tap to increase urgency ({rageLevel})
      </div>
    </div>
  )
}
