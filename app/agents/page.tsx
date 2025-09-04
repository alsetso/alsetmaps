'use client';

import { useState, useEffect } from 'react';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { Label } from '@/features/shared/components/ui/label';
import { Badge } from '@/features/shared/components/ui/badge';
import { useAuth } from '@/features/authentication/components/AuthProvider';
import { FindAgentService, CreateFindAgentRequest } from '@/features/agents';
import { 
  MagnifyingGlassIcon,
  UserIcon,
  PlusIcon,
  CheckBadgeIcon,
  MapPinIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// Mock data for demonstration
const mockAgents = [
  {
    id: 1,
    firstName: 'Sarah',
    lastName: 'Johnson',
    company: 'Century 21 Real Estate',
    location: 'Austin, TX',
    state: 'TX',
    specialties: ['Residential', 'First-time Buyers'],
    rating: 4.8,
    reviewCount: 127,
    isVerified: true,
    experience: '8 years',
    languages: ['English', 'Spanish'],
    leadCount: 45,
    responseTime: '< 2 hours'
  },
  {
    id: 2,
    firstName: 'Michael',
    lastName: 'Chen',
    company: 'Keller Williams Realty',
    location: 'Round Rock, TX',
    state: 'TX',
    specialties: ['Commercial', 'Investment Properties'],
    rating: 4.9,
    reviewCount: 89,
    isVerified: true,
    experience: '12 years',
    languages: ['English', 'Mandarin'],
    leadCount: 38,
    responseTime: '< 1 hour'
  },
  {
    id: 3,
    firstName: 'Emily',
    lastName: 'Rodriguez',
    company: 'RE/MAX Austin',
    location: 'Cedar Park, TX',
    state: 'TX',
    specialties: ['Luxury Homes', 'New Construction'],
    rating: 4.7,
    reviewCount: 156,
    isVerified: true,
    experience: '6 years',
    languages: ['English', 'Spanish'],
    leadCount: 52,
    responseTime: '< 3 hours'
  },
  {
    id: 4,
    firstName: 'David',
    lastName: 'Thompson',
    company: 'Coldwell Banker',
    location: 'San Antonio, TX',
    state: 'TX',
    specialties: ['Military Relocation', 'VA Loans'],
    rating: 4.6,
    reviewCount: 94,
    isVerified: true,
    experience: '15 years',
    languages: ['English'],
    leadCount: 41,
    responseTime: '< 4 hours'
  }
];

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const propertyTypes = [
  'Single Family Home',
  'Condo/Townhouse',
  'Multi-Family',
  'Commercial',
  'Land',
  'Investment Property',
  'Luxury Home',
  'New Construction'
];

const timelineOptions = [
  'Immediately',
  '1-3 months',
  '3-6 months',
  '6-12 months',
  'Just exploring'
];

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<'featured' | 'find-agent' | 'directory'>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(mockAgents);
  const [isSearching, setIsSearching] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const { user, loading: authLoading } = useAuth();

  // Pre-fill form for logged-in users
  useEffect(() => {
    if (user && !authLoading) {
      // Form will be pre-filled when the lead form is shown
    }
  }, [user, authLoading]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(mockAgents);
      return;
    }
    
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const filtered = mockAgents.filter(agent => 
        agent.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLeadSubmission = async (formData: any) => {
    setIsSubmittingLead(true);
    
    try {
      // Transform form data to match our schema
      const requestData: CreateFindAgentRequest = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        state: formData.state,
        city: formData.city || undefined,
        property_type: formData.propertyType || undefined,
        timeline: formData.timeline || undefined,
        min_budget: formData.minBudget ? parseFloat(formData.minBudget) : undefined,
        max_budget: formData.maxBudget ? parseFloat(formData.maxBudget) : undefined,
        additional_info: formData.additionalInfo || undefined,
        user_id: user?.id,
      };

      // Create the find agent request
      await FindAgentService.createRequest(requestData);
      
      // Show success state
      setLeadSubmitted(true);
      
      // Reset form after delay
      setTimeout(() => {
        setLeadSubmitted(false);
        setShowLeadForm(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting lead:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'verified': { color: 'bg-green-100 text-green-800', label: 'Verified' },
      'premium': { color: 'bg-blue-100 text-blue-800', label: 'Premium' },
      'new': { color: 'bg-yellow-100 text-yellow-800', label: 'New' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.verified;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (authLoading) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <UserIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Find Your Perfect Real Estate Agent
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Connect with verified, experienced agents in your area. 
                Browse profiles, specialties, and service areas to find the right match for your needs.
              </p>

            {/* Search Bar */}
              <div className="max-w-2xl mx-auto mt-8">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by name, company, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                    className="pl-10 pr-4 py-3"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                    disabled={isSearching}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-8">
              <Button
                  onClick={() => setShowLeadForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                  <UserGroupIcon className="w-5 h-5 mr-2" />
                  Find An Agent
              </Button>
                            <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
                onClick={() => window.location.href = '/agent/new'}
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Join as Agent
              </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('featured')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'featured'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Featured Agents
              </button>
              <button
                onClick={() => setActiveTab('find-agent')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'find-agent'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Find An Agent
              </button>
              <button
                onClick={() => setActiveTab('directory')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'directory'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Agent Directory
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {activeTab === 'featured' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Agents</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Our top-performing agents with proven track records and excellent client satisfaction
                </p>
              </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockAgents.slice(0, 3).map((agent) => (
                  <Card key={agent.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">
                              {agent.firstName} {agent.lastName}
                                </CardTitle>
                            <p className="text-sm text-gray-600">{agent.company}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                          {agent.isVerified && (
                                <CheckBadgeIcon className="w-5 h-5 text-blue-600" title="Verified Agent" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Location and Experience */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{agent.location}</span>
                        </div>
                        <span>{agent.experience}</span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{agent.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">({agent.reviewCount} reviews)</span>
                      </div>

                      {/* Specialties */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Specialties</h4>
                        <div className="flex flex-wrap gap-2">
                          {agent.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-semibold text-gray-900">{agent.leadCount}</div>
                          <div className="text-gray-600">Leads Closed</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-semibold text-gray-900">{agent.responseTime}</div>
                          <div className="text-gray-600">Response Time</div>
                        </div>
                          </div>

                      {/* Contact Button */}
                      <Button 
                        onClick={() => setShowLeadForm(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Contact Agent
                            </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
          )}

          {activeTab === 'find-agent' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Agent</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Tell us about your needs and we'll connect you with qualified agents in your area
                </p>
                  </div>

            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserGroupIcon className="w-5 h-5 text-blue-600" />
                      Agent Request Form
                  </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const data = Object.fromEntries(formData);
                      handleLeadSubmission(data);
                    }} className="space-y-6">
                      
                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            placeholder="John"
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            placeholder="Doe"
                            className="mt-1"
                            required
                          />
                        </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <div className="relative mt-1">
                            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="email"
                            name="email"
                              type="email"
                              placeholder="john@example.com"
                              className="pl-10"
                              required
                            />
                                  </div>
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone *</Label>
                          <div className="relative mt-1">
                            <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                  <Input 
                              id="phone"
                              name="phone"
                              placeholder="(555) 123-4567"
                                    className="pl-10" 
                              required
                                  />
                                </div>
                        </div>
                        </div>

                      {/* Property Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="state">State *</Label>
                                  <select
                            id="state"
                            name="state"
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          >
                            {states.map((state) => (
                              <option key={state} value={state}>{state}</option>
                                    ))}
                                  </select>
                        </div>
                        <div>
                          <Label htmlFor="city">City (Optional)</Label>
                                  <Input 
                            id="city"
                            name="city"
                            placeholder="City"
                            className="mt-1"
                          />
                        </div>
                        </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="propertyType">Property Type</Label>
                          <select
                            id="propertyType"
                            name="propertyType"
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select property type</option>
                            {propertyTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="timeline">Timeline</Label>
                          <select
                            id="timeline"
                            name="timeline"
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {timelineOptions.map((timeline) => (
                              <option key={timeline} value={timeline}>{timeline}</option>
                            ))}
                          </select>
                        </div>
                        </div>

                      <div>
                        <Label htmlFor="budget">Budget Range (Optional)</Label>
                        <div className="grid grid-cols-2 gap-4 mt-1">
                                  <div className="relative">
                            <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              name="minBudget"
                              placeholder="Min"
                              className="pl-10"
                            />
                                  </div>
                          <div className="relative">
                            <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              name="maxBudget"
                              placeholder="Max"
                              className="pl-10"
                            />
                          </div>
                        </div>
                        </div>

                      <div>
                        <Label htmlFor="additionalInfo">Additional Information</Label>
                                <textarea
                          id="additionalInfo"
                          name="additionalInfo"
                          placeholder="Tell us about your specific needs, preferences, or any other details..."
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  rows={4}
                        />
                      </div>

                      <div className="text-center">
                          <Button
                            type="submit"
                          size="lg"
                          className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700"
                          disabled={isSubmittingLead}
                          >
                          {isSubmittingLead ? 'Submitting...' : 'Submit Agent Request'}
                          </Button>
                        <p className="text-sm text-gray-600 mt-2">
                          We'll connect you with qualified agents within 24 hours
                        </p>
                      </div>
                    </form>
                  </CardContent>
                </Card>
                      </div>
                    </div>
                  )}

          {activeTab === 'directory' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">All Agents</h2>
                <Button onClick={() => setSearchResults(mockAgents)} variant="outline" className="flex items-center gap-2">
                  <ArrowPathIcon className="w-4 h-4" />
                  Refresh
                </Button>
              </div>

              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((agent) => (
                    <Card key={agent.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {agent.firstName} {agent.lastName}
                              </h3>
                              {getStatusBadge('verified')}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Company:</span>
                                <div className="text-gray-600">{agent.company}</div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Location:</span>
                                <div className="text-gray-600">{agent.location}</div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Experience:</span>
                                <div className="text-gray-600">{agent.experience}</div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Rating:</span>
                                <div className="text-gray-600">{agent.rating} ({agent.reviewCount} reviews)</div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Leads Closed:</span>
                                <div className="text-gray-600">{agent.leadCount}</div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700">Response Time:</span>
                                <div className="text-gray-600">{agent.responseTime}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => setShowLeadForm(true)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Contact Agent
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search criteria or browse our featured agents.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults(mockAgents);
                    }}
                  >
                    View All Agents
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lead Form Modal */}
        {showLeadForm && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Find Your Agent</h2>
                        <Button
                          variant="outline"
                      size="sm"
                      onClick={() => setShowLeadForm(false)}
                        >
                      ×
                        </Button>
                  </div>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const data = Object.fromEntries(formData);
                    handleLeadSubmission(data);
                  }} className="space-y-4">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="modalFirstName">First Name *</Label>
                        <Input
                          id="modalFirstName"
                          name="firstName"
                          placeholder="John"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="modalLastName">Last Name *</Label>
                        <Input
                          id="modalLastName"
                          name="lastName"
                          placeholder="Doe"
                          required
                        />
                      </div>
                      </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="modalEmail">Email *</Label>
                        <Input
                          id="modalEmail"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="modalPhone">Phone *</Label>
                        <Input
                          id="modalPhone"
                          name="phone"
                          placeholder="(555) 123-4567"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="modalState">State *</Label>
                      <select
                        id="modalState"
                        name="state"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        {states.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="modalPropertyType">What are you looking for?</Label>
                      <select
                        id="modalPropertyType"
                        name="propertyType"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select property type</option>
                        {propertyTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="modalTimeline">When do you need an agent?</Label>
                      <select
                        id="modalTimeline"
                        name="timeline"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {timelineOptions.map((timeline) => (
                          <option key={timeline} value={timeline}>{timeline}</option>
                        ))}
                      </select>
                    </div>

                    <div className="text-center pt-4">
                      <Button 
                        type="submit"
                        size="lg"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isSubmittingLead}
                      >
                        {isSubmittingLead ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Success Overlay */}
        {leadSubmitted && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all duration-300 ease-out">
                <div className="p-8 text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleIcon className="w-10 h-10 text-blue-600" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Agent Request Submitted!
                  </h2>
                  
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Thank you for your request. We'll connect you with qualified agents in your area within 24 hours.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-center gap-3 text-blue-700">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium">Your request is being processed</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-blue-700">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium">Agents will contact you within 24 hours</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-blue-700">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium">You'll receive email confirmations</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setLeadSubmitted(false)}
                    size="lg"
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    Got it!
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="py-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Are you a Real Estate Agent?
              </h3>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                Join our network of verified agents and start receiving qualified leads from potential buyers and sellers in your area.
              </p>
              <div className="flex justify-center space-x-4">
                              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                onClick={() => window.location.href = '/agent/new'}
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Join as Agent
              </Button>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SharedLayout>
  );
}
