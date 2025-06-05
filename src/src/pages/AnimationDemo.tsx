import React, { useState } from "react";
import {
  ParticleBackground,
  AnimatedElement,
  StaggerContainer,
  FloatingElement,
  PulseElement,
  Typewriter,
  RevealOnScroll,
  type ParticlePreset,
  type AnimationPreset,
} from "../components/animations";

const AnimationDemo: React.FC = () => {
  const [selectedParticle, setSelectedParticle] = useState<ParticlePreset>("floating");
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationPreset>("fadeIn");

  const particlePresets: ParticlePreset[] = [
    "floating",
    "traffic",
    "waves",
    "snow",
    "matrix",
    "constellation",
    "bubbles",
  ];

  const animationPresets: AnimationPreset[] = [
    "fadeIn",
    "slideIn",
    "slideUp",
    "scale",
    "bounce",
    "rotate",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-x-hidden">
      {/* Particle Background */}
      <div className="fixed inset-0 z-0">
        <ParticleBackground 
          preset={selectedParticle} 
          className="w-full h-full"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        {/* Header */}
        <AnimatedElement preset="slideUp" className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Animation Library Demo
          </h1>
          <Typewriter 
            text="Explore beautiful particle effects and smooth animations!"
            speed={0.03}
            className="text-xl text-gray-300"
          />
        </AnimatedElement>

        {/* Particle Controls */}
        <RevealOnScroll className="mb-16">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h2 className="text-2xl font-semibold mb-4">Particle Backgrounds</h2>
            <p className="text-gray-300 mb-4">
              Choose different particle effects for the background:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {particlePresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSelectedParticle(preset)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedParticle === preset
                      ? "bg-blue-500 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </RevealOnScroll>

        {/* Animation Examples */}
        <RevealOnScroll className="mb-16">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h2 className="text-2xl font-semibold mb-4">Element Animations</h2>
            <p className="text-gray-300 mb-4">
              Select an animation preset to see it in action:
            </p>
            
            {/* Animation Controls */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
              {animationPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSelectedAnimation(preset)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedAnimation === preset
                      ? "bg-purple-500 text-white"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Animation Demo */}
            <div className="flex justify-center">
              <AnimatedElement 
                key={selectedAnimation} // Force re-render for animation
                preset={selectedAnimation}
                className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-lg"
                hover
                tap
              >
                <div className="text-center">
                  <h3 className="text-xl font-semibold">{selectedAnimation} Animation</h3>
                  <p className="text-sm opacity-80">Hover and click me!</p>
                </div>
              </AnimatedElement>
            </div>
          </div>
        </RevealOnScroll>

        {/* Floating Elements */}
        <RevealOnScroll className="mb-16">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h2 className="text-2xl font-semibold mb-4">Floating Elements</h2>
            <div className="flex justify-center space-x-8">
              <FloatingElement intensity={15} speed={2}>
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  🌊
                </div>
              </FloatingElement>
              <FloatingElement intensity={20} speed={1.5}>
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                  ✨
                </div>
              </FloatingElement>
              <FloatingElement intensity={10} speed={3}>
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  🍃
                </div>
              </FloatingElement>
            </div>
          </div>
        </RevealOnScroll>

        {/* Pulse Elements */}
        <RevealOnScroll className="mb-16">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h2 className="text-2xl font-semibold mb-4">Pulse Elements</h2>
            <div className="flex justify-center space-x-8">
              <PulseElement scale={1.2} speed={1}>
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-2xl">
                  ❤️
                </div>
              </PulseElement>
              <PulseElement scale={1.15} speed={1.5}>
                <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center text-2xl">
                  ⭐
                </div>
              </PulseElement>
              <PulseElement scale={1.3} speed={0.8}>
                <div className="w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center text-2xl">
                  💎
                </div>
              </PulseElement>
            </div>
          </div>
        </RevealOnScroll>

        {/* Stagger Animation */}
        <RevealOnScroll className="mb-16">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h2 className="text-2xl font-semibold mb-4">Stagger Animation</h2>
            <StaggerContainer staggerDelay={0.1}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <AnimatedElement
                    key={item}
                    preset="slideUp"
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 rounded-lg text-center"
                  >
                    <div className="text-lg font-semibold">Item {item}</div>
                  </AnimatedElement>
                ))}
              </div>
            </StaggerContainer>
          </div>
        </RevealOnScroll>

        {/* Usage Examples */}
        <RevealOnScroll className="mb-16">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h2 className="text-2xl font-semibold mb-4">How to Use</h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="text-lg font-medium text-blue-400 mb-2">Particle Background:</h3>
                <pre className="bg-black/40 p-3 rounded text-green-400 overflow-x-auto">
{`import { ParticleBackground } from "./components/animations";

<ParticleBackground 
  preset="traffic" 
  className="fixed inset-0 z-0" 
/>`}
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-purple-400 mb-2">Animated Elements:</h3>
                <pre className="bg-black/40 p-3 rounded text-green-400 overflow-x-auto">
{`import { AnimatedElement } from "./components/animations";

<AnimatedElement 
  preset="bounce" 
  duration={0.8} 
  delay={0.2}
  hover
  tap
>
  <div>Your content here</div>
</AnimatedElement>`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium text-cyan-400 mb-2">Floating & Pulse:</h3>
                <pre className="bg-black/40 p-3 rounded text-green-400 overflow-x-auto">
{`import { FloatingElement, PulseElement } from "./components/animations";

<FloatingElement intensity={15} speed={2}>
  <div>Floating content</div>
</FloatingElement>

<PulseElement scale={1.2} speed={1}>
  <div>Pulsing content</div>
</PulseElement>`}
                </pre>
              </div>
            </div>
          </div>
        </RevealOnScroll>

        {/* Footer */}
        <RevealOnScroll>
          <div className="text-center py-8">
            <Typewriter 
              text="🎉 Easy to use, beautiful animations for your React app!"
              speed={0.02}
              className="text-lg text-gray-300"
            />
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
};

export default AnimationDemo; 