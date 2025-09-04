import React from 'react';
// useSearchHistory hook removed - will be reimplemented later
import { SearchHistory } from '../types';
import { Button } from '@/features/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Badge } from '@/features/shared/components/ui/badge';
import { Trash2, RefreshCw, MapPin, Calendar, User } from 'lucide-react';

interface SearchHistoryDisplayProps {
  maxItems?: number;
  showActions?: boolean;
  onSearchSelect?: (search: SearchHistory) => void;
}

export const SearchHistoryDisplay: React.FC<SearchHistoryDisplayProps> = ({
  maxItems = 10,
  showActions = true,
  onSearchSelect
}) => {
  // Hook removed - will be reimplemented later
  const searchHistory: SearchHistory[] = [];
  const loading = false;
  const error = null;
  const deleteSearch = async (_id: string) => console.log('Delete not yet implemented');
  const clearSearchHistory = async () => console.log('Clear not yet implemented');
  const refresh = () => console.log('Refresh not yet implemented');

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this search from your history?')) {
      await deleteSearch(id);
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all search history? This action cannot be undone.')) {
      await clearSearchHistory();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateAddress = (address: string, maxLength: number = 40) => {
    return address.length > maxLength ? `${address.substring(0, maxLength)}...` : address;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading search history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading search history: {error}</p>
            <Button onClick={refresh} variant="outline" className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (searchHistory.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No search history yet</p>
            <p className="text-sm">Your property searches will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayHistory = searchHistory.slice(0, maxItems);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Search History</CardTitle>
        <div className="flex space-x-2">
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {showActions && searchHistory.length > 0 && (
            <Button onClick={handleClearAll} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayHistory.map((search) => (
          <div
            key={search.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onSearchSelect?.(search)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <p className="font-medium text-gray-900 truncate">
                  {truncateAddress(search.search_address)}
                </p>
                {search.latitude && search.longitude && (
                  <Badge variant="secondary" className="text-xs">
                    Has Coordinates
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(search.created_at)}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>{search.user_id ? 'Signed In' : 'Anonymous'}</span>
                </div>
                
                {search.search_type && (
                  <Badge variant="outline" className="text-xs">
                    {search.search_type}
                  </Badge>
                )}
              </div>
              
              {search.normalized_address && search.normalized_address !== search.search_address && (
                <p className="text-xs text-gray-400 mt-1">
                  Normalized: {truncateAddress(search.normalized_address, 35)}
                </p>
              )}
            </div>
            
            {showActions && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(search.id);
                }}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        {searchHistory.length > maxItems && (
          <div className="text-center pt-2">
            <p className="text-sm text-gray-500">
              Showing {maxItems} of {searchHistory.length} searches
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
