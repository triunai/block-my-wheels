import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { Alert, AlertDescription } from '../../components/ui/alert'
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
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading profile...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>User Profile Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {user && (
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
              <strong>Current User:</strong>
              <div>ID: <code>{user.id}</code></div>
              <div>Email: <code>{user.email}</code></div>
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
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
                <div className="text-xs text-gray-500 mt-1">
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
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Current Profile:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>User Type:</strong>
                  <Badge className="ml-2">{profile.user_type}</Badge>
                </div>
                <div>
                  <strong>Phone:</strong> {profile.phone || 'Not set'}
                </div>
                <div>
                  <strong>WhatsApp ID:</strong> {profile.wa_id || 'Not set'}
                </div>
                <div>
                  <strong>Total Incidents:</strong> {profile.total_incidents}
                </div>
                <div>
                  <strong>Created:</strong> {new Date(profile.created_at).toLocaleDateString()}
                </div>
                <div>
                  <strong>Updated:</strong> {new Date(profile.updated_at).toLocaleDateString()}
                </div>
              </div>

              {profile.phone && !profile.phone.startsWith('temp-') && (
                <Alert>
                  <AlertDescription className="text-green-700">
                    ✅ Profile is complete! You can now create stickers.
                  </AlertDescription>
                </Alert>
              )}

              {(!profile.phone || profile.phone.startsWith('temp-')) && (
                <Alert>
                  <AlertDescription className="text-red-700">
                    ❌ Profile incomplete: Please add a valid phone number to create stickers.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 