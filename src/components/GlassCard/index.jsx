
import React from 'react';

const GlassCard = ({ children, className = "" }) => {
  return (
    <div className={`backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/20 ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
