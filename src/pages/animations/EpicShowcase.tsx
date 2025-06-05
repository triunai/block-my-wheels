import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

// Mathematical utility functions (optimized for performance)
const createTorusPoints = (R = 100, r = 40, segments = 8) => {
  const points = []
  for (let i = 0; i <= segments; i++) {
    for (let j = 0; j <= segments; j++) {
      const u = (i / segments) * 2 * Math.PI
      const v = (j / segments) * 2 * Math.PI
      const x = (R + r * Math.cos(v)) * Math.cos(u)
      const y = (R + r * Math.cos(v)) * Math.sin(u)
      const z = r * Math.sin(v)
      points.push({ x, y, z, u, v })
    }
  }
  return points
}

const createHelixPath = (radius = 80, height = 200, turns = 3, points = 50) => {
  const path = []
  for (let i = 0; i <= points; i++) {
    const t = (i / points) * turns * 2 * Math.PI
    const x = radius * Math.cos(t)
    const y = (i / points) * height - height / 2
    const z = radius * Math.sin(t)
    path.push({ x, y, z, t })
  }
  return path
}

const createKleinBottle = (scale = 60, segments = 6) => {
  const points = []
  for (let i = 0; i <= segments; i++) {
    for (let j = 0; j <= segments; j++) {
      const u = (i / segments) * 2 * Math.PI
      const v = (j / segments) * 2 * Math.PI
      
      const x = scale * (Math.cos(u) * (1 + Math.sin(v)) + Math.sin(u) * Math.cos(v) * Math.cos(u))
      const y = scale * (Math.sin(u) * (1 + Math.sin(v)) - Math.cos(u) * Math.cos(v) * Math.cos(u))
      const z = scale * (Math.sin(v) + Math.cos(v) * Math.sin(u))
      
      points.push({ x, y, z, u, v })
    }
  }
  return points
}

