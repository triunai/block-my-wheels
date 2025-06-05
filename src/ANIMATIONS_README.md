# 🎭 Animation Library Documentation

## Overview

This project includes a comprehensive animation library built with **@tsparticles/react** and **Framer Motion**, providing easy-to-use components for creating stunning visual effects.

## 🚀 Demo Pages

- **`/animations`** - Complete animation library showcase
- **`/traffic`** - Traffic-themed hero section with advanced animations

## 📦 Installed Libraries

```bash
npm install @tsparticles/react @tsparticles/slim framer-motion
```

## 🎨 Available Components

### Particle Backgrounds

**Component:** `ParticleBackground`

**Available Presets:**
- `floating` - Connected particles with hover effects
- `traffic` - Colorful particles moving like traffic
- `waves` - Wave-like motion patterns  
- `snow` - Falling snow effect
- `matrix` - Matrix-style falling characters
- `constellation` - Interactive star constellation
- `bubbles` - Rising colorful bubbles

**Usage:**
```tsx
import { ParticleBackground } from "./components/animations";

<ParticleBackground 
  preset="traffic" 
  className="fixed inset-0 z-0" 
/>
```

### Framer Motion Animations

#### AnimatedElement
**Available Presets:** `fadeIn`, `slideIn`, `slideUp`, `scale`, `bounce`, `rotate`

```tsx
import { AnimatedElement } from "./components/animations";

<AnimatedElement 
  preset="bounce" 
  duration={0.8} 
  delay={0.2}
  hover
  tap
>
  <div>Your content here</div>
</AnimatedElement>
```

#### FloatingElement
```tsx
<FloatingElement intensity={15} speed={2}>
  <div>Floating content</div>
</FloatingElement>
```

#### PulseElement
```tsx
<PulseElement scale={1.2} speed={1}>
  <div>Pulsing content</div>
</PulseElement>
```

#### Typewriter Effect
```tsx
<Typewriter 
  text="Your text here"
  speed={0.05}
  className="text-xl"
  cursor={true}
/>
```

#### StaggerContainer
```tsx
<StaggerContainer staggerDelay={0.1}>
  <div>Child elements will animate in sequence</div>
  <div>Each with a 0.1s delay</div>
</StaggerContainer>
```

#### RevealOnScroll
```tsx
<RevealOnScroll threshold={0.1}>
  <div>Animates when scrolled into view</div>
</RevealOnScroll>
```

#### PageTransition
```tsx
<PageTransition>
  <div>Page content with smooth transitions</div>
</PageTransition>
```

## 🚗 Traffic Hero Demo Features

The `/traffic` route showcases advanced animation techniques:

### Interactive Elements
- **Day/Night Mode Toggle** - Dynamic background transitions
- **Traffic Density Control** - Adjustable car animation density
- **Real-time Speed Indicator** - Animated speed display
- **Traffic Light System** - Cycling traffic light with glow effects

### Animation Components
- **Animated Cars** - Multi-lane traffic with different speeds and directions
- **Road Markings** - Moving lane dividers
- **City Skyline** - Buildings with animated windows
- **Particle Background** - Traffic-themed particle effects

### Code Example - Car Animation
```tsx
const Car = ({ delay, speed, lane, color, emoji, direction }) => {
  const startX = direction === "right" ? "-100px" : "100vw";
  const endX = direction === "right" ? "100vw" : "-100px";
  
  return (
    <motion.div
      className="absolute text-4xl z-20"
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
```

## 🎯 Key Features

### Performance Optimized
- **60fps animations** with hardware acceleration
- **Lightweight particle engine** using @tsparticles/slim
- **Efficient re-renders** with proper React keys

### TypeScript Ready
- **Full type safety** for all components
- **IntelliSense support** for better developer experience
- **Type-safe preset configurations**

### Responsive Design
- **Mobile-friendly** animations
- **Touch interactions** with whileTap effects
- **Adaptive layouts** for different screen sizes

### Easy Integration
- **Drop-in components** with sensible defaults
- **Customizable props** for fine-tuning
- **Consistent API** across all animation types

## 🛠️ Customization

### Creating Custom Particle Presets
```tsx
const customConfig = {
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  particles: {
    color: { value: "#your-color" },
    move: {
      direction: "your-direction",
      enable: true,
      speed: { min: 1, max: 5 }
    },
    // ... more configuration
  }
};
```

### Custom Animation Variants
```tsx
const customVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
};

<motion.div
  variants={customVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
>
  Custom animation
</motion.div>
```

## 📚 References

- **Framer Motion Docs:** [https://www.framer.com/motion/](https://www.framer.com/motion/)
- **tsParticles Docs:** [https://particles.js.org/](https://particles.js.org/)
- **Animation Examples:** [https://rangle.io/blog/how-to-create-an-animated-hero-banner-in-react-using-framer-motion](https://rangle.io/blog/how-to-create-an-animated-hero-banner-in-react-using-framer-motion)

## 🎉 Getting Started

1. Visit `/animations` to explore all available components
2. Check out `/traffic` for an advanced implementation example
3. Copy the code examples and customize for your needs
4. Refer to this documentation for component APIs

Happy animating! ✨ 