import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

// Animation variants
const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const slideInVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 }
};

const slideUpVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 }
};

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
};

const bounceVariants = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  exit: { opacity: 0, scale: 0.3 }
};

const rotateVariants = {
  hidden: { opacity: 0, rotate: -180 },
  visible: { opacity: 1, rotate: 0 },
  exit: { opacity: 0, rotate: 180 }
};

// Animation presets
export type AnimationPreset = 
  | "fadeIn" 
  | "slideIn" 
  | "slideUp" 
  | "scale" 
  | "bounce" 
  | "rotate";

interface AnimatedElementProps {
  children: ReactNode;
  preset?: AnimationPreset;
  duration?: number;
  delay?: number;
  className?: string;
  hover?: boolean;
  tap?: boolean;
}

const variantMap = {
  fadeIn: fadeInVariants,
  slideIn: slideInVariants,
  slideUp: slideUpVariants,
  scale: scaleVariants,
  bounce: bounceVariants,
  rotate: rotateVariants,
};

export const AnimatedElement: React.FC<AnimatedElementProps> = ({
  children,
  preset = "fadeIn",
  duration = 0.5,
  delay = 0,
  className = "",
  hover = false,
  tap = false,
}) => {
  const variants = variantMap[preset];
  
  const hoverEffect = hover ? { scale: 1.05 } : {};
  const tapEffect = tap ? { scale: 0.95 } : {};

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration, delay }}
      whileHover={hoverEffect}
      whileTap={tapEffect}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Stagger animation for lists
interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.1,
  className = "",
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Floating animation
interface FloatingElementProps {
  children: ReactNode;
  intensity?: number;
  speed?: number;
  className?: string;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  intensity = 10,
  speed = 2,
  className = "",
}) => {
  return (
    <motion.div
      animate={{
        y: [-intensity, intensity, -intensity],
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Pulse animation
interface PulseElementProps {
  children: ReactNode;
  scale?: number;
  speed?: number;
  className?: string;
}

export const PulseElement: React.FC<PulseElementProps> = ({
  children,
  scale = 1.1,
  speed = 1,
  className = "",
}) => {
  return (
    <motion.div
      animate={{
        scale: [1, scale, 1],
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Typewriter effect
interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  cursor?: boolean;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 0.05,
  className = "",
  cursor = true,
}) => {
  return (
    <motion.div className={className}>
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.1,
            delay: index * speed,
          }}
        >
          {char}
        </motion.span>
      ))}
      {cursor && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          |
        </motion.span>
      )}
    </motion.div>
  );
};

// Page transition wrapper
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = "",
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Reveal on scroll
interface RevealOnScrollProps {
  children: ReactNode;
  threshold?: number;
  className?: string;
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  threshold = 0.1,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: threshold }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}; 