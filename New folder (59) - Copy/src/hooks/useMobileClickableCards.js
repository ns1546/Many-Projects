import { useEffect } from 'react';
import { useIsMobile } from './useIsMobile';

export function useMobileClickableCards() {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) return;

    // We use touchstart/touchend for a faster, more native feel if needed,
    // but click is safer for React synthetic events.
    const handleGlobalClick = (e) => {
      // 1. Ignore if they already clicked an interactive element
      if (e.target.closest('button, input, select, textarea, a, [role="button"], .toggle-switch, .m-back-btn, .action-btn')) {
        return;
      }
      
      // 2. Find the closest logical "card" or "row"
      const container = e.target.closest('.godown-product-card, tr, .settings-item, .m-notif-item, .stat-card, .menu-item, .product-card, .ecommerce-card');
      if (!container) return;

      // 3. Find the primary action button inside
      // We prioritize .btn-primary, then .btn-secondary, then any button
      let actionBtn = container.querySelector('.btn-primary:not([disabled])');
      if (!actionBtn) actionBtn = container.querySelector('.btn-secondary:not([disabled])');
      if (!actionBtn) actionBtn = container.querySelector('button:not([disabled])');
      
      if (actionBtn) {
        // Prevent default to stop weird text selection or double firing if any
        e.preventDefault();
        
        // Visual native-app ripple/scale feedback
        const originalTransition = container.style.transition;
        const originalTransform = container.style.transform;
        const originalOpacity = container.style.opacity;
        
        container.style.transition = 'all 0.15s ease-out';
        container.style.transform = 'scale(0.97)';
        container.style.opacity = '0.6';
        
        // Wait for animation, then click
        setTimeout(() => {
          container.style.transform = originalTransform;
          container.style.opacity = originalOpacity;
          
          setTimeout(() => {
             container.style.transition = originalTransition;
             actionBtn.click();
          }, 50);
        }, 120);
      }
    };

    // Use capture phase to catch the click early, or just bubbling.
    // Bubbling is safer so we don't intercept actual React clicks prematurely.
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [isMobile]);
}
