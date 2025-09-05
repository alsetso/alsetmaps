'use client';

import { MapboxMap } from '@/features/property-search/components/MapboxMap';

export default function TestEnvPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enhanced Topbar Search Demo
          </h1>
          <p className="text-gray-600">
            The enhanced search functionality is now integrated into the topbar. Use the search icon in the top navigation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Enhanced Topbar Search</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">How to Use</h3>
                  <p className="text-sm text-blue-700">
                    Click the search icon in the top navigation bar to access the enhanced search functionality.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Features</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Mapbox geocoding suggestions</li>
                    <li>• Basic vs Smart search toggle</li>
                    <li>• Direct pin creation</li>
                    <li>• Success states and navigation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Map Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Interactive Map</h2>
              <div className="h-96 rounded-lg overflow-hidden">
                <MapboxMap 
                  lat={37.7749} 
                  lng={-122.4194} 
                  zoom={10}
                  className="w-full h-full"
                />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>• Search for an address using the smart search above</p>
                <p>• The map will automatically fly to the selected location</p>
                <p>• A pin will be dropped at the selected address</p>
                <p>• Old pins are automatically removed when new ones are added</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Enhanced Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Smart Address Suggestions</h3>
              <p className="text-sm text-blue-700">
                Real-time Mapbox geocoding with address suggestions positioned below the input field
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Map Integration</h3>
              <p className="text-sm text-green-700">
                Smooth map animations with automatic pin placement and location highlighting
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">Search History</h3>
              <p className="text-sm text-purple-700">
                Automatic recording of all searches with credit tracking for smart searches
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-medium text-orange-900 mb-2">Pin Management</h3>
              <p className="text-sm text-orange-700">
                Automatic removal of old pins when new addresses are searched
              </p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-medium text-indigo-900 mb-2">Credit System</h3>
              <p className="text-sm text-indigo-700">
                Basic searches are free, smart searches consume 1 credit for enhanced insights
              </p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <h3 className="font-medium text-pink-900 mb-2">Enhanced UX</h3>
              <p className="text-sm text-pink-700">
                Debounced search, loading states, and visual feedback for better user experience
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
