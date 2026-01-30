import { useEffect, useRef } from 'react';

/**
 * Traps focus within a container for accessibility.
 * - Cycles focus with Tab / Shift+Tab.
 * - Restores focus to the previously active element on unmount/close.
 * - Focuses the first interactive element on mount.
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive) {
      // 1. Capture the element that had focus before the modal opened
      previousFocusRef.current = document.activeElement as HTMLElement;

      const focusableQuery = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        if (!containerRef.current) return;

        const focusableElements = containerRef.current.querySelectorAll(focusableQuery);
        if (focusableElements.length === 0) {
            e.preventDefault();
            return;
        }

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          // Shift + Tab: If on first, wrap to last
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: If on last, wrap to first
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      // 2. Initial Focus: Delay slightly to allow render to complete
      setTimeout(() => {
          if (containerRef.current) {
              const focusableElements = containerRef.current.querySelectorAll(focusableQuery);
              if (focusableElements.length > 0) {
                  (focusableElements[0] as HTMLElement).focus();
              } else {
                  // Fallback: Focus the container itself if no inputs exist
                  containerRef.current.focus();
              }
          }
      }, 50);

      // Cleanup
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        // 3. Restore Focus
        if (previousFocusRef.current) {
            previousFocusRef.current.focus();
        }
      };
    }
  }, [isActive]);

  return containerRef;
};