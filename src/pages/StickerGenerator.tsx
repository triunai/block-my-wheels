
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateSticker } from '@/lib/hooks/useIncidents'
import { toast } from '@/hooks/use-toast'
import { Download, QrCode } from 'lucide-react'

const stickerStyles = [
  { value: 'modern', label: 'Modern Blue', preview: '🔵' },
  { value: 'classic', label: 'Classic Black', preview: '⚫' },
  { value: 'bright', label: 'Bright Orange', preview: '🟠' },
  { value: 'eco', label: 'Eco Green', preview: '🟢' },
]

export function StickerGenerator() {
  const [plate, setPlate] = useState('')
  const [style, setStyle] = useState('modern')
  const [generatedSticker, setGeneratedSticker] = useState<{
    token: string
    qrCode: string
    downloadUrl: string
  } | null>(null)

  const createMutation = useCreateSticker()

  const handleGenerate = async () => {
    if (!plate.trim()) {
      toast({
        title: "Plate Required",
        description: "Please enter your license plate number.",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await createMutation.mutateAsync({ plate: plate.trim(), style })
      
      // Mock QR code generation (in real app, this would come from backend)
      const mockQrData = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="white"/><text x="100" y="100" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="12">QR Code for ${result.token}</text></svg>`
      
      setGeneratedSticker({
        token: result.token,
        qrCode: mockQrData,
        downloadUrl: mockQrData
      })

      toast({
        title: "Sticker Generated!",
        description: "Your QR sticker is ready for download.",
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate sticker. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    if (!generatedSticker) return

    const link = document.createElement('a')
    link.href = generatedSticker.downloadUrl
    link.download = `driver-alert-sticker-${plate}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download Started",
      description: "Your sticker file is downloading.",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <QrCode className="inline w-8 h-8 mr-2" />
            Generate Your QR Sticker
          </h1>
          <p className="text-gray-600">
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
                disabled={createMutation.isPending || !plate.trim()}
                className="w-full"
                size="lg"
              >
                {createMutation.isPending ? 'Generating...' : 'Generate Sticker'}
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
                      alt="Generated QR Code"
                      className="mx-auto w-48 h-48 border rounded-lg"
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>Plate:</strong> {plate}</div>
                    <div><strong>Token:</strong> {generatedSticker.token}</div>
                    <div><strong>Style:</strong> {stickerStyles.find(s => s.value === style)?.label}</div>
                  </div>

                  <Button
                    onClick={handleDownload}
                    className="w-full"
                    size="lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Sticker
                  </Button>

                  <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
                    <strong>Instructions:</strong>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Print the downloaded sticker</li>
                      <li>Place it on your windscreen (inside)</li>
                      <li>People can scan it to notify you if blocked</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Generate a sticker to see the preview</p>
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
                <div className="text-gray-600">Create your personalized QR sticker</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🚗</div>
                <div className="font-medium">2. Place</div>
                <div className="text-gray-600">Stick it on your windscreen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🔔</div>
                <div className="font-medium">3. Get Notified</div>
                <div className="text-gray-600">Receive instant WhatsApp alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
