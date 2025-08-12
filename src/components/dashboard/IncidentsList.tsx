import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { AlertCircle, MapPin, Smartphone, ChevronDown, ChevronUp } from 'lucide-react'

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
  const [showAll, setShowAll] = useState(false)
  const INITIAL_DISPLAY_COUNT = 5
  
  if (error) {
    return (
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-white/20 dark:border-gray-700/50">
        <CardContent className="p-6">
          <Alert variant="destructive" className="border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              Failed to load incidents: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const displayedIncidents = showAll 
    ? incidents 
    : incidents?.slice(0, INITIAL_DISPLAY_COUNT)
  
  const hasMoreIncidents = incidents && incidents.length > INITIAL_DISPLAY_COUNT
  const hiddenCount = incidents ? incidents.length - INITIAL_DISPLAY_COUNT : 0

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-white/20 dark:border-gray-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900 dark:text-white">Active Incidents</CardTitle>
          {incidents && incidents.length > 0 && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-600">
              {incidents.length} total
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Loading incidents...</p>
          </div>
        ) : !incidents || incidents.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No active incidents - drive happy! 🚗
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {displayedIncidents?.map((incident) => (
                <div key={incident.id} className="p-4 bg-gray-50/80 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getRageEmoji(incident.rage_level || incident.rage || 0)}</span>
                        <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600">
                          Rage Level: {incident.rage_level || incident.rage || 0}/10
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">
                        {incident.sticker?.plate || 'Unknown vehicle'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatTimeAgo(incident.created_at)}</span>
                        <span>|</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {incident.scanner_ip || 'Unknown location'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                        <Smartphone className="w-4 h-4" />
                        <span>Waiting for response</span>
                      </div>
                      
                      <Button
                        onClick={() => onSelectIncident(incident)}
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white"
                      >
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {hasMoreIncidents && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-2 mx-auto bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show {hiddenCount} More Incident{hiddenCount !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}