import { MapIcon, MapPin, Star, Clock, TrendingUp } from 'lucide-react';
import { BasicSearchSuggestion } from '../services/basic-search-service';

interface BasicSearchSuggestionsProps {
  suggestions: BasicSearchSuggestion[];
  onSelect: (suggestion: BasicSearchSuggestion) => void;
  isLoading?: boolean;
  searchQuery: string;
}

export function BasicSearchSuggestions({ 
  suggestions, 
  onSelect, 
  isLoading = false,
  searchQuery 
}: BasicSearchSuggestionsProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2">
        <div className="flex items-center justify-center space-x-2 text-gray-500 py-2">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
          <span className="text-xs">Finding addresses...</span>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          onClick={() => onSelect(suggestion)}
          className="w-full px-3 py-2 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors text-sm"
        >
          <div className="text-gray-900 truncate">
            {suggestion.place_name}
          </div>
        </button>
      ))}
    </div>
  );
}
