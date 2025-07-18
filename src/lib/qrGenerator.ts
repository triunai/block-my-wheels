import { qrcode } from '@akamfoad/qr'
import { logger } from './utils'

export interface QRCodeOptions {
  size?: number
  padding?: number
  foregroundColor?: string
  backgroundColor?: string
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

export interface StickerTemplate {
  width: number
  height: number
  qrSize: number
  qrPosition: { x: number; y: number }
  textAreas: {
    title: { x: number; y: number; fontSize: number; color: string }
    instructions: { x: number; y: number; fontSize: number; color: string }
    plate: { x: number; y: number; fontSize: number; color: string }
    website: { x: number; y: number; fontSize: number; color: string }
  }
  background: string
  borderColor?: string
  borderWidth?: number
}

// Generate unique token in BMW-timestamp-random format
export const generateToken = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `BMW-${timestamp}-${random}`
}

// Generate QR code data URL from token
export const generateQRCode = (token: string, options: QRCodeOptions = {}): string => {
  const {
    size = 200,
    padding = 10,
    foregroundColor = '#000000',
    backgroundColor = '#ffffff'
  } = options

  try {
    logger.info(`[QR_GEN] Generating QR code for token: ${token}`)
    // Create QR code using @akamfoad/qr
    const qr = qrcode(token)
    logger.info('[QR_GEN] QR code object created')
    const modules = qr.modules
    const moduleCount = modules.length
    logger.info(`[QR_GEN] QR modules: ${moduleCount}x${moduleCount}`)

    // Calculate cell size
    const cellSize = Math.floor((size - padding * 2) / moduleCount)
    const actualSize = cellSize * moduleCount + padding * 2

    // Create canvas
    const canvas = document.createElement('canvas')
    canvas.width = actualSize
    canvas.height = actualSize
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Failed to get 2D context')
    }

    // Fill background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, actualSize, actualSize)

    // Draw QR code modules
    ctx.fillStyle = foregroundColor
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (modules[row][col]) {
          const x = padding + col * cellSize
          const y = padding + row * cellSize
          ctx.fillRect(x, y, cellSize, cellSize)
        }
      }
    }

    // Return data URL
    return canvas.toDataURL('image/png')
  } catch (error) {
    logger.error('Failed to generate QR code', error)
    throw new Error('QR code generation failed')
  }
}

// Create complete sticker with QR code
export const generateSticker = async (
  token: string,
  plate: string,
  template: StickerTemplate,
  qrOptions: QRCodeOptions = {}
): Promise<string> => {
  try {
    logger.info(`[STICKER_GEN] Starting generation for token: ${token}`)
    
    // Generate QR code
    const qrDataUrl = generateQRCode(token, {
      size: template.qrSize,
      ...qrOptions
    })
    logger.info(`[STICKER_GEN] QR code generated: ${qrDataUrl.slice(0, 50)}...`)

    // Create sticker canvas
    const canvas = document.createElement('canvas')
    canvas.width = template.width
    canvas.height = template.height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Failed to get 2D context')
    }

    // Fill background
    ctx.fillStyle = template.background
    ctx.fillRect(0, 0, template.width, template.height)

    // Draw border if specified
    if (template.borderColor && template.borderWidth) {
      ctx.strokeStyle = template.borderColor
      ctx.lineWidth = template.borderWidth
      ctx.strokeRect(0, 0, template.width, template.height)
    }

    // Draw minimal text elements - QR-focused design
    const { textAreas } = template

    // Show license plate if provided, otherwise show website
    if (plate) {
      ctx.fillStyle = textAreas.plate.color
      ctx.font = `bold ${textAreas.plate.fontSize}px Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText(plate, textAreas.plate.x, template.height - 15)
    } else {
      // Only show website if no license plate
      ctx.fillStyle = textAreas.website.color
      ctx.font = `${textAreas.website.fontSize}px Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('BlockMyWheels.com', textAreas.website.x, template.height - 15)
    }

    // Load and draw QR code asynchronously
    logger.info('[STICKER_GEN] Loading QR image...')
    return new Promise((resolve, reject) => {
      const qrImage = new Image()
      
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        logger.error('[STICKER_GEN] QR image load timeout')
        reject(new Error('QR image load timeout after 10 seconds'))
      }, 10000)
      
      qrImage.onload = () => {
        clearTimeout(timeout)
        try {
          logger.info('[STICKER_GEN] QR image loaded, drawing to canvas...')
          ctx.drawImage(qrImage, template.qrPosition.x, template.qrPosition.y, template.qrSize, template.qrSize)
          const finalDataUrl = canvas.toDataURL('image/png')
          logger.info(`[STICKER_GEN] Sticker generation complete: ${finalDataUrl.slice(0, 50)}...`)
          resolve(finalDataUrl)
        } catch (error) {
          clearTimeout(timeout)
          logger.error('[STICKER_GEN] Error drawing QR image:', error)
          reject(error)
        }
      }
      
      qrImage.onerror = (error) => {
        clearTimeout(timeout)
        logger.error('[STICKER_GEN] Failed to load QR code image:', error)
        reject(new Error('Failed to load QR code image'))
      }
      
      logger.info('[STICKER_GEN] Setting QR image source...')
      qrImage.src = qrDataUrl
    })
  } catch (error) {
    logger.error('Failed to generate sticker', error)
    throw new Error('Sticker generation failed')
  }
}

