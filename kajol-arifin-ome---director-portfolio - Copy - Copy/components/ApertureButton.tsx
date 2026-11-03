
import React from 'react';
import gsap from 'gsap';

interface ApertureButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
}

const ApertureButton: React.FC<ApertureButtonProps> = ({ label, onClick, className = "" }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Visual Click Feedback: Flash effect
    const btn = e.currentTarget;
    const flash = document.createElement('div');
    flash.className = 'absolute inset-0 bg-white opacity-50 z-20 pointer-events-none';
    btn.appendChild(flash);
    
    gsap.to(flash, {
      opacity: 0,
      duration: 0.4,
      onComplete: () => flash.remove()
    });

    // Vibration / Shaker effect
    gsap.fromTo(btn, { x: -2 }, { x: 2, duration: 0.05, repeat: 5, yoyo: true, onComplete: () => gsap.set(btn, { x: 0 }) });

    if (onClick) onClick();
  };

  return (
    <button 
      onClick={handleClick}
      className={`relative group px-10 py-4 bg-transparent text-white border border-white/20 overflow-hidden outline-none cursor-pointer ${className}`}
    >
      {/* Background Liquid Fill */}
      <div className="absolute inset-0 bg-red-600 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
      
      {/* Aperture Blades */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none z-10">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-white h-full w-[1px] left-1/2 origin-top"
            style={{ transform: `rotate(${i * 60}deg)` }}
          ></div>
        ))}
      </div>

      <span className="relative z-10 font-heading tracking-[0.2em] group-hover:scale-105 transition-transform duration-300 block uppercase text-sm">
        {label}
      </span>
    </button>
  );
};

export default ApertureButton;
