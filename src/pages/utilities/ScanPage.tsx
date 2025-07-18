
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { NotifyButton } from '../../components/NotifyButton'
import { RageCounter } from '../../components/RageCounter'
import { AckModal } from '../../components/AckModal'
import { LocaleSwitcher } from '../../components/LocaleSwitcher'
import { useScanPageData } from '../../lib/hooks/useIncidents'
import { Skeleton } from '../../components/ui/skeleton'
import { ScanPageProps } from '../../interfaces/components'

export function ScanPage({ token }: ScanPageProps) {
  const { data, isLoading, error } = useScanPageData(token)
  const [showAckModal, setShowAckModal] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-black dark:via-gray-900 dark:to-orange-950 p-4">
        <div className="max-w-md mx-auto pt-8 space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-16 w-16 mx-auto rounded-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-black dark:via-gray-900 dark:to-orange-950 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-2xl mb-2">❌</div>
            <h2 className="text-lg font-semibold mb-2">Invalid QR Code</h2>
            <p className="text-gray-600">This QR code is not valid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { sticker, incident } = data!
  const isAcknowledged = incident?.status === 'ack'

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-black dark:via-gray-900 dark:to-orange-950 p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🚗 Driver Alert</h1>
          <LocaleSwitcher />
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {sticker.plate ? `Vehicle ${sticker.plate}` : 'Vehicle Owner'}
            </CardTitle>
            {incident && (
              <Badge 
                variant={isAcknowledged ? "secondary" : "destructive"}
                className={isAcknowledged ? "bg-green-100 text-green-800" : ""}
              >
                {isAcknowledged ? '✓ Driver Acknowledged' : '🚨 Incident Open'}
              </Badge>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6 p-6">
            {isAcknowledged ? (
              <div className="text-center space-y-4">
                <div className="text-green-600 font-semibold">
                  🎉 The driver has been notified and acknowledged!
                </div>
                <button
                  onClick={() => setShowAckModal(true)}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  View Details & ETA
                </button>
              </div>
            ) : (
              <>
                <div className="text-center text-gray-600 mb-4">
                  This vehicle is blocking you? Let the driver know!
                </div>
                
                <NotifyButton token={token} />
                
                <div className="flex justify-center">
                  <RageCounter 
                    token={token} 
                    initialRage={incident?.rage || 0}
                  />
                </div>

                <div className="text-xs text-gray-500 text-center">
                  The driver will receive a notification via WhatsApp
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Powered by AI Driver Alert System
        </div>
      </div>

      <AckModal
        incident={incident}
        isOpen={showAckModal}
        onOpenChange={setShowAckModal}
      />
    </div>
  )
}
