'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { TopBar } from '../components/TopBar';
import { CitySelector } from '../components/CitySelector';
import { supabase } from '@/integrations/supabase/client';

interface Listing {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  condition: string | null;
  status: 'new' | 'under_review' | 'under_contract' | 'sold';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function SellPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [formData, setFormData] = useState({
    // Basic Info
    address: '',
    city: searchParams?.get('city') || '',
    state: searchParams?.get('state') || 'MN',
    zip: '',
    price: '',
    
    // Property Details
    bedrooms: '',
    bathrooms: '',
    square_feet: '',
    condition: '',
    
    // Additional Info
    notes: '',
    status: 'new' as 'new' | 'under_review' | 'under_contract' | 'sold'
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-open modal if URL parameters contain state or city
  useEffect(() => {
    const stateParam = searchParams?.get('state');
    const cityParam = searchParams?.get('city');
    
    if (stateParam || cityParam) {
      setShowModal(true);
    }
  }, [searchParams]);

  // Fetch listings
  const fetchListings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
        setListings([]);
      } else {
        setListings(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new listing
  const createListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          price: parseFloat(formData.price),
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
          square_feet: formData.square_feet ? parseInt(formData.square_feet) : null,
          condition: formData.condition || null,
          notes: formData.notes || null,
          status: formData.status
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating listing:', error);
        alert('Failed to create listing');
      } else {
        setListings([data, ...listings]);
        setShowModal(false);
        resetForm();
        alert('Listing created successfully!');
      }
    } catch (error) {
      console.error('Unexpected error creating listing:', error);
      alert('An error occurred while creating the listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update listing
  const updateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .update({
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          price: parseFloat(formData.price),
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
          square_feet: formData.square_feet ? parseInt(formData.square_feet) : null,
          condition: formData.condition || null,
          notes: formData.notes || null,
          status: formData.status
        })
        .eq('id', editingListing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating listing:', error);
        alert('Failed to update listing');
      } else {
        setListings(listings.map(listing => 
          listing.id === editingListing.id ? data : listing
        ));
        setShowModal(false);
        setEditingListing(null);
        resetForm();
        alert('Listing updated successfully!');
      }
    } catch (error) {
      console.error('Unexpected error updating listing:', error);
      alert('An error occurred while updating the listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete listing
  const deleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing');
      } else {
        setListings(listings.filter(listing => listing.id !== id));
        alert('Listing deleted successfully!');
      }
    } catch (error) {
      console.error('Unexpected error deleting listing:', error);
      alert('An error occurred while deleting the listing');
    }
  };

  // Edit listing
  const editListing = (listing: Listing) => {
    setEditingListing(listing);
    setFormData({
      address: listing.address || '',
      city: listing.city || '',
      state: listing.state || '',
      zip: listing.zip || '',
      price: listing.price?.toString() || '',
      bedrooms: listing.bedrooms?.toString() || '',
      bathrooms: listing.bathrooms?.toString() || '',
      square_feet: listing.square_feet?.toString() || '',
      condition: listing.condition || '',
      notes: '',
      status: listing.status
    });
    setCurrentStep(1);
    setShowModal(true);
  };

  // Open modal for new listing
  const openNewListingModal = () => {
    setEditingListing(null);
    resetForm();
    setCurrentStep(1);
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      address: '',
      city: searchParams?.get('city') || '',
      state: searchParams?.get('state') || 'MN',
      zip: '',
      price: '',
      bedrooms: '',
      bathrooms: '',
      square_feet: '',
      condition: '',
      notes: '',
      status: 'new'
    });
  };

  useEffect(() => {
    fetchListings();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <TopBar showSearchByDefault={false} showSearchIcon={false} />
        <div className="flex items-center justify-center h-96 pt-[76px]">
          <p className="text-gray-600">Please sign in to view your listings.</p>
              </div>
            </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[84px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Property Listings</h1>
            <p className="text-gray-600 mt-2">Manage your properties for sale</p>
          </div>
          <button
            onClick={openNewListingModal}
            className="bg-gray-900 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            + New Listing
            </button>
              </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your listings...</p>
              </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No listings yet</p>
            <button
              onClick={openNewListingModal}
              className="bg-gray-900 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Create Your First Listing
            </button>
              </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    listing.status === 'new' ? 'bg-blue-100 text-blue-800' :
                    listing.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                    listing.status === 'under_contract' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {listing.status.replace('_', ' ')}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editListing(listing)}
                      className="text-gray-600 hover:text-gray-900 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteListing(listing.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Delete
            </button>
          </div>
        </div>

                <div className="space-y-2">
                  <p className="text-gray-900 font-medium">{listing.address}</p>
                  <p className="text-gray-600">
                    {[listing.city, listing.state, listing.zip].filter(Boolean).join(', ')}
                  </p>
                  <p className="text-lg font-semibold text-green-600">
                    ${listing.price.toLocaleString()}
                  </p>
                  {(listing.bedrooms || listing.bathrooms || listing.square_feet) && (
                    <div className="flex gap-4 text-sm text-gray-600">
                      {listing.bedrooms && <span>{listing.bedrooms} bed</span>}
                      {listing.bathrooms && <span>{listing.bathrooms} bath</span>}
                      {listing.square_feet && <span>{listing.square_feet.toLocaleString()} sq ft</span>}
            </div>
                  )}
                  {listing.condition && (
                    <p className="text-sm text-gray-600">Condition: {listing.condition}</p>
                  )}
              </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Listed {new Date(listing.created_at).toLocaleDateString()}
                  </p>
              </div>
              </div>
            ))}
          </div>
        )}
              </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingListing ? 'Edit Listing' : 'New Listing'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
            </button>
              </div>

              <form onSubmit={editingListing ? updateListing : createListing}>
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Property Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="123 Main Street"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
              </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <CitySelector
                          value={formData.city}
                          onChange={(city) => setFormData({ ...formData, city })}
                          state={formData.state}
                          required
                        />
              </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <select
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        >
                          <option value="MN">Minnesota</option>
                          <option value="WI">Wisconsin</option>
                          <option value="IA">Iowa</option>
                          <option value="ND">North Dakota</option>
                          <option value="SD">South Dakota</option>
                        </select>
          </div>
        </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          value={formData.zip}
                          onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                          placeholder="55401"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
            </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price *
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="350000"
                          required
                          min="0"
                          step="1000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
              </div>
            </div>
          </div>
                )}

                {/* Step 2: Property Details */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Property Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bedrooms
                        </label>
                        <input
                          type="number"
                          value={formData.bedrooms}
                          onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                          placeholder="3"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
            </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bathrooms
                        </label>
                        <input
                          type="number"
                          value={formData.bathrooms}
                          onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                          placeholder="2.5"
                          min="0"
                          step="0.5"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
            </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Square Feet
                        </label>
                        <input
                          type="number"
                          value={formData.square_feet}
                          onChange={(e) => setFormData({ ...formData, square_feet: e.target.value })}
                          placeholder="2000"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
            </div>
          </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condition
                      </label>
                      <select
                        value={formData.condition}
                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      >
                        <option value="">Select condition</option>
                        <option value="needs_work">Needs Work</option>
                        <option value="fair">Fair</option>
                        <option value="good">Good</option>
                        <option value="excellent">Excellent</option>
                        <option value="turnkey">Turnkey</option>
                      </select>
        </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Any additional details about the property..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
          </div>
              </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      currentStep > 1 ? setCurrentStep(currentStep - 1) : setShowModal(false);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    {currentStep > 1 ? 'Back' : 'Cancel'}
                  </button>
                  
                  {currentStep < 2 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentStep(currentStep + 1);
                      }}
                      className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : (editingListing ? 'Update Listing' : 'Create Listing')}
            </button>
                  )}
                </div>
              </form>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
