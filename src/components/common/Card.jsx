import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  glow = false,
  glowColor = 'primary', // primary, ai, commitment, alert
  onClick,
  ...props
}) => {
  const glowClasses = {
    primary: 'hover:border-primary/40 hover:shadow-glow-md',
    ai: 'hover:border-ai/40 hover:shadow-glow-ai',
    commitment: 'hover:border-emerald-500/40 hover:shadow-glow-commitment',
    alert: 'hover:border-amber-500/40',
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        hover
          ? 'glass-panel-interactive cursor-pointer'
          : 'glass-panel'
      } ${glow ? glowClasses[glowColor] : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
