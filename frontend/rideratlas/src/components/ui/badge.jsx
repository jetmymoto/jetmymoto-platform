import React from 'react';
export const Badge = ({ children, variant, className }) => {
  let baseStyle = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  if (variant === 'outline') baseStyle += " text-foreground";
  else if (variant === 'secondary') baseStyle += " border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80";
  else baseStyle += " border-transparent bg-amber-500 text-black hover:bg-amber-600";

  return (
    <div className={`${baseStyle} ${className || ''}`}>
      {children}
    </div>
  );
};
