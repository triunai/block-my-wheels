
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Progress } from '../../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { useCreateSticker, useBatchCreateStickers, useUserStickers } from '../../lib/hooks/useIncidents'
import { toast } from '../../hooks/use-toast'
import { Download, QrCode, Plus, History, Package, Trash2 } from 'lucide-react'
import { FadeawayCars } from '../../components/animations'
import { generateSticker, generateBatchStickers, getScanUrl, stickerTemplates, downloadStickersAsZip } from '../../lib/qrGenerator'
import { useAuth } from '../../contexts/AuthContext'
import { Header } from '../../components/Header'
// Removed unused import - useStickerHistory doesn't exist
import { rpcFunctions } from '../../lib/supabaseClient'
// Removed invalid imports - these functions don't exist in qrGenerator
import JSZip from 'jszip'

const stickerStyles = [
  { value: 'minimal', label: 'QR Only (Recommended)', preview: '⚪' },
  { value: 'modern', label: 'Modern Orange', preview: '🟠' },
  { value: 'classic', label: 'Classic Black', preview: '⚫' },
  { value: 'bright', label: 'Bold Orange', preview: '🧡' },
  { value: 'eco', label: 'Eco Green', preview: '🟢' },
]

export function StickerGenerator() {
  // Single sticker state
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

  // Batch sticker state
  const [batchPlates, setBatchPlates] = useState('')
  const [batchStyle, setBatchStyle] = useState('minimal')
  const [batchResults, setBatchResults] = useState<Array<{
    plate: string
    token: string
    dataUrl: string
    success: boolean
    error?: string
  }> | null>(null)
  const [batchProgress, setBatchProgress] = useState({ completed: 0, total: 0 })
  const [isBatchGenerating, setIsBatchGenerating] = useState(false)

  const { user } = useAuth()
  const createMutation = useCreateSticker()
  const batchCreateMutation = useBatchCreateStickers()
  const { data: userStickers, refetch: refetchStickers } = useUserStickers(user?.id)

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
      
      // Save to database (non-blocking)
      console.log('Saving to database...')
      const saveToDatabase = async () => {
        try {
          const dbResult = await createMutation.mutateAsync({ 
            plate: plate.trim(), 
            style,
            token, // Pass the token to be saved
            userId: user?.id // Pass user ID directly to avoid slow auth call
          })
          console.log('Saved to database successfully:', dbResult)
          
          // Refresh the sticker history
          refetchStickers()
          
          toast({
            title: "Saved to History! 💾",
            description: "Sticker saved to your history for re-printing.",
          })
        } catch (dbError) {
          console.error('Database save failed:', dbError)
          toast({
            title: "Note",
            description: "Sticker generated but not saved to history. You can still download it.",
            variant: "destructive",
          })
        }
      }
      
      // Start database save in background
      saveToDatabase()

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

  // Batch generation handlers
  const handleBatchGenerate = async () => {
    if (!batchPlates.trim()) {
      toast({
        title: "Plates Required",
        description: "Please enter license plate numbers (one per line).",
        variant: "destructive",
      })
      return
    }

    const plates = batchPlates
      .split('\n')
      .map(p => p.trim().toUpperCase())
      .filter(p => p.length > 0)

    if (plates.length === 0) {
      toast({
        title: "No Valid Plates",
        description: "Please enter at least one valid license plate.",
        variant: "destructive",
      })
      return
    }

    if (plates.length > 50) {
      toast({
        title: "Too Many Plates",
        description: "Maximum 50 plates allowed per batch.",
        variant: "destructive",
      })
      return
    }

    setIsBatchGenerating(true)
    setBatchProgress({ completed: 0, total: plates.length })
    setBatchResults(null)

    try {
      // Get template
      const template = stickerTemplates[batchStyle]
      if (!template) {
        throw new Error(`Template '${batchStyle}' not found`)
      }

      // Generate stickers
      const results = await generateBatchStickers(
        plates,
        batchStyle,
        template,
        (completed, total) => {
          setBatchProgress({ completed, total })
        }
      )

      setBatchResults(results)

      // Save to database in batch
      if (user) {
        const successfulPlates = results.filter(r => r.success).map(r => r.plate)
        if (successfulPlates.length > 0) {
          try {
            await batchCreateMutation.mutateAsync({ 
              plates: successfulPlates, 
              style: batchStyle 
            })
          } catch (dbError) {
            console.warn('Database save failed but stickers were generated:', dbError)
          }
        }
      }

      const successCount = results.filter(r => r.success).length
      const failCount = results.length - successCount

      toast({
        title: "Batch Generation Complete! 🎉",
        description: `Generated ${successCount} stickers successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
      })

    } catch (error) {
      console.error('Batch generation error:', error)
      toast({
        title: "Batch Generation Failed",
        description: `Failed to generate stickers: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsBatchGenerating(false)
    }
  }

  const handleBatchDownload = async () => {
    if (!batchResults) return

    const successfulStickers = batchResults.filter(r => r.success)
    if (successfulStickers.length === 0) {
      toast({
        title: "No Stickers to Download",
        description: "No successfully generated stickers found.",
        variant: "destructive",
      })
      return
    }

    try {
      const stickerFiles = successfulStickers.map(result => ({
        filename: `block-my-wheels-${result.plate.replace(/[^a-zA-Z0-9]/g, '')}-${result.token}.png`,
        dataUrl: result.dataUrl
      }))

      await downloadStickersAsZip(stickerFiles, `block-my-wheels-batch-${Date.now()}.zip`)

      toast({
        title: "Batch Download Complete! 📦",
        description: `Downloaded ${stickerFiles.length} stickers as ZIP file.`,
      })
    } catch (error) {
      console.error('Batch download error:', error)
      toast({
        title: "Download Failed",
        description: "Failed to create ZIP file for download.",
        variant: "destructive",
      })
    }
  }

  const handleReprintSticker = async (sticker: { id: string; token: string; plate?: string; style?: string; created_at: string }) => {
    try {
      const template = stickerTemplates[sticker.style || 'minimal']
      if (!template) {
        throw new Error('Template not found')
      }

      const scanUrl = getScanUrl(sticker.token)
      const dataUrl = await generateSticker(scanUrl, sticker.plate || '', template)
      
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `block-my-wheels-${sticker.plate?.replace(/[^a-zA-Z0-9]/g, '') || 'sticker'}-${sticker.token}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Reprint Complete! 🖨️",
        description: `Downloaded sticker for ${sticker.plate}`,
      })
    } catch (error) {
      console.error('Reprint error:', error)
      toast({
        title: "Reprint Failed",
        description: "Failed to regenerate sticker.",
        variant: "destructive",
      })
    }
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
      
      <Header />

      <div className="max-w-4xl mx-auto pt-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            <QrCode className="inline w-8 h-8 mr-2" />
            QR Sticker Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create personalized QR stickers for your vehicles
          </p>
        </div>

        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="single" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              Single Sticker
            </TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Batch Generation
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              My Stickers
            </TabsTrigger>
          </TabsList>

          {/* Single Sticker Tab */}
          <TabsContent value="single">
            <div className="grid md:grid-cols-2 gap-6">
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

                      <div className="text-xs text-gray-500">
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
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                          <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Enter a license plate to see preview</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Batch Generation Tab */}
          <TabsContent value="batch">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Batch Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Batch Generator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="batchPlates">License Plates (one per line)</Label>
                    <Textarea
                      id="batchPlates"
                      placeholder="ABC-1234&#10;XYZ-5678&#10;DEF-9012"
                      value={batchPlates}
                      onChange={(e) => setBatchPlates(e.target.value)}
                      className="mt-1 h-32"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Maximum 50 plates per batch
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="batchStyle">Sticker Style</Label>
                    <Select value={batchStyle} onValueChange={setBatchStyle}>
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

                  {isBatchGenerating && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Generating stickers...</span>
                        <span>{batchProgress.completed}/{batchProgress.total}</span>
                      </div>
                      <Progress value={(batchProgress.completed / batchProgress.total) * 100} />
                    </div>
                  )}

                  <Button
                    onClick={handleBatchGenerate}
                    disabled={isBatchGenerating || !batchPlates.trim()}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    size="lg"
                  >
                    {isBatchGenerating ? 'Generating...' : 'Generate Batch'}
                  </Button>
                </CardContent>
              </Card>

              {/* Batch Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Batch Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {batchResults ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          <span className="text-green-600 font-medium">{batchResults.filter(r => r.success).length} successful</span>
                          {batchResults.filter(r => !r.success).length > 0 && (
                            <span className="text-red-600 font-medium ml-4">{batchResults.filter(r => !r.success).length} failed</span>
                          )}
                        </div>
                        <Button
                          onClick={handleBatchDownload}
                          disabled={batchResults.filter(r => r.success).length === 0}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download ZIP
                        </Button>
                      </div>

                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {batchResults.map((result, index) => (
                          <div key={index} className={`p-2 rounded border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{result.plate}</span>
                              <span className={`text-xs px-2 py-1 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {result.success ? 'Success' : 'Failed'}
                              </span>
                            </div>
                            {result.error && (
                              <div className="text-xs text-red-600 mt-1">{result.error}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Generate a batch to see results here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sticker History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    My Stickers
                  </div>
                  <Button
                    onClick={() => refetchStickers()}
                    variant="outline"
                    size="sm"
                  >
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userStickers && userStickers.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userStickers.map((sticker) => (
                      <div key={sticker.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{sticker.plate || 'No Plate'}</div>
                            <div className="text-xs text-gray-500">{sticker.token}</div>
                          </div>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {sticker.style || 'minimal'}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Created: {new Date(sticker.created_at).toLocaleDateString()}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleReprintSticker(sticker)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Reprint
                          </Button>
                          <Button
                            onClick={() => window.open(getScanUrl(sticker.token), '_blank')}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            Test
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No stickers generated yet</p>
                    <p className="text-sm">Generate your first sticker to see it here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* How It Works */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-2">📱</div>
                <div className="font-medium">1. Generate</div>
                <div className="text-gray-600 dark:text-gray-400">Create your personalized QR stickers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🚗</div>
                <div className="font-medium">2. Place</div>
                <div className="text-gray-600 dark:text-gray-400">Stick them on your windscreens</div>
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
