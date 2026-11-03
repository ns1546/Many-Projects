
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
      // Fix: Using imported gsap instead of window.gsap
      gsap.fromTo(el,
        { x: '-100%', opacity: 0 },
        {
          x: '0%',
          opacity: 1,
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            end: "center center",
            scrub: 1.5,
            toggleActions: "play reverse play reverse"
          }
        }
      );
    });

    rightElements?.forEach(el => {
      // Fix: Using imported gsap instead of window.gsap
      gsap.fromTo(el,
        { x: '100%', opacity: 0 },
        {
          x: '0%',
          opacity: 1,
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            end: "center center",
            scrub: 1.5,
            toggleActions: "play reverse play reverse"
          }
        }
      );
    });
  }, []);

  return (
    <div ref={containerRef} id={id} className={`py-24 px-6 md:px-24 overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export default SectionWrapper;
