'use client';

import { ReactNode } from 'react';
import { FloatingTopbar } from './FloatingTopbar';

interface SharedLayoutProps {
  children: ReactNode;
  showTopbar?: boolean;
}

export function SharedLayout({ children, showTopbar = true }: SharedLayoutProps) {
  return (
    <div className="relative min-h-screen w-full">
      {/* Floating Glass Topbar */}
      {showTopbar && <FloatingTopbar />}
      
      {/* Main Content */}
      <div className={showTopbar ? 'pt-16' : ''}>
        {children}
      </div>
    </div>
  );
}
