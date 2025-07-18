import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Header } from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'

interface TestResult {
  test: string
  status: 'pending' | 'success' | 'error'
  message: string
  duration?: number
}

export function DatabaseDiagnostics() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const { user } = useAuth()

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result])
  }

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])

    const addResultSafe = (result: TestResult) => {
      setResults(prev => [...prev, result])
    }

    // Test 1: Basic connectivity with timeout
    const start1 = Date.now()
    try {
      const connectivityPromise = supabase.from('user_profiles').select('id', { count: 'exact', head: true })
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
      )

      const { error } = await Promise.race([connectivityPromise, timeoutPromise]) as { error: any }
      const duration1 = Date.now() - start1
      
      if (error) {
        addResultSafe({ test: 'Basic Connectivity', status: 'error', message: error.message || 'Connection error', duration: duration1 })
      } else {
        addResultSafe({ test: 'Basic Connectivity', status: 'success', message: 'Connection successful', duration: duration1 })
      }
    } catch (err) {
      const duration1 = Date.now() - start1
      addResultSafe({ test: 'Basic Connectivity', status: 'error', message: (err as Error).message, duration: duration1 })
    }

    // Test 2: Auth check with timeout
    const start2 = Date.now()
    try {
      const authPromise = supabase.auth.getUser()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout after 10 seconds')), 10000)
      )

      const { data: { user: authUser }, error: authError } = await Promise.race([authPromise, timeoutPromise]) as { data: { user: any }, error: any }
      const duration2 = Date.now() - start2
      
      if (authError || !authUser) {
        addResultSafe({ test: 'Auth Check', status: 'error', message: authError?.message || 'No user', duration: duration2 })
      } else {
        addResultSafe({ test: 'Auth Check', status: 'success', message: `User: ${authUser.id}`, duration: duration2 })
      }
    } catch (err) {
      const duration2 = Date.now() - start2
      addResultSafe({ test: 'Auth Check', status: 'error', message: (err as Error).message, duration: duration2 })
    }

    // Test 3: Sticker table read with timeout
    const start3 = Date.now()
    try {
      const readPromise = supabase.from('stickers').select('id').limit(1)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Read timeout after 10 seconds')), 10000)
      )

      const { data, error } = await Promise.race([readPromise, timeoutPromise]) as { data: any, error: any }
      const duration3 = Date.now() - start3
      
      if (error) {
        addResultSafe({ test: 'Sticker Read', status: 'error', message: error.message, duration: duration3 })
      } else {
        addResultSafe({ test: 'Sticker Read', status: 'success', message: `Read ${data?.length || 0} records`, duration: duration3 })
      }
    } catch (err) {
      const duration3 = Date.now() - start3
      addResultSafe({ test: 'Sticker Read', status: 'error', message: (err as Error).message, duration: duration3 })
    }

    // Test 4: User Profile Check (detailed)
    if (user?.id) {
      const start5 = Date.now()
      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        const duration5 = Date.now() - start5
        
        if (error && error.code !== 'PGRST116') {
          addResult({ test: 'User Profile Check', status: 'error', message: error.message, duration: duration5 })
        } else if (!profile) {
          addResult({ test: 'User Profile Check', status: 'error', message: `No profile found for user ${user.id}`, duration: duration5 })
        } else {
          // Check profile completeness
          const issues = []
          if (!profile.phone) issues.push('missing phone')
          if (profile.phone && profile.phone.startsWith('temp-')) issues.push('temporary phone')
          if (!profile.user_type) issues.push('missing user_type')
          
          if (issues.length === 0) {
            addResult({ test: 'User Profile Check', status: 'success', message: `Complete profile found: ${profile.phone}`, duration: duration5 })
          } else {
            addResult({ test: 'User Profile Check', status: 'error', message: `Profile issues: ${issues.join(', ')}`, duration: duration5 })
          }
        }
      } catch (err) {
        const duration5 = Date.now() - start5
        addResult({ test: 'User Profile Check', status: 'error', message: 'Profile check timeout', duration: duration5 })
      }
    } else {
      addResult({ test: 'User Profile Check', status: 'error', message: 'No user logged in' })
    }

    // Test 5: Sticker insert (the main problem)
    if (user?.id) {
      const start4 = Date.now()
      const testSticker = {
        owner_id: user.id,
        token: `TEST-${Date.now()}`,
        plate: 'TEST-123',
        style: 'minimal',
        status: 'active' as const
      }

      try {
        addResult({ test: 'Sticker Insert', status: 'pending', message: 'Attempting insert...' })
        
        const insertPromise = supabase.from('stickers').insert(testSticker).select().single()
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Insert timeout after 15 seconds')), 15000)
        )

        const result = await Promise.race([insertPromise, timeoutPromise])
        const { data, error } = result as { data: { id: string } | null; error: Error | null }
        const duration4 = Date.now() - start4

        if (error) {
          addResult({ test: 'Sticker Insert', status: 'error', message: error.message, duration: duration4 })
        } else {
          addResult({ test: 'Sticker Insert', status: 'success', message: `Created sticker: ${data?.id || 'N/A'}`, duration: duration4 })
          
          // Clean up test data
          if (data?.id) {
            await supabase.from('stickers').delete().eq('id', data.id)
          }
        }
      } catch (err) {
        const duration4 = Date.now() - start4
        addResult({ test: 'Sticker Insert', status: 'error', message: (err as Error).message, duration: duration4 })
      }
    } else {
      addResult({ test: 'Sticker Insert', status: 'error', message: 'No user logged in' })
    }

    // Test 6: Production Signup Issue Check
    if (user?.id) {
      const start6 = Date.now()
      try {
        // Check if user exists in auth.users but missing from user_profiles
        const { data: authUser, error: authError } = await supabase.auth.getUser()
        
        if (authUser?.user) {
          const authUserId = authUser.user.id
          const authUserEmail = authUser.user.email
          const authUserPhone = authUser.user.user_metadata?.phone || authUser.user.phone
          
          // Check user_profiles table
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authUserId)
            .single()
          
          const duration6 = Date.now() - start6
          
          if (profileError && profileError.code === 'PGRST116') {
            // User exists in auth but not in user_profiles - this is the signup issue!
            addResult({ 
              test: 'Production Signup Issue Check', 
              status: 'error', 
              message: `❌ SIGNUP BUG DETECTED! User ${authUserEmail} exists in auth.users but has NO profile. Phone in auth metadata: ${authUserPhone || 'MISSING'}`,
              duration: duration6 
            })
          } else if (profileError) {
            addResult({ 
              test: 'Production Signup Issue Check', 
              status: 'error', 
              message: `Profile query error: ${profileError.message}`,
              duration: duration6 
            })
          } else if (profile) {
            if (!profile.phone) {
              addResult({ 
                test: 'Production Signup Issue Check', 
                status: 'error', 
                message: `❌ SIGNUP BUG DETECTED! User ${authUserEmail} has profile but phone is NULL. Phone in auth metadata: ${authUserPhone || 'MISSING'}`,
                duration: duration6 
              })
            } else {
              addResult({ 
                test: 'Production Signup Issue Check', 
                status: 'success', 
                message: `✅ Signup OK. User has profile with phone: ${profile.phone}`,
                duration: duration6 
              })
            }
          }
        } else {
          addResult({ 
            test: 'Production Signup Issue Check', 
            status: 'error', 
            message: 'Could not get current auth user'
          })
        }
      } catch (err) {
        const duration6 = Date.now() - start6
        addResult({ 
          test: 'Production Signup Issue Check', 
          status: 'error', 
          message: `Signup check timeout: ${(err as Error).message}`,
          duration: duration6 
        })
      }
    } else {
      addResult({ 
        test: 'Production Signup Issue Check', 
        status: 'error', 
        message: 'No user logged in' 
      })
    }

    setIsRunning(false)
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-black dark:via-gray-900 dark:to-orange-950">
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Diagnostics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={runDiagnostics} 
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunning ? 'Running...' : 'Run Diagnostics'}
              </Button>
              
              {user && (
                <div className="text-sm text-gray-600 flex items-center">
                  Current User: <code className="ml-1 bg-gray-100 px-2 py-1 rounded">{user.id}</code>
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Test Results:</h3>
                {results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                      <span className="font-medium">{result.test}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{result.message}</span>
                      {result.duration && (
                        <span className="text-xs text-gray-500">({result.duration}ms)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
              <strong>What this tests:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Basic database connectivity</li>
                <li>User authentication status</li>
                <li>Sticker table read permissions</li>
                <li>Sticker table insert permissions (RLS policies)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 