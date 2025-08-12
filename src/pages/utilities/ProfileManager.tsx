import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Header } from '../../components/Header'
import { FadeawayCars } from '../../components/animations/FadeawayCars'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from '../../hooks/use-toast'

interface UserProfile {
  id: string
  user_type: string
  phone: string | null
  wa_id: string | null
  total_incidents: number
  avg_response_time_minutes: number | null
  created_at: string
  updated_at: string
}

export function ProfileManager() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [phone, setPhone] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        toast({
          title: "Error",
          description: "Failed to fetch profile",
          variant: "destructive",
        })
      } else if (data) {
        setProfile(data)
        setPhone(data.phone || '')
      } else {
        // No profile found
        setProfile(null)
        setShowCreateForm(true)
      }
    } catch (err) {
      console.error('Profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async () => {
    if (!user?.id || !phone.trim()) {
      toast({
        title: "Error",
        description: "Phone number is required",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          user_type: 'driver',
          phone: phone.trim(),
          total_incidents: 0
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        toast({
          title: "Error",
          description: `Failed to create profile: ${error.message}`,
          variant: "destructive",
        })
      } else {
        setProfile(data)
        setShowCreateForm(false)
        toast({
          title: "Success! 🎉",
          description: "Profile created successfully",
        })
      }
    } catch (err) {
      console.error('Profile creation error:', err)
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateProfile = async () => {
    if (!user?.id || !phone.trim()) {
      toast({
        title: "Error",
        description: "Phone number is required",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          phone: phone.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        toast({
          title: "Error",
          description: `Failed to update profile: ${error.message}`,
          variant: "destructive",
        })
      } else {
        setProfile(data)
        toast({
          title: "Success! 🎉",
          description: "Profile updated successfully",
        })
      }
    } catch (err) {
      console.error('Profile update error:', err)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-black dark:via-gray-900 dark:to-orange-950 relative overflow-hidden">
        <div className="relative z-50">
          <Header />
        </div>
        
        {/* Animated Car Background */}
        <FadeawayCars 
          carCount={8}
          speed="medium"
          density="light"
          className="opacity-30 dark:opacity-20"
        />
        
        <div className="max-w-2xl mx-auto p-6 relative z-10">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-white/20 dark:border-gray-700/50 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center text-gray-900 dark:text-gray-100">Loading profile...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-black dark:via-gray-900 dark:to-orange-950 relative overflow-hidden">
      <div className="relative z-50">
        <Header />
      </div>
      
      {/* Animated Car Background */}
      <FadeawayCars 
        carCount={8}
        speed="medium"
        density="light"
        className="opacity-30 dark:opacity-20"
      />
      
      <div className="max-w-2xl mx-auto p-6 relative z-10">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Profile Management</h1>
        </div>
        
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-white/20 dark:border-gray-700/50 shadow-lg">
          <CardContent className="space-y-6 pt-6">
          {user && (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <strong className="text-gray-800 dark:text-gray-200">Current Email:</strong> {user.email}
            </div>
          )}

          {!profile && !showCreateForm ? (
            <Alert>
              <AlertDescription>
                No profile found. You need to create a profile to use sticker features.
                <Button 
                  onClick={() => setShowCreateForm(true)} 
                  className="ml-4"
                  size="sm"
                >
                  Create Profile
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}

          {(showCreateForm || profile) && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+60123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This will be used for WhatsApp notifications
                </div>
              </div>

              <Button
                onClick={profile ? updateProfile : createProfile}
                disabled={saving || !phone.trim()}
                className="w-full"
              >
                {saving ? 'Saving...' : (profile ? 'Update Profile' : 'Create Profile')}
              </Button>
            </div>
          )}

          {profile && (
            <div className="space-y-4 border-t border-gray-200 dark:border-gray-600 pt-4">
              <div className="text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/30 p-3 rounded border border-blue-200 dark:border-blue-700">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Current Profile:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-gray-700 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-gray-100">User Type:</strong>
                    <Badge className="ml-2 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-600">{profile.user_type}</Badge>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-gray-100">Phone:</strong> {profile.phone || 'Not set'}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-gray-100">WhatsApp ID:</strong> {profile.wa_id || 'Not set'}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-gray-100">Total Incidents:</strong> {profile.total_incidents}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-gray-100">Created:</strong> {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-gray-100">Updated:</strong> {new Date(profile.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {profile.phone && !profile.phone.startsWith('temp-') && (
                <Alert className="border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    ✅ Profile is complete! You can now create stickers.
                  </AlertDescription>
                </Alert>
              )}

              {(!profile.phone || profile.phone.startsWith('temp-')) && (
                <Alert className="border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    ❌ Profile incomplete: Please add a valid phone number to create stickers.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
  )
} 