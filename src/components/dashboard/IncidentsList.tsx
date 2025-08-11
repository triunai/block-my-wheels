import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { AlertCircle, MapPin, Smartphone } from 'lucide-react'
import { DialogTrigger } from '../ui/dialog'
import { Incident } from '../../lib/supabaseClient'

interface IncidentsListProps {
  incidents: Incident[] | undefined
  isLoading: boolean
  error: any
  formatTimeAgo: (date: string) => string
  getRageEmoji: (rage: number) => string
  onSelectIncident: (incident: Incident) => void
}

export function IncidentsList({
  incidents,
  isLoading,
  error,
  formatTimeAgo,
  getRageEmoji,
  onSelectIncident,
}: IncidentsListProps) {
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load incidents: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Incidents</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading incidents...</p>
          </div>
        ) : !incidents || incidents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No active incidents - drive happy! 🚗
          </div>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div key={incident.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getRageEmoji(incident.rage)}</span>
                      <Badge variant="destructive">
                        Rage Level: {incident.rage}/10
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {incident.sticker?.plate || 'Unknown vehicle'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{formatTimeAgo(incident.created_at)}</span>
                      <span>|</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {incident.scanner_ip || 'Unknown location'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Smartphone className="w-4 h-4" />
                      <span>Waiting for response</span>
                    </div>
                    
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => onSelectIncident(incident)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Acknowledge
                      </Button>
                    </DialogTrigger>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}