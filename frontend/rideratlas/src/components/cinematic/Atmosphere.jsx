import React from 'react';

/**
 * Atmospheric overlay component to unify disparate sections
 * based on the Stitch visual language.
 */
export const Atmosphere = ({ variant = 'default' }) => {
  if (variant === 'hero') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-20">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/40 via-transparent to-[#050505]/40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(205,167,85,0.08)_0%,transparent_70%)] mix-blend-screen opacity-50" />
      </div>
    );
  }

  if (variant === 'section-fade') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#050505] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050505] to-transparent" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-0 opacity-30 mix-blend-overlay">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(205,167,85,0.05)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(205,167,85,0.05)_0%,transparent_50%)]" />
    </div>
  );
};
