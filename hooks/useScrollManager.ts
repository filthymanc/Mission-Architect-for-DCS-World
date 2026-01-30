import { useRef, useState, useEffect } from 'react';

export const useScrollManager = (dependency: any, isLoading: boolean) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  // Auto-Scroll Effect
  useEffect(() => {
    if (autoScrollEnabled && messagesEndRef.current) {
        // Use 'auto' (instant) if loading to prevent 'smooth' scroll lag from locking the UI
        const behavior = isLoading ? 'auto' : 'smooth';
        messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, [dependency, autoScrollEnabled, isLoading]);

  // Scroll Event Handler to detect user scrolling up
  const handleScroll = () => {
      if (scrollContainerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
          const distanceToBottom = scrollHeight - scrollTop - clientHeight;
          
          const stickThreshold = 100; // Distance to re-engage lock
          const breakThreshold = 200; // Distance to break lock

          const isAtBottom = distanceToBottom <= stickThreshold;
          
          if (isAtBottom && !autoScrollEnabled) {
              setAutoScrollEnabled(true);
          } else if (distanceToBottom > breakThreshold && autoScrollEnabled) {
              setAutoScrollEnabled(false);
          }
      }
  };

  const scrollToBottom = () => {
      setAutoScrollEnabled(true);
      setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);
  };

  return {
    messagesEndRef,
    scrollContainerRef,
    autoScrollEnabled,
    handleScroll,
    scrollToBottom
  };
};
