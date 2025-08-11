'use client'

import React, { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useDriverIncidents, useAckIncident } from '../../lib/hooks/useIncidents'
import { toast } from '../../hooks/use-toast'
import { User } from 'lucide-react'
import { ThemeToggle } from '../../components/ThemeToggle'
import { Header } from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import type { Incident } from '../../lib/supabaseClient'
import { supabase } from '../../lib/supabaseClient'

// Dashboard components
import { ProfileSetupCard } from '../../components/dashboard/ProfileSetupCard'
import { DashboardStats } from '../../components/dashboard/DashboardStats'
import { IncidentsList } from '../../components/dashboard/IncidentsList'
import { AcknowledgeDialog } from '../../components/dashboard/AcknowledgeDialog'

// Utils
import { formatTimeAgo } from '../../lib/utils/timeUtils'
import { getRageEmoji } from '../../lib/utils/rageUtils'

export function DriverDashboard() {
  const { user, profile, refreshProfile } = useAuth()
  const { data: incidents, isLoading } = useDriverIncidents(user?.id || '')
  const ackMutation = useAckIncident()
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [etaMinutes, setEtaMinutes] = useState('')
  const [isAckDialogOpen, setIsAckDialogOpen] = useState(false)
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)

  // Show loading state if user hasn't loaded yet
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-black dark:via-gray-900 dark:to-orange-950 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  const handleCreateProfile = async () => {
    setIsCreatingProfile(true)
    try {
      await refreshProfile()
      toast({
        title: "Profile Created! 🎉",
        description: "Your profile has been set up successfully.",
      })
    } catch (error) {
      toast({
        title: "Profile Creation Failed",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingProfile(false)
    }
  }

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



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-black dark:via-gray-900 dark:to-orange-950 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">Loading your incidents...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-black dark:via-gray-900 dark:to-orange-950">
      <Header />
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Driver Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Welcome back, {user.email}
              </p>
              {!profile && (
                <div className="mt-2 flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                  <User className="w-4 h-4" />
                  <span>Profile setup in progress - some features may be limited</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30">
                {profile?.user_type || 'Driver'}
              </Badge>
              <ThemeToggle />
            </div>
          </div>

          {/* Profile Creation Section */}
          {!profile && (
            <ProfileSetupCard
              onCreateProfile={handleCreateProfile}
              isCreatingProfile={isCreatingProfile}
            />
          )}

          {/* Stats */}
          <DashboardStats incidents={incidents} activeStickers={1} />

          {/* Incidents List */}
          <IncidentsList
            incidents={incidents}
            isLoading={isLoading}
            error={null}
            formatTimeAgo={formatTimeAgo}
            getRageEmoji={getRageEmoji}
            onSelectIncident={setSelectedIncident}
          />

          {/* Acknowledge Dialog */}
          <AcknowledgeDialog
            isOpen={isAckDialogOpen}
            onOpenChange={setIsAckDialogOpen}
            etaMinutes={etaMinutes}
            onEtaChange={setEtaMinutes}
            onAcknowledge={handleAcknowledge}
            isPending={ackMutation.isPending}
          />
        </div>
      </div>
    </div>
  )
}
