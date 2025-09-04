'use client';

import { useState, useEffect } from 'react';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { useAuth } from '@/features/authentication/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { Badge } from '@/features/shared/components/ui/badge';
import { 
  HomeIcon, 
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/integrations/supabase/client';

interface Pin {
  id: string;
  latitude: number;
  longitude: number;
  search_history: {
    search_address: string;
    search_type: string;
    created_at: string;
  };
}

interface Intent {
  id: string;
  intent_type: 'buy' | 'sell' | 'refinance' | 'loan';
  pin_id?: string;
  city?: string;
  state?: string;
  budget_min?: number;
  budget_max?: number;
  property_type?: string;
  timeline: string;
  created_at: string;
}

export default function BuyPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'submit' | 'intents'>('submit');
  const [userPins, setUserPins] = useState<Pin[]>([]);
  const [userIntents, setUserIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form state
  const [locationMethod, setLocationMethod] = useState<'pin' | 'city'>('pin');
  const [selectedPin, setSelectedPin] = useState<string>('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [timeline, setTimeline] = useState('flexible');

  useEffect(() => {
    if (user && !authLoading) {
      loadUserPins();
      loadUserIntents();
    }
  }, [user, authLoading]);

  const loadUserPins = async () => {
    try {
      console.log('🔍 Loading user pins...');
      console.log('Current user state:', user);
      console.log('Auth loading state:', authLoading);
      
      // Use client-side Supabase directly to avoid authentication issues
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Supabase session:', session);
      
      if (!session?.user) {
        console.log('No active session found');
        return;
      }

      // Get the user's account ID
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .single();

      if (accountError || !accountData) {
        console.error('Account lookup error:', accountError);
        return;
      }

      // Get user's pins with search history details
      const { data: pins, error: pinsError } = await supabase
        .from('pins')
        .select(`
          *,
          search_history:search_history(
            search_address,
            search_type,
            created_at
          )
        `)
        .eq('user_id', accountData.id)
        .order('created_at', { ascending: false });

      if (pinsError) {
        console.error('Error fetching pins:', pinsError);
        return;
      }

      console.log('📌 Loaded pins:', pins);
      console.log('📌 Pin structure example:', pins?.[0]);
      setUserPins(pins || []);
    } catch (error) {
      console.error('Error loading pins:', error);
    }
  };

  const loadUserIntents = async () => {
    try {
      const response = await fetch('/api/intents?type=buy');
      if (response.ok) {
        const data = await response.json();
        setUserIntents(data.intents || []);
      }
    } catch (error) {
      console.error('Error loading intents:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (locationMethod === 'pin' && !selectedPin) {
      alert('Please select a pin');
      return;
    }
    
    if (locationMethod === 'city' && (!city || !state)) {
      alert('Please enter city and state');
      return;
    }

    setLoading(true);
    
    try {
      const intentData = {
        intent_type: 'buy',
        pin_id: locationMethod === 'pin' ? selectedPin : undefined,
        city: locationMethod === 'city' ? city : undefined,
        state: locationMethod === 'city' ? state : undefined,
        budget_min: budgetMin ? parseInt(budgetMin) : undefined,
        budget_max: budgetMax ? parseInt(budgetMax) : undefined,
        property_type: propertyType || undefined,
        timeline
      };

      const response = await fetch('/api/intents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intentData)
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
        
        // Reset form
        setLocationMethod('pin');
        setSelectedPin('');
        setCity('');
        setState('');
        setBudgetMin('');
        setBudgetMax('');
        setPropertyType('');
        setTimeline('flexible');
        
        // Refresh intents
        await loadUserIntents();
      } else {
        const error = await response.json();
        alert(`Failed to create intent: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating intent:', error);
      alert('Failed to create intent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getLocationDisplay = (intent: Intent) => {
    if (intent.pin_id) {
      const pin = userPins.find(p => p.id === intent.pin_id);
      if (pin) {
        return pin.search_history?.search_address || `Pin at ${pin.latitude.toFixed(4)}, ${pin.longitude.toFixed(4)}`;
      }
      return 'Specific Property';
    }
    return `${intent.city}, ${intent.state}`;
  };

  if (authLoading) {
    return (
      <SharedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <p className="text-gray-600 mb-4">Please log in to submit buy intents.</p>
            <Button onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
          </div>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <HomeIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <MagnifyingGlassIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <StarIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Buy Property Intent
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Quickly submit your buying criteria by linking to existing property searches or specifying city-level preferences.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <MapPinIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Smart Location</h3>
                <p className="text-sm text-gray-600">Link to pins or city-level</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Quick Criteria</h3>
                <p className="text-sm text-gray-600">Budget & preferences</p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Fast Submission</h3>
                <p className="text-sm text-gray-600">Complete in under 2 minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex space-x-8">
              <button 
                onClick={() => setActiveTab('submit')} 
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'submit' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Submit New Intent
              </button>
              <button 
                onClick={() => setActiveTab('intents')} 
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'intents' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Buy Intents ({userIntents.length})
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {activeTab === 'submit' ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Success Message */}
              {showSuccess && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center text-green-800">
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      <span className="font-medium">Buy intent submitted successfully!</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Location Method Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-blue-600" />
                    Location Preference
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setLocationMethod('pin')}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        locationMethod === 'pin'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">I have a specific property</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Link to an existing property search/pin
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setLocationMethod('city')}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        locationMethod === 'city'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">I want city-level matching</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Get matched with properties in a city/area
                      </div>
                    </button>
                  </div>

                  {/* Pin Selection */}
                  {locationMethod === 'pin' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Property Pin
                      </label>
                      
                      {/* Pin Search/Filter */}
                      {userPins.length > 5 && (
                        <div className="mb-3">
                          <Input
                            placeholder="Search pins by address..."
                            className="w-full"
                            onChange={(e) => {
                              const searchTerm = e.target.value.toLowerCase();
                              const filteredPins = userPins.filter(pin => 
                                pin.search_history.search_address.toLowerCase().includes(searchTerm) ||
                                pin.search_history.search_type.toLowerCase().includes(searchTerm)
                              );
                              // Note: In a real implementation, you'd want to maintain filtered state
                            }}
                          />
                        </div>
                      )}
                      
                      {userPins.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                          <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 mb-2">No property pins found</p>
                          <p className="text-sm text-gray-500">
                            Search for properties first to create pins, or choose city-level matching above.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {userPins.map((pin) => (
                            <div
                              key={pin.id}
                              onClick={() => setSelectedPin(pin.id)}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                selectedPin === pin.id
                                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                <MapPinIcon className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-900">
                                  {pin.search_history?.search_address || `Pin at ${pin.latitude.toFixed(4)}, ${pin.longitude.toFixed(4)}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <BuildingOfficeIcon className="w-4 h-4" />
                                  {pin.search_history?.search_type || 'Unknown type'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ClockIcon className="w-4 h-4" />
                                  {pin.search_history?.created_at 
                                    ? new Date(pin.search_history.created_at).toLocaleDateString()
                                    : 'Unknown date'
                                  }
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Coordinates: {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
                              </div>
                                </div>
                                <div className="flex items-center">
                                  {selectedPin === pin.id && (
                                    <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* City/State Input */}
                  {locationMethod === 'city' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <Input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Enter city name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        <select
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select state</option>
                          {[
                            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
                            'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                            'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                            'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                            'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
                          ].map((stateCode) => (
                            <option key={stateCode} value={stateCode}>
                              {stateCode}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Criteria */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                    Quick Criteria
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Budget (Optional)
                      </label>
                      <Input
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        placeholder="$200,000"
                        type="number"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Budget
                      </label>
                      <Input
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        placeholder="$500,000"
                        type="number"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Property Type (Optional)
                      </label>
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Any type</option>
                        <option value="single-family">Single Family</option>
                        <option value="condo">Condo</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="multi-family">Multi-Family</option>
                        <option value="land">Land</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timeline
                      </label>
                      <select
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="asap">ASAP</option>
                        <option value="1-3months">1-3 Months</option>
                        <option value="3-6months">3-6 Months</option>
                        <option value="6-12months">6-12 Months</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="text-center">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="px-8 py-3 text-lg"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Buy Intent'}
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                  Your intent will be matched with relevant properties and agents.
                </p>
              </div>
            </form>
          ) : (
            /* Intents View */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">My Buy Intents</h2>
                <Button onClick={loadUserIntents} variant="outline">
                  Refresh
                </Button>
              </div>

              {userIntents.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <HomeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No buy intents yet</h3>
                    <p className="text-gray-500 mb-4">
                      Submit your first buy intent to get started with property matching.
                    </p>
                    <Button onClick={() => setActiveTab('submit')}>
                      Submit New Intent
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userIntents.map((intent) => (
                    <Card key={intent.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                Buy Intent
                              </h3>
                              <Badge variant="default" className="bg-blue-100 text-blue-800">
                                Active
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Location:</span>
                                <div className="text-gray-600">
                                  {getLocationDisplay(intent)}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Budget:</span>
                                <div className="text-gray-600">
                                  {intent.budget_min ? `$${intent.budget_min.toLocaleString()}` : 'No min'} - 
                                  {intent.budget_max ? `$${intent.budget_max.toLocaleString()}` : 'No max'}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Property Type:</span>
                                <div className="text-gray-600">
                                  {intent.property_type || 'Any type'}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Timeline:</span>
                                <div className="text-gray-600 capitalize">
                                  {intent.timeline.replace('-', ' ')}
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Submitted:</span>
                                <div className="text-gray-600">
                                  {new Date(intent.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SharedLayout>
  );
}
