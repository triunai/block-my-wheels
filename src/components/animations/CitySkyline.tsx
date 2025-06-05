import React from "react";
import { motion } from "framer-motion";

interface CitySkylineProps {
  className?: string;
  buildingCount?: number;
  animateWindows?: boolean;
  nightMode?: boolean;
}

export const CitySkyline: React.FC<CitySkylineProps> = ({
  className = "",
  buildingCount = 7,
  animateWindows = true,
  nightMode = false,
}) => {
  // Generate buildings with random heights and widths
  const buildings = Array.from({ length: buildingCount }, (_, index) => ({
    height: Math.floor(Math.random() * 100) + 120, // 120-220px
    width: Math.floor(Math.random() * 30) + 60,     // 60-90px
    delay: index * 0.1,
    id: index,
  }));

  return (
    <div className={`absolute bottom-0 left-0 right-0 z-10 flex items-end justify-center space-x-2 ${className}`}>
      {buildings.map((building) => (
        <motion.div
          key={building.id}
          className={`relative ${
            nightMode 
              ? "bg-gradient-to-t from-gray-800 to-gray-600" 
              : "bg-gradient-to-t from-gray-700 to-gray-500"
          }`}
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
          {animateWindows && (
            <div className="absolute inset-2 grid grid-cols-3 gap-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`${
                    nightMode ? "bg-yellow-300" : "bg-yellow-200"
                  } opacity-60`}
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
          )}
          
          {/* Building antenna/details */}
          {Math.random() > 0.5 && (
            <motion.div
              className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-1 ${
                nightMode ? "bg-red-400" : "bg-gray-400"
              }`}
              style={{ height: "20px" }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ 
                delay: building.delay + 0.5,
                duration: 0.3 
              }}
            >
              {/* Blinking antenna light */}
              <motion.div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full"
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: building.delay + 2,
                }}
              />
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}; 