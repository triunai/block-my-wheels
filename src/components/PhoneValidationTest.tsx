// Test component for Malaysian phone validation
// Add this to your routes temporarily to test

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { sanitizeAndValidate, phoneUtils } from '../lib/validation'
import { validateMalaysianPhone } from '../lib/utils/formValidation'

export function PhoneValidationTest() {
  const [testPhone, setTestPhone] = useState('')
  const [results, setResults] = useState<any>(null)

  const runTest = () => {
    // Test our validation functions
    const sanitizeResult = sanitizeAndValidate.malaysianPhone(testPhone)
    const formResult = validateMalaysianPhone(testPhone)
    
    const results = {
      input: testPhone,
      sanitized: sanitizeResult.value,
      isValid: sanitizeResult.isValid,
      whatsappId: sanitizeResult.whatsappId,
      formatted: phoneUtils.formatDisplay(testPhone),
      isMobile: phoneUtils.isMobile(testPhone),
      formError: formResult.errorMessage,
      formValid: formResult.isValid
    }
    
    setResults(results)
    console.log('📱 Phone validation test results:', results)
  }

  // Predefined test cases
  const testCases = [
    { label: 'Local Mobile', value: '0123456789' },
    { label: 'International Mobile', value: '+60123456789' },
    { label: 'With Formatting', value: '012-345 6789' },
    { label: 'KL Landline', value: '0312345678' },
    { label: 'Invalid US', value: '+1234567890' },
    { label: 'Too Short', value: '012345' },
    { label: 'Non-numeric', value: 'abc123' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-black dark:via-gray-900 dark:to-orange-950 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Malaysian Phone Validation Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Manual Input Test */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Manual Test</h3>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter phone number to test..."
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={runTest}>Test</Button>
              </div>
            </div>

            {/* Quick Test Buttons */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Quick Tests</h3>
              <div className="flex flex-wrap gap-2">
                {testCases.map((testCase, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTestPhone(testCase.value)
                      // Auto-run test after setting value
                      setTimeout(() => {
                        const sanitizeResult = sanitizeAndValidate.malaysianPhone(testCase.value)
                        const formResult = validateMalaysianPhone(testCase.value)
                        
                        setResults({
                          input: testCase.value,
                          sanitized: sanitizeResult.value,
                          isValid: sanitizeResult.isValid,
                          whatsappId: sanitizeResult.whatsappId,
                          formatted: phoneUtils.formatDisplay(testCase.value),
                          isMobile: phoneUtils.isMobile(testCase.value),
                          formError: formResult.errorMessage,
                          formValid: formResult.isValid
                        })
                      }, 100)
                    }}
                  >
                    {testCase.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Results Display */}
            {results && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Results</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Input & Validation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Input:</strong> "{results.input}"</div>
                      <div>
                        <strong>Valid:</strong> 
                        <Badge variant={results.isValid ? "default" : "destructive"} className="ml-2">
                          {results.isValid ? "✅ Valid" : "❌ Invalid"}
                        </Badge>
                      </div>
                      <div><strong>Error:</strong> {results.formError || "None"}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Processed Values</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div><strong>Sanitized:</strong> {results.sanitized}</div>
                      <div><strong>WhatsApp ID:</strong> {results.whatsappId}</div>
                      <div><strong>Formatted:</strong> {results.formatted}</div>
                      <div>
                        <strong>Type:</strong> 
                        <Badge variant="outline" className="ml-2">
                          {results.isMobile ? "📱 Mobile" : "☎️ Landline"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* JSON Output for Debugging */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Debug Output</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                      {JSON.stringify(results, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
