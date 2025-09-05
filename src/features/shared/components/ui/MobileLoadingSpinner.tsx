import React from 'react';
import { useMobileOptimizations } from '../../hooks/useMobileOptimizations';

interface MobileLoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const MobileLoadingSpinner: React.FC<MobileLoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md',
  fullScreen = true,
}) => {
  const { isMobile, isTablet } = useMobileOptimizations();

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const containerClasses = fullScreen
    ? 'min-h-screen bg-gray-50 flex items-center justify-center'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="text-center space-y-4">
        {/* Spinner */}
        <div className="flex justify-center">
          <div
            className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}
          />
        </div>
        
        {/* Loading message */}
        <div className="space-y-2">
          <p className={`text-gray-600 ${textSizeClasses[size]}`}>
            {message}
          </p>
          
          {/* Mobile-specific loading tips */}
          {isMobile && (
            <div className="text-xs text-gray-500 max-w-xs mx-auto">
              <p>💡 Tip: You can tap sections to expand them</p>
            </div>
          )}
          
          {isTablet && (
            <div className="text-xs text-gray-500 max-w-sm mx-auto">
              <p>💡 Tip: Use the sidebar for quick access to property details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Skeleton loader for mobile
export const MobileSkeletonLoader: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="bg-white rounded-lg p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-3">
        {Array.from({ length: isMobile ? 3 : 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Mobile-optimized error component
export const MobileErrorDisplay: React.FC<{
  error: string;
  onRetry?: () => void;
  isMobile?: boolean;
}> = ({ error, onRetry, isMobile = false }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-6xl">😞</div>
        <h1 className="text-xl font-bold text-gray-900">
          {isMobile ? 'Oops!' : 'Something went wrong'}
        </h1>
        <p className="text-gray-600 text-sm">
          {error}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        )}
        {isMobile && (
          <p className="text-xs text-gray-500">
            💡 Check your internet connection and try again
          </p>
        )}
      </div>
    </div>
  );
};
