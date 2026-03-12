import React from 'react';
import { X } from 'lucide-react';

const VideoModal = ({ videoUrl, onClose }) => {
  if (!videoUrl) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4" onClick={onClose}>
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-amber-500 transition-colors"
      >
        <X className="w-8 h-8" />
      </button>
      
      <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <video 
          src={videoUrl} 
          className="w-full h-full object-cover" 
          controls 
          autoPlay 
        />
      </div>
    </div>
  );
};

export default VideoModal;
