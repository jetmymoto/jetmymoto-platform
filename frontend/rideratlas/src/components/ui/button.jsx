import React from 'react';
export const Button = ({ children, onClick, className, variant, size }) => {
  let baseStyle = "inline-flex items-center justify-center rounded-full font-bold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
  
  // Variants
  if (variant === 'outline') baseStyle += " border border-input bg-transparent hover:bg-accent hover:text-accent-foreground";
  else if (variant === 'secondary') baseStyle += " bg-secondary text-secondary-foreground hover:bg-secondary/80";
  else if (variant === 'ghost') baseStyle += " hover:bg-accent hover:text-accent-foreground";
  else baseStyle += " bg-amber-500 text-black hover:bg-amber-600 shadow-md"; // Default

  // Sizes
  if (size === 'lg') baseStyle += " h-12 px-8 text-lg";
  else if (size === 'sm') baseStyle += " h-9 px-3 text-xs";
  else baseStyle += " h-10 py-2 px-4";

  return (
    <button onClick={onClick} className={`${baseStyle} ${className || ''}`}>
      {children}
    </button>
  );
};
