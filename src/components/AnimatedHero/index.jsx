
import React, { useState, useEffect } from 'react';

const AnimatedHero = () => {
  const [currentText, setCurrentText] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const heroTexts = [
    "Welcome to Roar of south",
    "Discover Premium Products",
    "Experience Quality & Style",
    "Shop with Confidence"
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % heroTexts.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-32 lg:h-40 overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center">
      {/* Animated Background Circles */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-10 left-1/3 w-12 h-12 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-1/2 right-1/3 w-8 h-8 bg-white/10 rounded-full animate-float-delayed"></div>
      </div>
      
      {/* Animated Text */}
      <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2 animate-glow">
          {heroTexts[currentText]}
        </h1>
        <div className="w-24 h-1 bg-white/60 mx-auto rounded-full animate-pulse"></div>
      </div>
      
      {/* Animated Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedHero;
