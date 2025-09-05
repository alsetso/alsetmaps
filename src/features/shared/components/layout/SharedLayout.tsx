'use client';

import { ReactNode } from 'react';
import { FloatingTopbar } from './FloatingTopbar';

interface SharedLayoutProps {
  children: ReactNode;
  showTopbar?: boolean;
  fullHeight?: boolean; // New prop to control full height layout
}

export function SharedLayout({ children, showTopbar = true, fullHeight = false }: SharedLayoutProps) {
  return (
    <div className={`relative w-full ${fullHeight ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {/* Floating Glass Topbar */}
      {showTopbar && <FloatingTopbar />}
      
      {/* Main Content */}
      <div className={showTopbar && !fullHeight ? 'pt-16' : fullHeight ? 'h-full' : ''}>
        {children}
      </div>
    </div>
  );
}
