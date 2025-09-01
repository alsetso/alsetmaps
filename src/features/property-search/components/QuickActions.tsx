'use client';

import { useState } from 'react';
import { HeartIcon, ClockIcon, PhoneIcon, CalendarIcon, DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  image: string;
  propertyType: string;
}

interface SearchCriteria {
  location: string;
  propertyType: string;
  priceRange: [number, number];
  beds: string;
  baths: string;
}

interface QuickActionsProps {
  savedProperties: Property[];
  recentSearches: SearchCriteria[];
  onSearch: (criteria: SearchCriteria) => void;
}

export function QuickActions({ savedProperties, recentSearches, onSearch }: QuickActionsProps) {
  const [activeTab, setActiveTab] = useState<'saved' | 'recent' | 'actions'>('saved');

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price}`;
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'preapproval':
        console.log('Get pre-approved');
        break;
      case 'agent':
        console.log('Contact agent');
        break;
      case 'viewing':
        console.log('Schedule viewing');
        break;
      case 'calculator':
        console.log('Mortgage calculator');
        break;
      default:
        break;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
            activeTab === 'saved'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <HeartIcon className="h-4 w-4 inline mr-2" />
          Saved ({savedProperties.length})
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
            activeTab === 'recent'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ClockIcon className="h-4 w-4 inline mr-2" />
          Recent
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
            activeTab === 'actions'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserIcon className="h-4 w-4 inline mr-2" />
          Actions
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'saved' && (
          <div className="p-4">
            {savedProperties.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <HeartIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No saved properties yet</p>
                <p className="text-xs text-gray-400">Click the heart icon on properties to save them</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedProperties.map((property) => (
                  <div
                    key={property.id}
                    className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={property.image}
                        alt={property.address}
                        className="w-16 h-12 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {property.address}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {property.city}, {property.state}
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {formatPrice(property.price)}
                        </p>
                        <div className="mt-1 text-xs text-gray-600">
                          {property.beds} bed{property.beds !== 1 ? 's' : ''} • {property.baths} bath{property.baths !== 1 ? 's' : ''} • {property.sqft.toLocaleString()} sq ft
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="p-4">
            {recentSearches.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No recent searches</p>
                <p className="text-xs text-gray-400">Your search history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => onSearch(search)}
                    className="w-full text-left bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {search.location}
                        </p>
                        <p className="text-xs text-gray-500">
                          {search.propertyType !== 'all' ? search.propertyType : 'All types'} • 
                          {search.beds !== 'any' ? ` ${search.beds}+ beds` : ''} • 
                          {search.baths !== 'any' ? ` ${search.baths}+ baths` : ''}
                        </p>
                      </div>
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickAction('preapproval')}
                className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                <DocumentTextIcon className="h-6 w-6 text-blue-600 mb-2" />
                <span className="text-xs font-medium text-blue-900">Get Pre-approved</span>
              </button>
              
              <button
                onClick={() => handleQuickAction('agent')}
                className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
              >
                <PhoneIcon className="h-6 w-6 text-green-600 mb-2" />
                <span className="text-xs font-medium text-green-900">Contact Agent</span>
              </button>
              
              <button
                onClick={() => handleQuickAction('viewing')}
                className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
              >
                <CalendarIcon className="h-6 w-6 text-purple-600 mb-2" />
                <span className="text-xs font-medium text-purple-900">Schedule Viewing</span>
              </button>
              
              <button
                onClick={() => handleQuickAction('calculator')}
                className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors duration-200"
              >
                <DocumentTextIcon className="h-6 w-6 text-orange-600 mb-2" />
                <span className="text-xs font-medium text-orange-900">Mortgage Calc</span>
              </button>
            </div>
            
            {/* Additional Quick Actions */}
            <div className="mt-4 space-y-2">
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 text-sm">
                Set Up Property Alerts
              </button>
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 text-sm">
                Download Property Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
