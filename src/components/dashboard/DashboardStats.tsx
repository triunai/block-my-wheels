import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Bell, Car, Clock } from 'lucide-react'
import { Incident } from '../../lib/supabaseClient'

interface DashboardStatsProps {
  incidents: Incident[] | undefined
  activeStickers?: number
}

export function DashboardStats({ incidents, activeStickers = 1 }: DashboardStatsProps) {
  const openIncidents = incidents?.length || 0
  const totalRagePoints = incidents?.reduce((acc, inc) => acc + (inc.rage_level || inc.rage || 0), 0) || 0

  const stats = [
    {
      icon: Bell,
      value: openIncidents,
      label: 'Open Incidents',
      color: 'text-blue-600',
    },
    {
      icon: Car,
      value: activeStickers,
      label: 'Active Stickers',
      color: 'text-green-600',
    },
    {
      icon: Clock,
      value: totalRagePoints,
      label: 'Total Rage Points',
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4 text-center">
            <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}