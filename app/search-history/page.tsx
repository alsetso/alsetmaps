"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/authentication/components/AuthProvider';
import { PropertySearchService } from '@/features/property-search/services/property-search-service';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { Card, CardContent, CardHeader } from '@/features/shared/components/ui/card';
import { Badge } from '@/features/shared/components/ui/badge';
import { Button } from '@/features/shared/components/ui/button';
import { Loader2, Search, MapPin, Calendar, CreditCard, RefreshCw, MapPinIcon, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SearchHistoryRecord {
  id: string;
  search_address: string;
  search_type: 'basic' | 'smart';
  credits_used: number;
  created_at: string;
  smart_data?: any;
}

interface AccountData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function SearchHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [searchHistory, setSearchHistory] = useState<SearchHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [droppingPin, setDroppingPin] = useState<string | null>(null);
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load account data when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      loadAccountData();
      loadSearchHistory();
    }
  }, [user, authLoading]);

  const loadAccountData = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingAccount(true);
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading account data:', error);
        setError('Failed to load account data');
        return;
      }

      setAccountData(data);
    } catch (error) {
      console.error('Error loading account data:', error);
      setError('Failed to load account data');
    } finally {
      setLoadingAccount(false);
    }
  };

  const loadSearchHistory = async () => {
    try {
      setLoading(true);
      const history = await PropertySearchService.getSearchHistory();
      setSearchHistory(history);
    } catch (error) {
      console.error('Error loading search history:', error);
      setError('Failed to load search history');
    } finally {
      setLoading(false);
    }
  };

  const handleDropPin = async (searchRecord: SearchHistoryRecord) => {
    if (!searchRecord.smart_data?.zillowData?.latitude || !searchRecord.smart_data?.zillowData?.longitude) {
      alert('This search doesn\'t have location coordinates. Only smart searches with Zillow data can have pins dropped.');
      return;
    }

    if (!accountData?.id) {
      alert('Account data not loaded. Please refresh the page and try again.');
      return;
    }

    setDroppingPin(searchRecord.id);
    
    try {
      // Simple pin creation with user_id
      const pinData = {
        search_history_id: searchRecord.id,
        latitude: searchRecord.smart_data.zillowData.latitude,
        longitude: searchRecord.smart_data.zillowData.longitude,
        user_id: accountData.id
      };


      const response = await fetch('/api/pins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pinData),
      });


      if (response.ok) {
        const result = await response.json();
        alert(`Pin dropped successfully! Pin ID: ${result.id}`);
        
        // Optionally refresh the page or update UI
        await loadSearchHistory();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('Pin creation failed:', errorData);
        alert(`Failed to drop pin: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error dropping pin:', error);
      alert('Failed to drop pin. Please try again.');
    } finally {
      setDroppingPin(null);
    }
  };

  const canDropPin = (record: SearchHistoryRecord) => {
    return record.search_type === 'smart' && 
           record.smart_data?.zillowData?.latitude && 
           record.smart_data?.zillowData?.longitude;
  };

  // Filter search history based on search query
  const filteredSearchHistory = searchHistory.filter(record =>
    record.search_address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (authLoading || loadingAccount) {
    return (
      <SharedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </SharedLayout>
    );
  }

  if (!user) {
    return (
      <SharedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-4">Please log in to view your search history.</p>
            <Button>
              <a href="/login">Go to Login</a>
            </Button>
          </div>
        </div>
      </SharedLayout>
    );
  }

  // Calculate stats
  const totalSearches = searchHistory.length;
  const basicSearches = searchHistory.filter(r => r.search_type === 'basic').length;
  const smartSearches = searchHistory.filter(r => r.search_type === 'smart').length;
  const totalCreditsUsed = searchHistory.reduce((sum, r) => sum + r.credits_used, 0);

  return (
    <SharedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search History</h1>
          <p className="text-gray-600">Track your property searches and manage your pins</p>
          
          {/* Search Input */}
          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-600">
                Showing {filteredSearchHistory.length} of {searchHistory.length} searches
              </p>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Searches</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSearches}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Basic Searches</p>
                  <p className="text-2xl font-bold text-gray-900">{basicSearches}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Smart Searches</p>
                  <p className="text-2xl font-bold text-gray-900">{smartSearches}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Credits Used</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCreditsUsed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search History List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadSearchHistory} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filteredSearchHistory.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {searchQuery ? (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No matching searches</h3>
                    <p className="text-gray-600 mb-4">No searches found matching "{searchQuery}". Try a different search term.</p>
                    <Button onClick={clearSearch} variant="outline">
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No searches yet</h3>
                    <p className="text-gray-600 mb-4">Start searching for properties to see your history here.</p>
                    <Button>
                      <a href="/">Start Searching</a>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredSearchHistory.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {record.search_address}
                        </h3>
                        <Badge variant={record.search_type === 'smart' ? 'default' : 'secondary'}>
                          {record.search_type === 'smart' ? 'Smart' : 'Basic'}
                        </Badge>
                        {record.credits_used > 0 && (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            💳 {record.credits_used} Credit{record.credits_used !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(record.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{record.search_type === 'smart' ? 'Enhanced Data' : 'Basic Info'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Drop Pin Button */}
                    <div className="ml-4">
                      {canDropPin(record) ? (
                        <Button
                          onClick={() => handleDropPin(record)}
                          disabled={droppingPin === record.id}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          {droppingPin === record.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MapPinIcon className="h-4 w-4" />
                          )}
                          <span>{droppingPin === record.id ? 'Dropping...' : 'Drop Pin'}</span>
                        </Button>
                      ) : (
                        <div className="text-xs text-gray-400 text-center">
                          {record.search_type === 'basic' ? 'Basic searches can\'t have pins' : 'No coordinates available'}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {record.search_type === 'smart' && record.smart_data?.zillowData && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Smart Search Data:</h4>
                      <div className="bg-white p-3 rounded border overflow-auto max-h-40">
                        <pre className="text-xs text-gray-800">
                          {JSON.stringify(record.smart_data.zillowData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </SharedLayout>
  );
}
