import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { useAuth } from '../../contexts/AuthContext'

export function QuickDiagnostic() {
  const { user } = useAuth()
  const [envCheck, setEnvCheck] = useState(false)

  const checkEnvironment = () => {
    setEnvCheck(true)
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Quick Diagnostics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkEnvironment} className="mb-4">
            Check Status
          </Button>

          {envCheck && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Environment Variables:</strong>
                  <div className="mt-2 space-y-1 text-sm">
                    <div>Supabase URL: {supabaseUrl ? '✅ Set' : '❌ Missing'}</div>
                    <div>Supabase Key: {supabaseKey ? '✅ Set' : '❌ Missing'}</div>
                    {supabaseUrl && (
                      <div className="text-xs bg-gray-100 p-2 rounded mt-2">
                        <code>{supabaseUrl}</code>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertDescription>
                  <strong>User Authentication:</strong>
                  <div className="mt-2">
                    {user ? (
                      <div className="text-sm space-y-1">
                        <div>✅ User logged in</div>
                        <div>ID: <code>{user.id}</code></div>
                        <div>Email: <code>{user.email}</code></div>
                      </div>
                    ) : (
                      <div>❌ No user logged in</div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertDescription>
                  <strong>Issues Found:</strong>
                  <div className="mt-2 space-y-1 text-sm">
                    {!supabaseUrl && <div>🔴 Missing VITE_SUPABASE_URL</div>}
                    {!supabaseKey && <div>🔴 Missing VITE_SUPABASE_ANON_KEY</div>}
                    {!user && <div>🟡 User not authenticated</div>}
                    {supabaseUrl?.includes('your-project') && <div>🔴 Using template URL - update with real project URL</div>}
                    {supabaseKey?.includes('your-anon-key') && <div>🔴 Using template key - update with real anon key</div>}
                  </div>
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertDescription>
                  <strong>Next Steps:</strong>
                  <div className="mt-2 space-y-1 text-sm">
                    <div>1. Check if your Supabase project is active (not paused)</div>
                    <div>2. Verify environment variables in your .env file</div>
                    <div>3. Try refreshing the page</div>
                    <div>4. Check network connectivity</div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="bg-blue-50 p-3 rounded text-sm">
                <strong>Common Solutions:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Restart the dev server: <code>npm run dev</code></li>
                  <li>Check Supabase dashboard for project status</li>
                  <li>Verify .env file has correct values</li>
                  <li>Try logging out and back in</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 