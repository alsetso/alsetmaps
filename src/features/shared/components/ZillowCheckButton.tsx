'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  HomeIcon, 
  PhotoIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  MapPinIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface ZillowData {
  searchData: any;
  photosData: any;
  zpid: string;
}

interface ZillowCheckButtonProps {
  address: string;
  className?: string;
}

export function ZillowCheckButton({ address, className = '' }: ZillowCheckButtonProps) {
  const [loading, setLoading] = useState(false);
  const [zillowData, setZillowData] = useState<ZillowData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckZillow = async () => {
    if (!address) {
      setError('No address available to check');
      return;
    }

    setLoading(true);
    setError(null);
    setZillowData(null);

    try {
      const response = await fetch('/api/zillow-check', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch Zillow data');
      }

      const data = await response.json();
      setZillowData(data);
    } catch (error) {
      console.error('Error fetching Zillow data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch Zillow data');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: any) => {
    if (!price) return 'N/A';
    const numPrice = typeof price === 'string' ? parseInt(price.replace(/[^0-9]/g, '')) : price;
    return numPrice ? `$${numPrice.toLocaleString()}` : 'N/A';
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return date;
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Zillow Data</h3>
          <p className="text-sm text-gray-600">Check property information from Zillow</p>
        </div>
        <Button
          onClick={handleCheckZillow}
          disabled={loading || !address}
          className="flex items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Checking...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4" />
              <span>Check Zillow</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="mb-4 border-red-200">
          <CardContent className="pt-6">
            <div className="text-red-600 text-sm">
              Error: {error}
            </div>
          </CardContent>
        </Card>
      )}

      {zillowData && (
        <div className="space-y-4">
          {/* Search Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HomeIcon className="h-5 w-5" />
                <span>Property Information</span>
                <Badge variant="secondary">ZPID: {zillowData.zpid}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zillowData.searchData.zestimate && (
                  <div className="flex items-center space-x-2">
                    <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="text-sm font-medium">Zestimate</div>
                      <div className="text-lg font-bold text-green-600">
                        {formatPrice(zillowData.searchData.zestimate)}
                      </div>
                    </div>
                  </div>
                )}
                
                {zillowData.searchData.rentZestimate && (
                  <div className="flex items-center space-x-2">
                    <CurrencyDollarIcon className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium">Rent Zestimate</div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatPrice(zillowData.searchData.rentZestimate)}/mo
                      </div>
                    </div>
                  </div>
                )}

                {zillowData.searchData.bedrooms && (
                  <div className="flex items-center space-x-2">
                    <HomeIcon className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium">Bedrooms</div>
                      <div className="text-lg font-bold">{zillowData.searchData.bedrooms}</div>
                    </div>
                  </div>
                )}

                {zillowData.searchData.bathrooms && (
                  <div className="flex items-center space-x-2">
                    <HomeIcon className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium">Bathrooms</div>
                      <div className="text-lg font-bold">{zillowData.searchData.bathrooms}</div>
                    </div>
                  </div>
                )}

                {zillowData.searchData.squareFeet && (
                  <div className="flex items-center space-x-2">
                    <HomeIcon className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium">Square Feet</div>
                      <div className="text-lg font-bold">{zillowData.searchData.squareFeet}</div>
                    </div>
                  </div>
                )}

                {zillowData.searchData.yearBuilt && (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium">Year Built</div>
                      <div className="text-lg font-bold">{zillowData.searchData.yearBuilt}</div>
                    </div>
                  </div>
                )}

                {zillowData.searchData.lotSize && (
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium">Lot Size</div>
                      <div className="text-lg font-bold">{zillowData.searchData.lotSize}</div>
                    </div>
                  </div>
                )}

                {zillowData.searchData.lastSoldPrice && (
                  <div className="flex items-center space-x-2">
                    <CurrencyDollarIcon className="h-4 w-4 text-orange-600" />
                    <div>
                      <div className="text-sm font-medium">Last Sold Price</div>
                      <div className="text-lg font-bold text-orange-600">
                        {formatPrice(zillowData.searchData.lastSoldPrice)}
                      </div>
                    </div>
                  </div>
                )}

                {zillowData.searchData.lastSoldDate && (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium">Last Sold Date</div>
                      <div className="text-lg font-bold">{formatDate(zillowData.searchData.lastSoldDate)}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Raw Data (for debugging) */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
              View Raw API Response
            </summary>
            <Card className="mt-2">
              <CardContent className="pt-6">
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(zillowData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </details>
        </div>
      )}
    </div>
  );
}
