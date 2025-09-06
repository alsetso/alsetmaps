'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronDownIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/features/authentication/components/AuthProvider';
import { EnhancedTopbarSearch } from '../EnhancedTopbarSearch';

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function FloatingTopbar() {
  const [isDark, setIsDark] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showSearchContainer, setShowSearchContainer] = useState(false);
  const { user, loading, signOut } = useAuth();

  // Debounced scroll handler for better performance
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    setIsDark(scrollY > 50);
  }, []);

  useEffect(() => {
    const debouncedScroll = debounce(handleScroll, 10);
    window.addEventListener('scroll', debouncedScroll);
    return () => window.removeEventListener('scroll', debouncedScroll);
  }, [handleScroll]);



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target) return;
      
      const target = event.target as Element;
      if (!target.closest('.user-dropdown')) {
        setShowUserDropdown(false);
      }
      if (!target.closest('.search-container')) {
        setShowSearchContainer(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (showMobileNav) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileNav]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserDropdown(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const closeMobileNav = () => {
    setShowMobileNav(false);
  };




  // Don't render while loading to avoid flash
  if (loading) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[9999] h-16">
        <div className={`
          w-full h-full px-4 sm:px-6 lg:px-8 
          backdrop-blur-xl border-b transition-all duration-500 ease-in-out
          ${isDark 
            ? 'bg-black/80 border-white/15 shadow-2xl' 
            : 'bg-white/95 border-gray-200/60 shadow-xl'
          }
        `}>
          <div className="flex items-center justify-between h-full">
            {/* Left: Navigation */}
            <div className="hidden xl:flex items-center space-x-4">
              <Link href="/buy">
                <button className={`
                  px-4 py-2 rounded-lg font-medium transition-all duration-300
                  hover:scale-105 active:scale-95
                  ${isDark 
                    ? 'text-white hover:bg-white/20' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}>
                  Buy
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button - Visible only on mobile */}
            <div className="xl:hidden">
              <button
                onClick={() => setShowMobileNav(true)}
                className={`
                  p-2.5 rounded-xl transition-all duration-300
                  hover:scale-110 active:scale-95
                  ${isDark 
                    ? 'hover:bg-white/20 text-white' 
                    : 'hover:bg-gray-100 text-gray-900'
                  }
                `}
                aria-label="Open mobile navigation"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>

            {/* Center: Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link href="/" className="flex items-center justify-center">
                <div className={`
                  p-2.5 rounded-xl transition-all duration-300
                  ${isDark 
                    ? 'hover:bg-white/10' 
                    : 'hover:bg-gray-100'
                  }
                `}>
                  <Image
                    src="/logo.svg"
                    alt="Alset"
                    width={120}
                    height={30}
                    priority
                    className="h-7 w-auto transition-transform duration-300 hover:scale-110"
                  />
                </div>
              </Link>
            </div>

            {/* Right: Search and User Section */}
            <div className="flex items-center space-x-3">
              {/* Search Icon */}
              <button
                onClick={() => setShowSearchContainer(!showSearchContainer)}
                className={`
                  p-2.5 rounded-xl transition-all duration-300
                  hover:scale-110 active:scale-95
                  ${isDark 
                    ? 'hover:bg-white/20 text-white' 
                    : 'hover:bg-gray-100 text-gray-900'
                  }
                `}
                aria-label="Open search"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>

              {user ? (
                <>
                  {/* Logged In User Dropdown */}
                  <div className="relative user-dropdown">
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className={`
                        flex items-center space-x-3 p-3 rounded-xl transition-all duration-300
                        hover:scale-105 active:scale-95 group
                        ${isDark 
                          ? 'hover:bg-white/20 text-white' 
                          : 'hover:bg-gray-100 text-gray-900'
                        }
                      `}
                      aria-label="User menu"
                      aria-expanded={showUserDropdown}
                    >
                      {/* User Avatar/Initials */}
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                        ${isDark 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-200 text-gray-700'
                        }
                      `}>
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      
                      <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* User Dropdown Menu */}
                    {showUserDropdown && (
                      <div className={`
                        absolute right-0 top-full mt-3 w-56 rounded-2xl shadow-2xl overflow-hidden
                        animate-in slide-in-from-top-2 duration-200 backdrop-blur-xl
                        ${isDark 
                          ? 'bg-black/80 border border-white/15' 
                          : 'bg-white/95 border border-gray-200/60'
                        }
                      `}>
                        <div className="py-3">
                          {/* User Info Section */}
                          <div className={`
                            px-4 py-3 border-b
                            ${isDark ? 'border-white/20' : 'border-gray-200'}
                          `}>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.email}
                            </div>
                          </div>
                          
                          <Link href="/dashboard">
                            <button className={`
                              w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-200
                              ${isDark 
                                ? 'text-white hover:bg-white/10' 
                                : 'text-gray-900'
                              }
                            `}>
                              Dashboard
                            </button>
                          </Link>
                          <Link href="/my-pins">
                            <button className={`
                              w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-200
                              ${isDark 
                                ? 'text-white hover:bg-white/10' 
                                : 'text-gray-900'
                              }
                            `}>
                              My Pins
                            </button>
                          </Link>
                          <Link href="/search-history">
                            <button className={`
                              w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-200
                              ${isDark 
                                ? 'text-white hover:bg-white/10' 
                                : 'text-gray-900'
                              }
                            `}>
                              Search History
                            </button>
                          </Link>

                          <Link href="/settings">
                            <button className={`
                              w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-white/10 transition-colors duration-200
                              ${isDark 
                                ? 'text-white' 
                                : 'text-gray-900'
                              }
                            `}>
                              Settings
                            </button>
                          </Link>
                          <div className={`
                            border-t my-1
                            ${isDark ? 'border-white/20' : 'border-gray-200'}
                          `} />
                          <button 
                            onClick={handleSignOut}
                            className={`
                              w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors duration-200
                            `}>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Sign In Button for Non-Logged In Users */
                <Link href="/login">
                  <button className={`
                    px-6 py-2.5 rounded-xl font-semibold transition-all duration-300
                    hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl
                    bg-blue-600 hover:bg-blue-700 text-white
                  `}>
                    Sign In
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Container */}
      {showSearchContainer && (
        <EnhancedTopbarSearch
          isDark={isDark}
          onClose={() => setShowSearchContainer(false)}
          onPinCreated={() => {
            // Optionally refresh pins or perform other actions
            console.log('Pin created from topbar search');
          }}
        />
      )}

      {/* Mobile Navigation Overlay */}
      {showMobileNav && (
        <div className={`fixed inset-0 z-[10000] backdrop-blur-xl transition-all duration-500 ${
          isDark ? 'bg-black/95' : 'bg-white/95'
        }`}>
          {/* Close Button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={closeMobileNav}
              className={`p-3 rounded-full transition-all duration-300 ${
                isDark 
                  ? 'bg-white/10 text-white hover:bg-white/20' 
                  : 'bg-gray-900/10 text-gray-900 hover:bg-gray-900/20'
              }`}
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
          </div>

          {/* Navigation Content */}
          <div className="flex flex-col items-center justify-center h-full px-6">
            {/* Logo */}
            <div className="mb-12">
              <Image
                src="/logo.svg"
                alt="Alset"
                width={200}
                height={50}
                className="h-12 w-auto"
              />
            </div>

            {/* Navigation */}
            <div className="w-full max-w-md space-y-6">
              <Link href="/buy" onClick={closeMobileNav}>
                <button className={`w-full py-4 px-6 text-lg font-medium rounded-xl border transition-all duration-300 ${
                  isDark 
                    ? 'border-white/20 text-white hover:bg-white/10' 
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}>
                  Buy Properties
                </button>
              </Link>
            </div>

            {/* User Actions */}
            <div className="mt-12 w-full max-w-md">
              {user ? (
                <div className="space-y-4">
                  <Link href="/dashboard" onClick={closeMobileNav}>
                    <button className={`w-full py-4 px-6 text-lg font-medium rounded-xl border transition-all duration-300 ${
                      isDark
                        ? 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30'
                        : 'bg-gray-900/10 text-gray-900 border-gray-900/20 hover:bg-gray-900/20 hover:border-gray-900/30'
                    }`}>
                      Dashboard
                    </button>
                  </Link>
                  <button 
                    onClick={() => {
                      handleSignOut();
                      closeMobileNav();
                    }}
                    className={`w-full py-4 px-6 text-lg font-medium rounded-xl border transition-all duration-300 ${
                      isDark
                        ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30 hover:border-red-500/40'
                        : 'bg-red-500/20 text-red-600 border-red-500/30 hover:bg-red-500/30 hover:border-red-500/40'
                    }`}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link href="/login" onClick={closeMobileNav}>
                  <button className={`w-full py-4 px-6 text-lg font-medium rounded-xl transition-all duration-300 ${
                    isDark
                      ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25'
                  }`}>
                    Sign In
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
