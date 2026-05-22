import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  glass = true,
  hover = false
}) => {
  const glassStyles = glass ? "glass-card" : "bg-slate-900 border border-slate-800";
  const hoverStyles = hover ? "hover:scale-[1.02] hover:border-blue-500/30 transition-all duration-300 cursor-pointer" : "";

  return (
    <div className={`rounded-2xl p-6 ${glassStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
