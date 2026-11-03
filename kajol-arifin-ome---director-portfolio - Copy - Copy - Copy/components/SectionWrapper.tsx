import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ children, id, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const leftElements = containerRef.current?.querySelectorAll('.animate-left');
    const rightElements = containerRef.current?.querySelectorAll('.animate-right');

    leftElements?.forEach(el => {
      gsap.fromTo(el,
        { x: '-100%', opacity: 0 },
        {
          x: '0%',
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    rightElements?.forEach(el => {
      gsap.fromTo(el,
        { x: '100%', opacity: 0 },
        {
          x: '0%',
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }, []);

  return (
    <div ref={containerRef} id={id} className={`py-24 px-6 md:px-24 overflow-hidden relative ${className}`}>
      {children}
    </div>
  );
};

export default SectionWrapper;
