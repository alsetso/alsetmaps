import { useState, useEffect, useCallback } from 'react';

interface MobileOptimizations {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  hasTouch: boolean;
  isOnline: boolean;
}

export const useMobileOptimizations = () => {
  const [optimizations, setOptimizations] = useState<MobileOptimizations>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait',
    hasTouch: false,
    isOnline: true,
  });

  const updateOptimizations = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    setOptimizations({
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      screenWidth: width,
      screenHeight: height,
      orientation: width > height ? 'landscape' : 'portrait',
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      isOnline: navigator.onLine,
    });
  }, []);

  useEffect(() => {
    updateOptimizations();
    
    window.addEventListener('resize', updateOptimizations);
    window.addEventListener('orientationchange', updateOptimizations);
    window.addEventListener('online', updateOptimizations);
    window.addEventListener('offline', updateOptimizations);
    
    return () => {
      window.removeEventListener('resize', updateOptimizations);
      window.removeEventListener('orientationchange', updateOptimizations);
      window.removeEventListener('online', updateOptimizations);
      window.removeEventListener('offline', updateOptimizations);
    };
  }, [updateOptimizations]);

  return optimizations;
};

// Hook for mobile-specific interactions
export const useMobileInteractions = () => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const isLeftSwipe = deltaX > 50;
    const isRightSwipe = deltaX < -50;
    const isUpSwipe = deltaY > 50;
    const isDownSwipe = deltaY < -50;

    return {
      isLeftSwipe,
      isRightSwipe,
      isUpSwipe,
      isDownSwipe,
      deltaX,
      deltaY,
    };
  }, [touchStart, touchEnd]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};

// Hook for mobile share functionality
export const useMobileShare = () => {
  const share = useCallback(async (data: {
    title: string;
    text: string;
    url: string;
  }) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return { success: true, method: 'native' };
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Share failed:', error);
        }
        return { success: false, method: 'native', error };
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(data.url);
        return { success: true, method: 'clipboard' };
      } catch (error) {
        console.error('Clipboard fallback failed:', error);
        return { success: false, method: 'clipboard', error };
      }
    }
  }, []);

  const canShare = useCallback(() => {
    return navigator.share !== undefined;
  }, []);

  return {
    share,
    canShare,
  };
};

// Hook for mobile viewport management
export const useMobileViewport = () => {
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);

    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);

  return {
    viewportHeight,
    isViewportHeight: (height: number) => viewportHeight <= height,
  };
};
