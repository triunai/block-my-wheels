import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { useAuth } from '../../contexts/AuthContext'
import { logger } from '../../lib/utils'

interface DiagnosticResult {
  test: string
  status: 'success' | 'error' | 'warning'
  message: string
  data?: unknown
}

export const DatabaseDiagnostics: React.FC = () => {
  const { user } = useAuth()
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [running, setRunning] = useState(false)

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result])
  }

  // Test 1: Check authentication context
  const checkAuthContext = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return addResult({
          test: 'Authentication Context',
          status: 'warning',
          message: 'No active session - running in demo mode',
          data: { demoMode: true }
        })
      }

      addResult({
        test: 'Authentication Context',
        status: 'success',
        message: 'Valid session found',
        data: {
          userId: session.user.id,
          email: session.user.email,
          role: session.user.role,
        }
      })
    } catch (error) {
      addResult({
        test: 'Authentication Context',
        status: 'error',
        message: `Error: ${error}`
      })
    }
  }

  // Test 2: Check profile table count
  const checkProfileCount = async () => {
    try {
      const { count, error } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
      
      if (error) throw error

      addResult({
        test: 'Profile Table Count',
        status: 'success',
        message: `Total profiles: ${count}`,
        data: { count }
      })
    } catch (error) {
      addResult({
        test: 'Profile Table Count',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        data: error
      })
    }
  }

  // Test 3: Check UUID matching between auth.users and user_profiles
  const checkUuidMatching = async () => {
    try {
      if (!user) {
        return addResult({
          test: 'UUID Matching',
          status: 'warning',
          message: 'Running in demo mode - no authenticated user',
          data: { demoMode: true }
        })
      }

      // Try to fetch profile for current user
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (!profile) {
        addResult({
          test: 'UUID Matching',
          status: 'warning',
          message: 'No profile found for current user',
          data: { userId: user.id }
        })
      } else {
        addResult({
          test: 'UUID Matching',
          status: 'success',
          message: 'Profile found and UUIDs match',
          data: { 
            authUserId: user.id,
            profileId: profile.id,
            match: user.id === profile.id
          }
        })
      }
    } catch (error) {
      addResult({
        test: 'UUID Matching',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        data: error
      })
    }
  }

  // Test 4: Try to create a test profile
  const testProfileCreation = async () => {
    try {
      if (!user) {
        return addResult({
          test: 'Profile Creation Test',
          status: 'warning',
          message: 'Running in demo mode - profile creation skipped',
          data: { demoMode: true }
        })
      }

      // First check if profile already exists
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (existing) {
        return addResult({
          test: 'Profile Creation Test',
          status: 'warning',
          message: 'Profile already exists for user'
        })
      }

      // Try to create profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          user_type: 'driver',
          phone: null,
          total_incidents: 0
        })
        .select()
        .single()

      if (error) throw error

      addResult({
        test: 'Profile Creation Test',
        status: 'success',
        message: 'Profile created successfully',
        data
      })
    } catch (error) {
      addResult({
        test: 'Profile Creation Test',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        data: error
      })
    }
  }

  // Test 5: Check RLS policies status
  const checkRlsPolicies = async () => {
    try {
      // This is a simplified check - in production you'd query pg_policies
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1)

      if (!error) {
        addResult({
          test: 'RLS Policy Check',
          status: 'warning',
          message: 'Basic SELECT allowed - RLS might be permissive or disabled',
          data: { canSelect: true }
        })
      } else {
        addResult({
          test: 'RLS Policy Check',
          status: 'error',
          message: 'SELECT blocked - RLS might be too restrictive',
          data: error
        })
      }
    } catch (error) {
      addResult({
        test: 'RLS Policy Check',
        status: 'error',
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        data: error
      })
    }
  }

  // Test 6: Direct database connection test
  const testDirectConnection = async () => {
    try {
      const startTime = Date.now()
      
      // Simple health check query
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true })
      
      const responseTime = Date.now() - startTime

      if (error) throw error

      addResult({
        test: 'Direct Database Connection',
        status: 'success',
        message: `Connected successfully (${responseTime}ms)`,
        data: { responseTime }
      })
    } catch (error) {
      addResult({
        test: 'Direct Database Connection',
        status: 'error',
        message: `Connection failed: ${error instanceof Error ? error.message : String(error)}`,
        data: error
      })
    }
  }

  // Run all diagnostics
  const runAllDiagnostics = async () => {
    setRunning(true)
    setResults([])

    try {
      await checkAuthContext()
      await testDirectConnection()
      await checkProfileCount()
      await checkUuidMatching()
      await checkRlsPolicies()
      await testProfileCreation()
    } catch (error) {
      logger.error('Diagnostic suite error:', error)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Database & RLS Diagnostics
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {user ? `Logged in as: ${user.email}` : 'Running in Demo Mode (No Auth)'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={runAllDiagnostics} 
              disabled={running}
              className="w-full"
            >
              {running ? 'Running Diagnostics...' : 'Run All Diagnostics'}
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="text-lg font-semibold">Results:</h3>
              {results.map((result, index) => (
                <Alert key={index} className={
                  result.status === 'error' ? 'border-red-500' :
                  result.status === 'warning' ? 'border-yellow-500' :
                  'border-green-500'
                }>
                  <AlertDescription>
                    <div className="flex items-start gap-2">
                      <span className={
                        result.status === 'error' ? 'text-red-500' :
                        result.status === 'warning' ? 'text-yellow-500' :
                        'text-green-500'
                      }>
                        {result.status === 'error' ? '❌' :
                         result.status === 'warning' ? '⚠️' :
                         '✅'}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold">{result.test}</p>
                        <p className="text-sm mt-1">{result.message}</p>
                        {result.data && (
                          <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Quick Info:</h4>
            <ul className="text-sm space-y-1">
              <li>• User ID: {user?.id || 'Demo Mode - No User'}</li>
              <li>• Email: {user?.email || 'Demo Mode'}</li>
              <li>• Supabase URL: {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}</li>
              <li>• Mode: {user ? 'Authenticated' : 'Demo (No Auth Required)'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 