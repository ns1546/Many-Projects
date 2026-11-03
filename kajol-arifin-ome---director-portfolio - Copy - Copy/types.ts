
export interface Project {
  id: string;
  title: string;
  year: string;
  description: string;
  image: string;
  category: string;
}

export interface AnimationProps {
  delay?: number;
}

/**
 * Global type definitions for GSAP and ScrollTrigger.
 * These are added to the Window interface to resolve TypeScript errors
 * when accessing them globally.
 */
declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}
