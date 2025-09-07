'use client';

import Link from 'next/link';
import { TopBar } from './components/TopBar';
import { Footer } from './components/Footer';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [currentWord, setCurrentWord] = useState('Handled');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentWord(prev => prev === 'Handled' ? 'Discreet' : 'Handled');
        setIsVisible(true);
      }, 300);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <TopBar showSearchByDefault={false} showSearchIcon={false} />
      
      {/* Hero Section */}
      <div className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-5">
          {/* Floating Map Pins */}
          <div className="absolute top-20 left-10 animate-float">
            <div className="w-4 h-4 bg-emerald-600 rounded-full border-2 border-white shadow-lg"></div>
          </div>
          <div className="absolute top-40 right-20 animate-float-delay">
            <div className="w-4 h-4 bg-emerald-600 rounded-full border-2 border-white shadow-lg"></div>
          </div>
          <div className="absolute bottom-32 left-1/4 animate-float-delay-2">
            <div className="w-4 h-4 bg-emerald-600 rounded-full border-2 border-white shadow-lg"></div>
          </div>
          
          {/* Typing Address Lines */}
          <div className="absolute top-32 right-1/3 animate-typewriter">
            <div className="bg-gray-200 h-1 w-24 rounded"></div>
          </div>
          <div className="absolute bottom-40 left-1/3 animate-typewriter-delay">
            <div className="bg-gray-200 h-1 w-32 rounded"></div>
          </div>
          
          {/* House Icons */}
          <div className="absolute top-1/3 left-1/6 animate-bounce-slow">
            <div className="text-emerald-600 text-2xl">🏠</div>
          </div>
          <div className="absolute bottom-1/4 right-1/6 animate-bounce-slow-delay">
            <div className="text-emerald-600 text-2xl">🏢</div>
          </div>
          
          {/* Search Magnifying Glass */}
          <div className="absolute top-1/2 right-10 animate-pulse-slow">
            <div className="text-emerald-600 text-xl">🔍</div>
          </div>
          
          {/* Dollar Sign */}
          <div className="absolute bottom-1/3 left-10 animate-pulse-slow-delay">
            <div className="text-emerald-600 text-xl">💰</div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Real Estate,{' '}
            <span 
              className={`transition-all duration-300 ${
                currentWord === 'Handled' ? 'text-emerald-600' : 'text-red-600'
              } ${
                isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'
              }`}
            >
              {currentWord}
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto animate-fade-in-up">
            Our team finds buyers their dream properties and ensures sellers get fair prices. Sit back while we do the work.
          </p>
          
          {/* Simple CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delay">
            <Link 
              href="/buy"
              className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Buy
            </Link>
            <Link 
              href="/sell"
              className="bg-red-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Sell
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes typewriter {
          0% {
            width: 0;
          }
          50% {
            width: 100%;
          }
          100% {
            width: 0;
          }
        }
        
        @keyframes bounceSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes pulseSlow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .animate-fade-in-up-delay {
          animation: fadeInUp 0.8s ease-out 0.3s both;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delay {
          animation: float 3s ease-in-out infinite 1s;
        }
        
        .animate-float-delay-2 {
          animation: float 3s ease-in-out infinite 2s;
        }
        
        .animate-typewriter {
          animation: typewriter 4s ease-in-out infinite;
        }
        
        .animate-typewriter-delay {
          animation: typewriter 4s ease-in-out infinite 2s;
        }
        
        .animate-bounce-slow {
          animation: bounceSlow 2s ease-in-out infinite;
        }
        
        .animate-bounce-slow-delay {
          animation: bounceSlow 2s ease-in-out infinite 1s;
        }
        
        .animate-pulse-slow {
          animation: pulseSlow 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow-delay {
          animation: pulseSlow 3s ease-in-out infinite 1.5s;
        }
      `}</style>
    </div>
  );
}