// Predefined sticker templates - QR-focused designs
export const stickerTemplates: Record<string, StickerTemplate> = {
  modern: {
    width: 300,
    height: 300,
    qrSize: 220,
    qrPosition: { x: 40, y: 40 },
    textAreas: {
      title: { x: 150, y: 25, fontSize: 14, color: '#ff6b35' },
      instructions: { x: 150, y: 280, fontSize: 10, color: '#666666' },
      plate: { x: 150, y: 295, fontSize: 12, color: '#333333' },
      website: { x: 150, y: 295, fontSize: 8, color: '#999999' }
    },
    background: '#ffffff',
    borderColor: '#ff6b35',
    borderWidth: 2
  },
  
  classic: {
    width: 280,
    height: 280,
    qrSize: 200,
    qrPosition: { x: 40, y: 40 },
    textAreas: {
      title: { x: 140, y: 25, fontSize: 12, color: '#000000' },
      instructions: { x: 140, y: 260, fontSize: 9, color: '#333333' },
      plate: { x: 140, y: 275, fontSize: 11, color: '#000000' },
      website: { x: 140, y: 275, fontSize: 7, color: '#666666' }
    },
    background: '#ffffff',
    borderColor: '#000000',
    borderWidth: 1
  },
  
  bright: {
    width: 320,
    height: 320,
    qrSize: 240,
    qrPosition: { x: 40, y: 40 },
    textAreas: {
      title: { x: 160, y: 25, fontSize: 16, color: '#ffffff' },
      instructions: { x: 160, y: 300, fontSize: 11, color: '#ffffff' },
      plate: { x: 160, y: 315, fontSize: 13, color: '#ffffff' },
      website: { x: 160, y: 315, fontSize: 9, color: '#ffffff' }
    },
    background: '#ff6b35',
    borderColor: '#ffffff',
    borderWidth: 3
  },
  
  eco: {
    width: 300,
    height: 300,
    qrSize: 220,
    qrPosition: { x: 40, y: 40 },
    textAreas: {
      title: { x: 150, y: 25, fontSize: 14, color: '#2d5a27' },
      instructions: { x: 150, y: 280, fontSize: 10, color: '#2d5a27' },
      plate: { x: 150, y: 295, fontSize: 12, color: '#2d5a27' },
      website: { x: 150, y: 295, fontSize: 8, color: '#2d5a27' }
    },
    background: '#e8f5e8',
    borderColor: '#4a7c59',
    borderWidth: 2
  },

  minimal: {
    width: 250,
    height: 250,
    qrSize: 200,
    qrPosition: { x: 25, y: 25 },
    textAreas: {
      title: { x: 125, y: 15, fontSize: 10, color: '#666666' },
      instructions: { x: 125, y: 240, fontSize: 8, color: '#666666' },
      plate: { x: 125, y: 240, fontSize: 10, color: '#333333' },
      website: { x: 125, y: 240, fontSize: 7, color: '#999999' }
    },
    background: '#ffffff',
    borderColor: '#dddddd',
    borderWidth: 1
  }
}

// Get scan URL for token
export const getScanUrl = (token: string): string => {
  // Use current window location to get the correct port
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin
  return `${baseUrl}/t/${token}`
}

// Download canvas as file
export const downloadCanvas = (canvas: HTMLCanvasElement, filename: string): void => {
  try {
    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/png')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    logger.info(`Downloaded sticker: ${filename}`)
  } catch (error) {
    logger.error('Failed to download canvas', error)
    throw new Error('Download failed')
  }
} 