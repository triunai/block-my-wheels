import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FadeawayCarProps {
  delay?: number;
  duration?: number;
  direction?: "left" | "right";
  lane?: number;
  emoji?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
}

interface FadeawayCarsProps {
  className?: string;
  carCount?: number;
  speed?: "slow" | "medium" | "fast";
  density?: "light" | "medium" | "heavy";
}

const carEmojis = ["🚗", "🚙", "🚐", "🚕", "🚖", "🏎️", "🚓", "🚑"];
const carColors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3", "#54a0ff", "#5f27cd"];

const FadeawayCar: React.FC<FadeawayCarProps> = ({
  delay = 0,
  duration = 8,
  direction = "right",
  lane = 1,
  emoji = "🚗",
  color = "#ff6b6b",
  size = "md",
}) => {
  const startX = direction === "right" ? "-150px" : "calc(100vw + 150px)";
  const endX = direction === "right" ? "calc(100vw + 150px)" : "-150px";
  
  const sizeMap = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl"
  };

  return (
    <motion.div
      className={`absolute ${sizeMap[size]} z-10 pointer-events-none`}
      style={{ 
        top: `${10 + (lane * 18)}%`,
        transform: direction === "left" ? "scaleX(-1)" : "scaleX(1)",
        color
      }}
      initial={{ 
        x: startX,
        opacity: 0,
        scale: 0.8
      }}
      animate={{ 
        x: endX,
        opacity: [0, 1, 1, 0],
        scale: [0.8, 1, 1, 0.6]
      }}
      transition={{
        duration,
        delay,
        ease: "linear",
        repeat: Infinity,
        repeatDelay: 20, // Wait 20 seconds before repeating
        opacity: {
          times: [0, 0.1, 0.8, 1],
          duration
        },
        scale: {
          times: [0, 0.1, 0.8, 1],
          duration
        }
      }}
    >
      <motion.div
        animate={{
          y: [0, -2, 0, -1, 0], // Subtle bouncing effect
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {emoji}
      </motion.div>
    </motion.div>
  );
};

export const FadeawayCars: React.FC<FadeawayCarsProps> = ({
  className = "",
  carCount = 6,
  speed = "medium",
  density = "medium",
}) => {
  const speedMap = {
    slow: { min: 12, max: 18 },
    medium: { min: 8, max: 12 },
    fast: { min: 4, max: 8 }
  };

  const densityMap = {
    light: 2.0,
    medium: 1.0,
    heavy: 0.5
  };

  // Generate multiple waves of cars for continuous traffic
  const generateCarWave = (waveIndex: number) => {
    return Array.from({ length: carCount }, (_, index) => {
      // Mostly left-to-right traffic (80% right, 20% left)
      const direction: "left" | "right" = Math.random() > 0.2 ? "right" : "left";
      const lane = Math.floor(Math.random() * 4) + 1; // 1-4 lanes
      const emoji = carEmojis[Math.floor(Math.random() * carEmojis.length)];
      const color = carColors[Math.floor(Math.random() * carColors.length)];
      const size: "sm" | "md" | "lg" = Math.random() > 0.7 ? "lg" : Math.random() > 0.3 ? "md" : "sm";
      const duration = speedMap[speed].min + Math.random() * (speedMap[speed].max - speedMap[speed].min);
      const delay = (index * densityMap[density]) + (waveIndex * 15) + Math.random() * 2;

      return {
        id: `${waveIndex}-${index}`,
        direction,
        lane,
        emoji,
        color,
        size,
        duration,
        delay,
      };
    });
  };

  // Create 5 waves of cars for continuous traffic
  const allCars = [
    ...generateCarWave(0),
    ...generateCarWave(1),
    ...generateCarWave(2),
    ...generateCarWave(3),
    ...generateCarWave(4),
  ];

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <AnimatePresence>
        {allCars.map((car) => (
          <FadeawayCar
            key={`car-${car.id}`}
            delay={car.delay}
            duration={car.duration}
            direction={car.direction}
            lane={car.lane}
            emoji={car.emoji}
            color={car.color}
            size={car.size}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}; 