import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { useToast } from '../../hooks/use-toast'
import { supabase } from '../../lib/supabaseClient'

interface ProfileSetupCardProps {
  onCreateProfile: () => void
  isCreatingProfile: boolean
}

export function ProfileSetupCard({ onCreateProfile, isCreatingProfile }: ProfileSetupCardProps) {
  const { toast } = useToast()

  const handleTestDB = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .single()
    
    if (error) {
      toast({
        title: "Database Error",
        description: `${error.message} (${error.code})`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Database Connected!",
        description: "Connection successful",
      })
    }
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
              Profile Setup Required
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Complete your profile setup to access all features, including incident management and sticker generation.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onCreateProfile}
              disabled={isCreatingProfile}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isCreatingProfile ? 'Creating...' : 'Create Profile'}
            </Button>
            <Button
              onClick={handleTestDB}
              variant="outline"
            >
              Test DB
            </Button>
            <Link to="/diagnostics">
              <Button variant="outline" className="ml-2">
                Run Diagnostics
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}