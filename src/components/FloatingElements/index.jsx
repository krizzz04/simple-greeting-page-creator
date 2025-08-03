
import React from 'react';

const FloatingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Large Floating Shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-float blur-xl"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full animate-float-delayed blur-xl"></div>
      <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-full animate-float blur-xl"></div>
      <div className="absolute bottom-20 right-1/3 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full animate-float-delayed blur-xl"></div>
      
      {/* Small Floating Dots */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full animate-particle blur-sm"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${4 + Math.random() * 3}s`
          }}
        ></div>
      ))}
      
      {/* Animated Lines */}
      <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-shimmer"></div>
      <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-shimmer-delayed"></div>
    </div>
  );
};

export default FloatingElements;
