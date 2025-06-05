import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ParticleBackground,
  AnimatedElement,
  FloatingElement,
  PulseElement,
  Typewriter,
  RevealOnScroll,
} from "../../components/animations";

// Car component with Framer Motion
const Car = ({ 
  delay = 0, 
  speed = 3, 
  lane = 1, 
  color = "#ff6b6b",
  emoji = "🚗",
  direction = "right" 
}: {
  delay?: number;
  speed?: number;
  lane?: number;
  color?: string;
  emoji?: string;
  direction?: "left" | "right";
}) => {
  const startX = direction === "right" ? "-100px" : "100vw";
  const endX = direction === "right" ? "100vw" : "-100px";
  
  return (
    <motion.div
      className={`absolute text-4xl z-20`}
      style={{ 
        top: `${20 + (lane * 80)}px`,
        transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)"
      }}
      initial={{ x: startX }}
      animate={{ x: endX }}
      transition={{
        duration: speed,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <div style={{ color }}>{emoji}</div>
    </motion.div>
  );
};

// Traffic Light Component
const TrafficLight = () => {
  const [currentLight, setCurrentLight] = useState(0);
  const lights = ["red", "yellow", "green"];
  const lightColors = ["#ff4444", "#ffaa00", "#44ff44"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLight((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="fixed top-8 right-8 z-30 bg-gray-800 p-4 rounded-lg shadow-lg"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1 }}
    >
      <div className="space-y-2">
        {lights.map((light, index) => (
          <motion.div
            key={light}
            className="w-6 h-6 rounded-full border-2 border-gray-600"
            style={{
              backgroundColor: currentLight === index ? lightColors[index] : "#333",
            }}
            animate={{
              boxShadow: currentLight === index 
                ? `0 0 20px ${lightColors[index]}` 
                : "0 0 0px transparent",
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Road Markings Component
const RoadMarkings = () => {
  return (
    <div className="absolute inset-0 z-10 overflow-hidden">
      {/* Road lanes */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-700 via-gray-800 to-gray-700 opacity-20" />
      
      {/* Lane dividers */}
      {[1, 2, 3].map((lane) => (
        <div key={lane} className="absolute w-full" style={{ top: `${60 + (lane * 80)}px` }}>
          <motion.div
            className="h-1 bg-yellow-400 opacity-60"
            style={{
              background: "repeating-linear-gradient(to right, #facc15 0px, #facc15 40px, transparent 40px, transparent 80px)",
            }}
            animate={{ x: [-80, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
      ))}
    </div>
  );
};

// Speed Indicator
const SpeedIndicator = () => {
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(Math.floor(Math.random() * 40) + 60); // 60-100 km/h
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="fixed bottom-8 right-8 z-30 bg-black/80 backdrop-blur-sm p-6 rounded-lg border border-blue-500"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.5 }}
    >
      <div className="text-center">
        <motion.div 
          className="text-3xl font-bold text-blue-400 mb-2"
          key={speed}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {speed}
        </motion.div>
        <div className="text-sm text-gray-400">km/h</div>
      </div>
    </motion.div>
  );
};

// City Skyline
const CitySkyline = () => {
  const buildings = [
    { height: 120, width: 60, delay: 0 },
    { height: 180, width: 80, delay: 0.1 },
    { height: 140, width: 70, delay: 0.2 },
    { height: 200, width: 90, delay: 0.3 },
    { height: 160, width: 75, delay: 0.4 },
    { height: 220, width: 85, delay: 0.5 },
    { height: 130, width: 65, delay: 0.6 },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-5 flex items-end justify-center space-x-2">
      {buildings.map((building, index) => (
        <motion.div
          key={index}
          className="bg-gradient-to-t from-gray-800 to-gray-600 relative"
          style={{ 
            height: building.height, 
            width: building.width,
          }}
          initial={{ y: building.height }}
          animate={{ y: 0 }}
          transition={{ 
            delay: building.delay,
            duration: 0.8,
            ease: "easeOut"
          }}
        >
          {/* Building windows */}
          <div className="absolute inset-2 grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <motion.div
                key={i}
                className="bg-yellow-300 opacity-60"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.6, 0] }}
                transition={{
                  delay: building.delay + 1 + (i * 0.1),
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 3,
                }}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const TrafficHeroDemo: React.FC = () => {
  const [isNightMode, setIsNightMode] = useState(false);
  const [trafficDensity, setTrafficDensity] = useState("medium");

  const cars = [
    // Right-bound traffic
    { delay: 0, speed: 4, lane: 1, color: "#ff6b6b", emoji: "🚗", direction: "right" as const },
    { delay: 1, speed: 3.5, lane: 2, color: "#4ecdc4", emoji: "🚙", direction: "right" as const },
    { delay: 2, speed: 4.5, lane: 3, color: "#45b7d1", emoji: "🚐", direction: "right" as const },
    { delay: 0.5, speed: 3, lane: 1, color: "#96ceb4", emoji: "🚕", direction: "right" as const },
    { delay: 1.5, speed: 4, lane: 2, color: "#feca57", emoji: "🚗", direction: "right" as const },
    
    // Left-bound traffic (return lane)
    { delay: 0.3, speed: 3.8, lane: 4, color: "#ff9ff3", emoji: "🚗", direction: "left" as const },
    { delay: 1.3, speed: 3.2, lane: 5, color: "#54a0ff", emoji: "🚙", direction: "left" as const },
    { delay: 2.3, speed: 4.2, lane: 6, color: "#5f27cd", emoji: "🚐", direction: "left" as const },
  ];

  const getTrafficCars = () => {
    switch (trafficDensity) {
      case "light":
        return cars.slice(0, 4);
      case "heavy":
        return [...cars, ...cars.map(car => ({ ...car, delay: car.delay + 3 }))];
      default:
        return cars;
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-1000 ${
      isNightMode 
        ? "bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900" 
        : "bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600"
    }`}>
      
      {/* Particle Background - Traffic Theme */}
      <div className="absolute inset-0 z-0">
        <ParticleBackground 
          preset="traffic" 
          className="w-full h-full opacity-60"
        />
      </div>

      {/* City Skyline */}
      <CitySkyline />

      {/* Road Markings */}
      <RoadMarkings />

      {/* Animated Cars */}
      <AnimatePresence>
        {getTrafficCars().map((car, index) => (
          <Car key={`${trafficDensity}-${index}`} {...car} />
        ))}
      </AnimatePresence>

      {/* Traffic Light */}
      <TrafficLight />

      {/* Speed Indicator */}
      <SpeedIndicator />

      {/* Hero Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8 text-center">
        
        {/* Main Title */}
        <AnimatedElement preset="slideUp" delay={0.5} className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
              TRAFFIC
            </span>
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold text-white">
            HERO DEMO
          </h2>
        </AnimatedElement>

        {/* Typewriter Subtitle */}
        <AnimatedElement preset="fadeIn" delay={1} className="mb-12">
          <Typewriter 
            text="Experience the rush of city traffic with stunning animations!"
            speed={0.05}
            className="text-xl md:text-2xl text-gray-200 max-w-3xl"
          />
        </AnimatedElement>

        {/* Floating Action Buttons */}
        <div className="flex flex-wrap gap-6 justify-center mb-12">
          <FloatingElement intensity={8} speed={2}>
            <motion.button
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsNightMode(!isNightMode)}
            >
              {isNightMode ? "🌅 Day Mode" : "🌙 Night Mode"}
            </motion.button>
          </FloatingElement>

          <FloatingElement intensity={10} speed={1.8}>
            <motion.button
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const densities = ["light", "medium", "heavy"];
                const currentIndex = densities.indexOf(trafficDensity);
                setTrafficDensity(densities[(currentIndex + 1) % densities.length]);
              }}
            >
              🚦 Traffic: {trafficDensity.toUpperCase()}
            </motion.button>
          </FloatingElement>
        </div>

        {/* Stats Cards */}
        <RevealOnScroll className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          <PulseElement scale={1.05} speed={2}>
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-white/20">
              <div className="text-3xl mb-2">🚗</div>
              <div className="text-2xl font-bold text-white">150+</div>
              <div className="text-gray-300">Cars per minute</div>
            </div>
          </PulseElement>

          <PulseElement scale={1.05} speed={2.2}>
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-white/20">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-2xl font-bold text-white">60fps</div>
              <div className="text-gray-300">Smooth animations</div>
            </div>
          </PulseElement>

          <PulseElement scale={1.05} speed={1.8}>
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-white/20">
              <div className="text-3xl mb-2">🎨</div>
              <div className="text-2xl font-bold text-white">∞</div>
              <div className="text-gray-300">Possibilities</div>
            </div>
          </PulseElement>
        </RevealOnScroll>

        {/* Feature Showcase */}
        <RevealOnScroll className="mt-16 max-w-6xl w-full">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-8 border border-white/10">
            <h3 className="text-3xl font-bold text-white mb-6 text-center">
              Animation Features Showcase
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatedElement preset="slideUp" delay={0.1}>
                <div className="text-center p-4">
                  <div className="text-4xl mb-3">🎭</div>
                  <h4 className="text-lg font-semibold text-white mb-2">Particle Effects</h4>
                  <p className="text-gray-300 text-sm">Dynamic traffic particles with realistic movement patterns</p>
                </div>
              </AnimatedElement>

              <AnimatedElement preset="slideUp" delay={0.2}>
                <div className="text-center p-4">
                  <div className="text-4xl mb-3">🚗</div>
                  <h4 className="text-lg font-semibold text-white mb-2">Car Animations</h4>
                  <p className="text-gray-300 text-sm">Smooth vehicle movement with lane switching</p>
                </div>
              </AnimatedElement>

              <AnimatedElement preset="slideUp" delay={0.3}>
                <div className="text-center p-4">
                  <div className="text-4xl mb-3">🏙️</div>
                  <h4 className="text-lg font-semibent text-white mb-2">City Elements</h4>
                  <p className="text-gray-300 text-sm">Animated skyline with building lights</p>
                </div>
              </AnimatedElement>

              <AnimatedElement preset="slideUp" delay={0.4}>
                <div className="text-center p-4">
                  <div className="text-4xl mb-3">⚡</div>
                  <h4 className="text-lg font-semibold text-white mb-2">Interactive UI</h4>
                  <p className="text-gray-300 text-sm">Real-time controls and responsive feedback</p>
                </div>
              </AnimatedElement>
            </div>
          </div>
        </RevealOnScroll>

        {/* Code Example */}
        <RevealOnScroll className="mt-12 max-w-4xl w-full">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h4 className="text-xl font-semibold text-white mb-4">Quick Implementation:</h4>
            <pre className="text-green-400 text-sm overflow-x-auto">
{`// Easy car animation with Framer Motion
<motion.div
  initial={{ x: "-100px" }}
  animate={{ x: "100vw" }}
  transition={{ 
    duration: 3, 
    repeat: Infinity, 
    ease: "linear" 
  }}
>
  🚗
</motion.div>`}
            </pre>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
};

export default TrafficHeroDemo; 