import { MapIcon, MapPin, Star, Zap, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { SmartSearchSuggestion } from '../services/smart-search-service';

interface SmartSearchSuggestionsProps {
  suggestions: SmartSearchSuggestion[];
  onSelect: (suggestion: SmartSearchSuggestion) => void;
  isLoading?: boolean;
  searchQuery: string;
  activeField: string;
}

export function SmartSearchSuggestions({ 
  suggestions, 
  onSelect, 
  isLoading = false,
  searchQuery,
  activeField
}: SmartSearchSuggestionsProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
          <span className="text-sm">Analyzing address context...</span>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  // Highlight matching text in suggestions
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-purple-200 px-1 rounded font-medium">
          {part}
        </mark>
      ) : part
      );
  };

  // Get confidence color and icon
  const getConfidenceDisplay = (confidence: number) => {
    if (confidence >= 0.9) {
      return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, label: 'Excellent' };
    } else if (confidence >= 0.8) {
      return { color: 'text-blue-600', bg: 'bg-blue-100', icon: Star, label: 'Very Good' };
    } else if (confidence >= 0.7) {
      return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: MapIcon, label: 'Good' };
    } else {
      return { color: 'text-orange-600', bg: 'bg-orange-100', icon: AlertTriangle, label: 'Fair' };
    }
  };

  // Get relevance indicator
  const getRelevanceIndicator = (relevance: number) => {
    const percentage = Math.round(relevance * 100);
    return (
      <div className="flex items-center space-x-1">
        <div className="w-16 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-xs text-gray-600">{percentage}%</span>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
      <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">
              Smart Search Suggestions
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Shield className="h-3 w-3" />
            <span>AI-Powered</span>
          </div>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          Context-aware suggestions for {activeField} field
        </div>
      </div>
      
      {suggestions.map((suggestion, index) => {
        const confidenceDisplay = getConfidenceDisplay(suggestion.confidence || 0.7);
        const ConfidenceIcon = confidenceDisplay.icon;
        
        return (
          <button
            key={suggestion.id}
            onClick={() => onSelect(suggestion)}
            className="w-full px-4 py-3 text-left hover:bg-purple-50 border-b border-gray-100 last:border-b-0 transition-colors group"
          >
            <div className="flex items-start space-x-3">
              {/* Confidence Icon */}
              <div className="flex-shrink-0 mt-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${confidenceDisplay.bg}`}>
                  <ConfidenceIcon className={`h-4 w-4 ${confidenceDisplay.color}`} />
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Primary Address */}
                <div className="font-medium text-gray-900 mb-1">
                  {highlightText(suggestion.text, searchQuery)}
                </div>
                
                {/* Full Address */}
                <div className="text-sm text-gray-600 mb-2">
                  {highlightText(suggestion.place_name, searchQuery)}
                </div>
                
                {/* Confidence and Relevance */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${confidenceDisplay.color}`}>
                      {confidenceDisplay.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({Math.round((suggestion.confidence || 0.7) * 100)}% confidence)
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Relevance: {getRelevanceIndicator(suggestion.relevance || 0.7)}
                  </div>
                </div>
                
                {/* Context Information */}
                {suggestion.context.length > 0 && (
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    {suggestion.context.slice(0, 3).map((ctx, ctxIndex) => (
                      <div key={ctxIndex} className="flex items-center space-x-1">
                        <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
                        <span>{ctx.text}</span>
                        {ctx.short_code && (
                          <span className="bg-purple-200 px-1 rounded text-xs text-purple-700">
                            {ctx.short_code}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Action Indicator */}
              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center">
                  <Zap className="h-3 w-3" />
                </div>
              </div>
            </div>
            
            {/* Smart Search Features on Hover */}
            <div className="mt-2 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Click to parse into individual fields</span>
                <div className="flex items-center space-x-2">
                  <span className="flex items-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>Smart Parse</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Zap className="h-3 w-3" />
                    <span>1 Credit</span>
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
      
      {/* Footer with Smart Search Info */}
      <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border-t border-gray-100">
        <div className="text-xs text-gray-600 text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Zap className="h-3 w-3 text-purple-600" />
            <span className="font-medium">Smart Search Features:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Advanced parsing</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3 text-blue-600" />
              <span>Context awareness</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
