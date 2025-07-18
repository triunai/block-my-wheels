
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { useCreateSticker } from '../../lib/hooks/useIncidents'
import { toast } from '../../hooks/use-toast'
import { Download, QrCode } from 'lucide-react'
import { FadeawayCars } from '../../components/animations'
import { generateSticker, generateToken, getScanUrl, stickerTemplates } from '../../lib/qrGenerator'
import { useAuth } from '../../contexts/AuthContext'

const stickerStyles = [
  { value: 'minimal', label: 'QR Only (Recommended)', preview: '⚪' },
  { value: 'modern', label: 'Modern Orange', preview: '🟠' },
  { value: 'classic', label: 'Classic Black', preview: '⚫' },
  { value: 'bright', label: 'Bold Orange', preview: '🧡' },
  { value: 'eco', label: 'Eco Green', preview: '🟢' },
]

export function StickerGenerator() {
  const [plate, setPlate] = useState('')
  const [style, setStyle] = useState('minimal')
  const [generatedSticker, setGeneratedSticker] = useState<{
    token: string
    qrCode: string
    downloadUrl: string
    scanUrl: string
  } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewSticker, setPreviewSticker] = useState<string | null>(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)

  const { user } = useAuth()
  const createMutation = useCreateSticker()

  // Generate preview sticker in real-time
  const generatePreview = useCallback(async () => {
    if (!plate.trim()) {
      setPreviewSticker(null)
      return
    }

    setIsGeneratingPreview(true)
    try {
      // For preview, use the actual license plate as QR content
      // This makes the QR code scan to the correct plate reporting page
      const previewToken = plate.trim().toUpperCase()
      const scanUrl = getScanUrl(previewToken)
      
      // Generate preview sticker
      const template = stickerTemplates[style]
      if (!template) {
        throw new Error(`Template '${style}' not found`)
      }
      
      const previewDataUrl = await generateSticker(scanUrl, plate.trim(), template)
      setPreviewSticker(previewDataUrl)
    } catch (error) {
      console.error('Preview generation error:', error)
      toast({
        title: "Preview Failed",
        description: `Could not generate preview: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
      setPreviewSticker(null)
    } finally {
      setIsGeneratingPreview(false)
    }
  }, [plate, style])

  // Update preview when plate or style changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      generatePreview()
    }, 500) // 500ms debounce to avoid too many calls

    return () => clearTimeout(debounceTimer)
  }, [generatePreview])

  const handleGenerate = async () => {
    if (!plate.trim()) {
      toast({
        title: "Plate Required",
        description: "Please enter your license plate number.",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate a sticker.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Use license plate as the token for QR code
      // This way when people scan it, they report the correct plate
      const token = plate.trim().toUpperCase()
      
      // Get scan URL
      const scanUrl = getScanUrl(token)
      
      // Generate sticker with QR code
      const template = stickerTemplates[style]
      if (!template) {
        throw new Error(`Sticker template '${style}' not found`)
      }
      
      console.log('Generating sticker with:', { token, scanUrl, plate: plate.trim(), style })
      const stickerDataUrl = await generateSticker(scanUrl, plate.trim(), template)
      console.log('Sticker generated successfully')
      
      // Save to database
      console.log('Saving to database...')
      await createMutation.mutateAsync({ 
        plate: plate.trim(), 
        style,
        token // Pass the token to be saved
      })
      console.log('Saved to database successfully')
      
      setGeneratedSticker({
        token,
        qrCode: stickerDataUrl,
        downloadUrl: stickerDataUrl,
        scanUrl
      })

      toast({
        title: "Sticker Generated! 🎉",
        description: "Your QR sticker is ready for download.",
      })
    } catch (error) {
      console.error('Generation error:', error)
      toast({
        title: "Generation Failed",
        description: `Failed to generate sticker: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedSticker) return

    const link = document.createElement('a')
    link.href = generatedSticker.downloadUrl
    link.download = `block-my-wheels-${plate.replace(/[^a-zA-Z0-9]/g, '')}-${generatedSticker.token}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download Started",
      description: "Your sticker file is downloading.",
    })
  }

  const handleTestScan = () => {
    if (!generatedSticker) return
    
    window.open(generatedSticker.scanUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-black dark:via-gray-900 dark:to-orange-950 p-4 relative overflow-hidden">
      {/* Subtle background cars */}
      <FadeawayCars 
        carCount={4}
        speed="slow"
        density="light"
        className="opacity-20 dark:opacity-30"
      />
      
      <div className="max-w-2xl mx-auto pt-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            <QrCode className="inline w-8 h-8 mr-2" />
            Generate Your QR Sticker
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create a personalized QR sticker for your vehicle windscreen
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Generator Form */}
          <Card>
            <CardHeader>
              <CardTitle>Sticker Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="plate">License Plate Number</Label>
                <Input
                  id="plate"
                  placeholder="e.g. ABC-1234"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="style">Sticker Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stickerStyles.map((styleOption) => (
                      <SelectItem key={styleOption.value} value={styleOption.value}>
                        {styleOption.preview} {styleOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !plate.trim() || !user}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:cursor-not-allowed"
                size="lg"
              >
                {isGenerating ? 'Generating...' : previewSticker ? 'Generate Final Version' : 'Generate Sticker'}
              </Button>
            </CardContent>
          </Card>

          {/* Preview/Download */}
          <Card>
            <CardHeader>
              <CardTitle>Sticker Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedSticker ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <img
                      src={generatedSticker.qrCode}
                      alt="Generated QR Sticker"
                      className="mx-auto max-w-full h-auto border rounded-lg"
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div><strong>Plate:</strong> {plate}</div>
                    <div><strong>Token:</strong> {generatedSticker.token}</div>
                    <div><strong>Style:</strong> {stickerStyles.find(s => s.value === style)?.label}</div>
                    <div><strong>Scan URL:</strong> <a href={generatedSticker.scanUrl} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600">{generatedSticker.scanUrl}</a></div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownload}
                      className="flex-1"
                      size="lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    
                    <Button
                      onClick={handleTestScan}
                      variant="outline"
                      size="lg"
                      className="flex-1"
                    >
                      Test Scan
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-orange-50 dark:bg-orange-950/30 p-3 rounded">
                    <strong>Instructions:</strong>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Print the downloaded sticker</li>
                      <li>Place it on your windscreen (inside)</li>
                      <li>People can scan it to notify you if blocked</li>
                      <li>You'll get instant WhatsApp notifications</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Real-time Preview */}
                  {previewSticker ? (
                    <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 text-center">
                      <div className="text-xs text-orange-600 mb-2 font-medium">LIVE PREVIEW</div>
                      <img
                        src={previewSticker}
                        alt="Sticker Preview"
                        className="mx-auto max-w-full h-auto border rounded-lg opacity-90"
                      />
                      <div className="text-xs text-gray-500 mt-2">
                        <div>This is a live preview. The QR code links to: <strong>{plate.trim().toUpperCase()}</strong></div>
                        <div className="mt-1">Click "Generate Final Version" to save and download.</div>
                      </div>
                    </div>
                  ) : plate.trim() ? (
                    <div className="text-center text-gray-500 py-12">
                      {isGeneratingPreview ? (
                        <>
                          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                          <p>Generating preview...</p>
                        </>
                      ) : (
                        <>
                          <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p>Preview will appear here</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-12">
                      <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Enter your license plate to see preview</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-2">📱</div>
                <div className="font-medium">1. Generate</div>
                <div className="text-gray-600 dark:text-gray-400">Create your personalized QR sticker</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🚗</div>
                <div className="font-medium">2. Place</div>
                <div className="text-gray-600 dark:text-gray-400">Stick it on your windscreen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🔔</div>
                <div className="font-medium">3. Get Notified</div>
                <div className="text-gray-600 dark:text-gray-400">Receive instant WhatsApp alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