// Complex 3D Torus Component (optimized)
function MathematicalTorus({ time = 0, scale = 1 }: { time?: number; scale?: number }) {
  const points = createTorusPoints(80 * scale, 30 * scale, 6)
  
  return (
    <div className="absolute" style={{ transformStyle: 'preserve-3d' }}>
      {points.map((point, index) => (
        <motion.div
          key={index}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: `hsl(${(point.u * 180 / Math.PI + time * 20) % 360}, 70%, 60%)`,
            transform: `translate3d(${point.x}px, ${point.y}px, ${point.z}px)`,
            boxShadow: '0 0 15px currentColor',
          }}
          animate={{
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 4,
            delay: index * 0.05,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// Klein Bottle Surface (optimized)
function KleinBottleSurface({ time = 0 }: { time?: number }) {
  const points = createKleinBottle(40, 5)
  
  return (
    <div className="absolute" style={{ transformStyle: 'preserve-3d' }}>
      {points.map((point, index) => (
        <motion.div
          key={index}
          className="absolute w-4 h-4 rounded-full"
          style={{
            background: `hsl(${(point.v * 180 / Math.PI + time * 15) % 360}, 80%, 70%)`,
            transform: `translate3d(${point.x}px, ${point.y}px, ${point.z}px)`,
            boxShadow: '0 0 20px currentColor',
          }}
          animate={{
            scale: [0.7, 1.3, 0.7],
          }}
          transition={{
            duration: 6,
            delay: index * 0.1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// Traveling Red Ball
function TravelingBall({ time = 0, path = 'helix' }: { time?: number; path?: string }) {
  const helixPath = createHelixPath(120, 300, 4, 200)
  const currentIndex = Math.floor((time * 0.5) % helixPath.length)
  const currentPoint = helixPath[currentIndex]
  const nextPoint = helixPath[(currentIndex + 1) % helixPath.length]
  
  // Interpolate between points for smooth movement
  const t = ((time * 0.5) % helixPath.length) - currentIndex
  const x = currentPoint.x + (nextPoint.x - currentPoint.x) * t
  const y = currentPoint.y + (nextPoint.y - currentPoint.y) * t
  const z = currentPoint.z + (nextPoint.z - currentPoint.z) * t
  
  return (
    <motion.div
      className="absolute w-8 h-8 rounded-full"
      style={{
        background: 'radial-gradient(circle at 30% 30%, #ff4444, #cc0000)',
        transform: `translate3d(${x}px, ${y}px, ${z}px)`,
        boxShadow: '0 0 30px #ff4444, 0 0 60px #ff4444, 0 0 90px #ff4444',
        border: '2px solid #ffffff',
      }}
      animate={{
        scale: [1, 1.3, 1],
        boxShadow: [
          '0 0 30px #ff4444, 0 0 60px #ff4444, 0 0 90px #ff4444',
          '0 0 50px #ff4444, 0 0 100px #ff4444, 0 0 150px #ff4444',
          '0 0 30px #ff4444, 0 0 60px #ff4444, 0 0 90px #ff4444',
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}

// Parametric Surface (Möbius Strip) - optimized
function MobiusStrip({ time = 0 }: { time?: number }) {
  const points = []
  const segments = 12
  const width = 20
  
  for (let i = 0; i <= segments; i++) {
    for (let j = -1; j <= 1; j += 1) {
      const u = (i / segments) * 2 * Math.PI
      const v = j * width
      
      const x = (100 + v * Math.cos(u / 2)) * Math.cos(u)
      const y = (100 + v * Math.cos(u / 2)) * Math.sin(u)
      const z = v * Math.sin(u / 2)
      
      points.push({ x, y, z, u, v })
    }
  }
  
  return (
    <div className="absolute" style={{ transformStyle: 'preserve-3d' }}>
      {points.map((point, index) => (
        <motion.div
          key={index}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: `hsl(${(point.u * 180 / Math.PI + time * 20) % 360}, 90%, 65%)`,
            transform: `translate3d(${point.x}px, ${point.y}px, ${point.z}px)`,
            boxShadow: '0 0 12px currentColor',
          }}
          animate={{
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 5,
            delay: index * 0.1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}



// Simple 3D Cube (performance optimized)
function SimpleCube({ time = 0, color = '#ff6b6b', position = { x: 0, y: 0, z: 0 } }: { 
  time?: number; 
  color?: string; 
  position?: { x: number; y: number; z: number } 
}) {
  return (
    <motion.div
      className="absolute w-12 h-12"
      style={{
        background: `linear-gradient(45deg, ${color}, ${color}aa)`,
        transform: `translate3d(${position.x}px, ${position.y}px, ${position.z}px)`,
        boxShadow: `0 0 30px ${color}`,
        border: '2px solid rgba(255,255,255,0.3)',
        transformStyle: 'preserve-3d',
      }}
      animate={{
        rotateX: [0, 360],
        rotateY: [0, 360],
        scale: [0.8, 1.2, 0.8],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  )
}

// Performance Monitor
function PerformanceMonitor() {
  const [fps, setFps] = useState(60)
  
  useEffect(() => {
    let lastTime = performance.now()
    let frameCount = 0
    
    function updateFPS() {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)))
        frameCount = 0
        lastTime = currentTime
      }
      
      requestAnimationFrame(updateFPS)
    }
    
    updateFPS()
  }, [])

  return (
    <motion.div
      className="absolute top-4 right-4 z-10 bg-black/80 backdrop-blur-sm p-4 rounded-lg border border-green-500"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1.2 }}
    >
      <div className="text-center">
        <div className="text-green-400 font-bold text-2xl">{fps}</div>
        <div className="text-white text-sm">FPS</div>
      </div>
    </motion.div>
  )
}

// Control Panel
function ControlPanel({ 
  animationSpeed, 
  setAnimationSpeed, 
  showParticles, 
  setShowParticles,
  selectedShape,
  setSelectedShape
}: {
  animationSpeed: number
  setAnimationSpeed: (value: number) => void
  showParticles: boolean
  setShowParticles: (value: boolean) => void
  selectedShape: string
  setSelectedShape: (value: string) => void
}) {
  return (
    <motion.div
      className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-sm p-4 rounded-lg border border-purple-500"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1 }}
    >
      <h3 className="text-white font-bold mb-3">🎮 Mathematical Controls</h3>
      <div className="space-y-3">
        <div>
          <label className="text-white text-sm block mb-1">Animation Speed</label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-white text-xs">{animationSpeed}x</span>
        </div>
        <div>
          <label className="text-white text-sm block mb-1">Geometry</label>
          <select
            value={selectedShape}
            onChange={(e) => setSelectedShape(e.target.value)}
            className="w-full bg-black/50 text-white rounded px-2 py-1 text-sm"
          >
            <option value="all">All Shapes</option>
            <option value="torus">Torus</option>
            <option value="klein">Klein Bottle</option>
            <option value="mobius">Möbius Strip</option>
            <option value="cubes">3D Cubes</option>
          </select>
        </div>
        <label className="flex items-center text-white text-sm">
          <input
            type="checkbox"
            checked={showParticles}
            onChange={(e) => setShowParticles(e.target.checked)}
            className="mr-2"
          />
          Show Particles
        </label>
      </div>
    </motion.div>
  )
}

// Main Component
export default function EpicShowcase() {
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [showParticles, setShowParticles] = useState(true)
  const [selectedShape, setSelectedShape] = useState('all')
  const [time, setTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 0.1 * animationSpeed)
    }, 50)
    return () => clearInterval(interval)
  }, [animationSpeed])

  // Generate particles (reduced for performance)
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
    y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
    delay: Math.random() * 3,
  }))

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, #ff6b6b 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, #4ecdc4 0%, transparent 50%)',
              'radial-gradient(circle at 50% 20%, #45b7d1 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, #f7b731 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, #ff6b6b 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 10 / animationSpeed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Floating Particles */}
      {showParticles && particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-white rounded-full opacity-60"
          style={{ left: particle.x, top: particle.y }}
          animate={{
            y: [particle.y, particle.y - 200, particle.y],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 4 / animationSpeed,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Mathematical Shapes Container */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1000px' }}>
        <motion.div
          className="relative"
          animate={{
            rotateX: [0, 360],
            rotateY: [0, 360],
          }}
          transition={{
            duration: 20 / animationSpeed,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Traveling Red Ball */}
          <TravelingBall time={time} />
          
          {/* Mathematical Shapes */}
          {(selectedShape === 'all' || selectedShape === 'torus') && (
            <MathematicalTorus time={time} scale={1} />
          )}
          
          {(selectedShape === 'all' || selectedShape === 'klein') && (
            <div style={{ transform: 'translateX(200px)' }}>
              <KleinBottleSurface time={time} />
            </div>
          )}
          
          {(selectedShape === 'all' || selectedShape === 'mobius') && (
            <div style={{ transform: 'translateX(-200px)' }}>
              <MobiusStrip time={time} />
            </div>
          )}
          
          {(selectedShape === 'all' || selectedShape === 'cubes') && (
            <>
              <SimpleCube color="#ff6b6b" position={{ x: 0, y: -150, z: 0 }} />
              <SimpleCube color="#4ecdc4" position={{ x: 150, y: 0, z: 50 }} />
              <SimpleCube color="#45b7d1" position={{ x: -150, y: 0, z: -50 }} />
              <SimpleCube color="#f7b731" position={{ x: 0, y: 150, z: 100 }} />
            </>
          )}
        </motion.div>
      </div>

      {/* Simple corner decorations */}
      <motion.div 
        className="absolute bottom-10 left-10 w-4 h-4 bg-purple-500 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ boxShadow: '0 0 20px #a855f7' }}
      />
      <motion.div 
        className="absolute bottom-10 right-10 w-4 h-4 bg-cyan-500 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          delay: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ boxShadow: '0 0 20px #06b6d4' }}
      />

      {/* Header */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-center pointer-events-none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <motion.h1
          className="text-6xl font-bold mb-4 text-white"
          style={{
            textShadow: '0 0 20px #ff4444, 0 0 40px #ff4444, 0 0 60px #ff4444',
          }}
          animate={{
            textShadow: [
              '0 0 20px #ff4444, 0 0 40px #ff4444, 0 0 60px #ff4444',
              '0 0 30px #4ecdc4, 0 0 60px #4ecdc4, 0 0 90px #4ecdc4',
              '0 0 20px #ff4444, 0 0 40px #ff4444, 0 0 60px #ff4444',
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          🌌 MATHEMATICAL UNIVERSE
        </motion.h1>
        <motion.p
          className="text-white text-xl opacity-80"
          animate={{
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Complex geometry • Traveling particles • Pure CSS magic
        </motion.p>
      </motion.div>

      {/* UI Controls */}
      <ControlPanel
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
        showParticles={showParticles}
        setShowParticles={setShowParticles}
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
      />
      
      <PerformanceMonitor />

      {/* Navigation */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <div className="flex space-x-4">
          <motion.button
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/animations'}
          >
            🎨 View 2D Animations
          </motion.button>
          <motion.button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/traffic'}
          >
            🚗 Traffic Demo
          </motion.button>
          <motion.button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/'}
          >
            🏠 Home
          </motion.button>
        </div>
      </motion.div>

      {/* Mathematical Info Panel */}
      <motion.div
        className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 max-w-6xl w-full px-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 3 }}
      >
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
            <motion.div className="p-3" whileHover={{ scale: 1.05 }}>
              <div className="text-3xl mb-2">🍩</div>
              <div className="text-white font-semibold">Torus</div>
              <div className="text-gray-300 text-sm">Parametric Surface</div>
            </motion.div>
            <motion.div className="p-3" whileHover={{ scale: 1.05 }}>
              <div className="text-3xl mb-2">🌀</div>
              <div className="text-white font-semibold">Klein Bottle</div>
              <div className="text-gray-300 text-sm">Non-orientable</div>
            </motion.div>
            <motion.div className="p-3" whileHover={{ scale: 1.05 }}>
              <div className="text-3xl mb-2">♾️</div>
              <div className="text-white font-semibold">Möbius Strip</div>
              <div className="text-gray-300 text-sm">One-sided Surface</div>
            </motion.div>
            <motion.div className="p-3" whileHover={{ scale: 1.05 }}>
              <div className="text-3xl mb-2">🎲</div>
              <div className="text-white font-semibold">3D Cubes</div>
              <div className="text-gray-300 text-sm">Simple Geometry</div>
            </motion.div>
            <motion.div className="p-3" whileHover={{ scale: 1.05 }}>
              <div className="text-3xl mb-2">🔴</div>
              <div className="text-white font-semibold">Red Ball</div>
              <div className="text-gray-300 text-sm">Helix Trajectory</div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Floating Mathematical Constants */}
      <motion.div
        className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-yellow-500"
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 1, 0, -1, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="text-yellow-400 text-center">
          <div className="text-2xl">π</div>
          <div className="text-xs">POWERED BY</div>
          <div className="text-sm font-bold">MATHEMATICS</div>
        </div>
      </motion.div>
    </div>
  )
} 