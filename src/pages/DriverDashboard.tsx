
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useDriverIncidents, useAckIncident } from '@/lib/hooks/useIncidents'
import { toast } from '@/hooks/use-toast'
import { Clock, Car, Bell } from 'lucide-react'
import type { Incident } from '@/lib/supabaseClient'

// Mock driver ID - in real app this would come from auth
const MOCK_DRIVER_ID = 'driver-123'

export function DriverDashboard() {
  const { data: incidents, isLoading } = useDriverIncidents(MOCK_DRIVER_ID)
  const ackMutation = useAckIncident()
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [etaMinutes, setEtaMinutes] = useState('')
  const [isAckDialogOpen, setIsAckDialogOpen] = useState(false)

  const handleAcknowledge = async () => {
    if (!selectedIncident) return

    try {
      await ackMutation.mutateAsync({
        incidentId: selectedIncident.id,
        etaMinutes: etaMinutes ? parseInt(etaMinutes) : undefined,
      })
      
      toast({
        title: "Incident Acknowledged",
        description: "The person has been notified that you're on your way!",
      })
      
      setIsAckDialogOpen(false)
      setEtaMinutes('')
      setSelectedIncident(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to acknowledge incident. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  const getRageDisplay = (rage: number) => {
    const emojis = ['😐', '😠', '😡', '🤬', '🔥']
    return emojis[Math.min(rage, 4)] || '😐'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">Loading your incidents...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Driver Dashboard</h1>
          <p className="text-gray-600">Manage your vehicle blocking notifications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{incidents?.length || 0}</div>
              <div className="text-sm text-gray-600">Open Incidents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Car className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">1</div>
              <div className="text-sm text-gray-600">Active Stickers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">
                {incidents?.reduce((acc, inc) => acc + inc.rage, 0) || 0}
              </div>
              <div className="text-sm text-gray-600">Total Rage Points</div>
            </CardContent>
          </Card>
        </div>

        {/* Incidents List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            {!incidents || incidents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active incidents. Your vehicle is clear! 🎉</p>
              </div>
            ) : (
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="destructive">Active</Badge>
                          <span className="text-sm text-gray-500">
                            {formatTimeAgo(incident.created_at)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-medium">
                              Vehicle: {incident.sticker?.plate || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-600">
                              Urgency: {getRageDisplay(incident.rage)} ({incident.rage})
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Dialog open={isAckDialogOpen} onOpenChange={setIsAckDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => setSelectedIncident(incident)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Acknowledge
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Acknowledge Incident</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                              Let the person know you're on your way to move your vehicle.
                            </p>
                            
                            <div>
                              <Label htmlFor="eta">Estimated arrival time (minutes)</Label>
                              <Input
                                id="eta"
                                type="number"
                                placeholder="e.g. 5"
                                value={etaMinutes}
                                onChange={(e) => setEtaMinutes(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                onClick={handleAcknowledge}
                                disabled={ackMutation.isPending}
                                className="flex-1"
                              >
                                {ackMutation.isPending ? 'Acknowledging...' : 'Acknowledge'}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setIsAckDialogOpen(false)}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
