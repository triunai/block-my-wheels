
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Users, QrCode, Bell, TrendingUp } from 'lucide-react'

export function AdminDashboard() {
  // Mock admin stats
  const stats = {
    totalDrivers: 1247,
    totalStickers: 1823,
    activeIncidents: 23,
    totalNotifications: 15672,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-black dark:via-gray-900 dark:to-orange-950 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">System overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDrivers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <QrCode className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">QR Stickers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStickers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bell className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Incidents</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeIncidents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalNotifications.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary">New Driver</Badge>
                  <span className="text-sm">John Doe registered</span>
                </div>
                <span className="text-xs text-gray-500">2 minutes ago</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center space-x-3">
                  <Badge variant="destructive">Incident</Badge>
                  <span className="text-sm">High rage incident reported (ABC-123)</span>
                </div>
                <span className="text-xs text-gray-500">5 minutes ago</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center space-x-3">
                  <Badge>Acknowledged</Badge>
                  <span className="text-sm">Driver responded to incident (XYZ-789)</span>
                </div>
                <span className="text-xs text-gray-500">8 minutes ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Development Notice */}
        <Card className="mt-6 border-dashed">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-gray-700 mb-2">🚧 Under Development</h3>
            <p className="text-gray-600">
              Admin features like user management, incident monitoring, and system configuration are coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
