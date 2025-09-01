"use client";

import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { SearchHistoryDisplay } from '@/features/property-management/components/SearchHistoryDisplay';
import { ClockIcon } from '@heroicons/react/24/outline';

export default function SearchHistoryPage() {
  return (
    <SharedLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <ClockIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Search History</h1>
                <p className="mt-2 text-gray-600">
                  Track your address searches and see which properties you've researched
                </p>
              </div>
            </div>
          </div>

          {/* Search History Display */}
          <div className="bg-white shadow rounded-lg p-6">
            <SearchHistoryDisplay />
          </div>
        </div>
      </div>
    </SharedLayout>
  );
}
