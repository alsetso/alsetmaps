'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { TopBar } from '../components/TopBar';
import { supabase } from '@/integrations/supabase/client';

interface Box {
  id: string;
  description: string | null;
  price: number | null;
  state: string | null;
  city: string | null;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function BuyPage() {
  const { user } = useAuth();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBox, setEditingBox] = useState<Box | null>(null);
  const [formData, setFormData] = useState({
    // Step 1 - Basic Info (Required)
    description: '',
    budget_max: '',
    state: '',
    city: '',
    
    // Step 2 - Property Details
    property_type: '',
    buyer_type: '',
    occupant_intent: '',
    timeline_to_close: '',
    
    // Step 3 - Preferences
    preferred_condition: '',
    financing_details: '',
    hoa_ok: false,
    lot_size: '',
    year_built: '',
    deal_breakers: '',
    seller_flexibility: '',
    notes: '',
    
    status: 'active' as const
  });
  
  const [currentStep, setCurrentStep] = useState(1);

  // Fetch boxes - SIMPLIFIED TEST
  const fetchBoxes = async () => {
    console.log('🔍 Starting fetchBoxes, user:', user);
    
    try {
      // Test 1: Just get all boxes (no filtering)
      console.log('🔍 Test 1: Getting all boxes...');
      const { data: allBoxes, error: allError } = await supabase
        .from('boxes')
        .select('*');
      
      console.log('🔍 All boxes result:', { allBoxes, allError });
      
      if (allError) {
        console.error('❌ Error getting all boxes:', allError);
        setBoxes([]);
        return;
      }
      
      // Test 2: Filter by user_id if user exists
      if (user) {
        console.log('🔍 Test 2: Filtering by user_id:', user.id);
        // First get the user's public.users.id
        const { data: publicUser, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('supabase_id', user.id)
          .single();
        
        console.log('🔍 Public user result:', { publicUser, userError });
        
        if (publicUser) {
          const { data: userBoxes, error: boxesError } = await supabase
            .from('boxes')
            .select('*')
            .eq('user_id', publicUser.id);
          
          console.log('🔍 User boxes result:', { userBoxes, boxesError });
          setBoxes(userBoxes || []);
        } else {
          console.log('🔍 No public user found, showing all boxes');
          setBoxes(allBoxes || []);
        }
      } else {
        console.log('🔍 No user, showing all boxes');
        setBoxes(allBoxes || []);
      }
      
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      setBoxes([]);
    } finally {
      setLoading(false);
    }
  };

  // Create or update box
  const saveBox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const boxData = {
        // Required fields
        description: formData.description || null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        state: formData.state || null,
        city: formData.city || null,
        
        // Property details
        property_type: formData.property_type || null,
        buyer_type: formData.buyer_type || null,
        occupant_intent: formData.occupant_intent || null,
        timeline_to_close: formData.timeline_to_close || null,
        
        // Preferences
        preferred_condition: formData.preferred_condition || null,
        financing_details: formData.financing_details || null,
        hoa_ok: formData.hoa_ok,
        lot_size: formData.lot_size ? parseInt(formData.lot_size) : null,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        deal_breakers: formData.deal_breakers || null,
        seller_flexibility: formData.seller_flexibility || null,
        notes: formData.notes || null,
        
        status: formData.status,
      };

      if (editingBox) {
        // Update existing box - using direct Supabase for now
        // TODO: Create PUT /api/boxes/[id] endpoint
        const { data: publicUser, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('supabase_id', user.id)
          .single();

        if (!publicUser) {
          console.error('❌ No public user found');
          return;
        }

        const { error } = await supabase
          .from('boxes')
          .update({ ...boxData, user_id: publicUser.id })
          .eq('id', editingBox.id);

        if (error) throw error;
      } else {
        // Create new box using direct Supabase call (like other operations)
        const { data: publicUser, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('supabase_id', user.id)
          .single();

        if (!publicUser) {
          console.error('❌ No public user found');
          return;
        }

        const { error } = await supabase
          .from('boxes')
          .insert({ ...boxData, user_id: publicUser.id });

        if (error) throw error;

        // Send confirmation email after successful box creation
        try {
          const emailData = {
            firstName: user.user_metadata?.name || user.user_metadata?.first_name || 'there',
            email: user.email || '',
            boxDescription: formData.description,
            boxPrice: formData.budget_max ? parseFloat(formData.budget_max) : undefined,
            boxLocation: formData.city && formData.state ? `${formData.city}, ${formData.state}` : formData.city || formData.state,
          };

          const emailResponse = await fetch('/api/send-email-simple', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData),
          });

          if (emailResponse.ok) {
            console.log('Confirmation email sent successfully');
          } else {
            console.warn('Failed to send confirmation email, but box was created');
          }
        } catch (emailError) {
          console.warn('Error sending confirmation email:', emailError);
          // Don't fail the box creation if email fails
        }
      }

      // Reset form and close modal
      setFormData({
        description: '', budget_max: '', state: '', city: '',
        property_type: '', buyer_type: '', occupant_intent: '', timeline_to_close: '',
        preferred_condition: '', financing_details: '', hoa_ok: false, lot_size: '', year_built: '',
        deal_breakers: '', seller_flexibility: '', notes: '',
        status: 'active'
      });
      setCurrentStep(1);
      setEditingBox(null);
      setShowModal(false);
      fetchBoxes();
    } catch (error) {
      console.error('Error saving box:', error);
      alert('An error occurred while saving the box');
    }
  };

  // Delete box
  const deleteBox = async (id: string) => {
    if (!confirm('Are you sure you want to delete this box?')) return;

    try {
      // First, get the box data before deleting it
      const { data: boxToDelete, error: fetchError } = await supabase
        .from('boxes')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete the box
      const { error } = await supabase
        .from('boxes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Send deletion email after successful deletion
      if (user && boxToDelete) {
        try {
          const emailData = {
            firstName: user.user_metadata?.name || user.user_metadata?.first_name || 'there',
            email: user.email || '',
            boxDescription: boxToDelete.description,
            boxPrice: boxToDelete.budget_max,
            boxLocation: boxToDelete.city && boxToDelete.state ? `${boxToDelete.city}, ${boxToDelete.state}` : boxToDelete.city || boxToDelete.state,
          };

          const emailResponse = await fetch('/api/send-delete-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData),
          });

          if (!emailResponse.ok) {
            const emailError = await emailResponse.json();
            console.warn('Error sending deletion email:', emailError);
            // Don't fail the deletion if email fails
          } else {
            console.log('Deletion email sent successfully');
          }
        } catch (emailError) {
          console.warn('Error sending deletion email:', emailError);
          // Don't fail the deletion if email fails
        }
      }

      fetchBoxes();
    } catch (error) {
      console.error('Error deleting box:', error);
      alert('An error occurred while deleting the box');
    }
  };

  // Edit box
  const editBox = (box: Box) => {
    setEditingBox(box);
    setFormData({
      description: box.description || '',
      price: box.price?.toString() || '',
      state: box.state || '',
      city: box.city || '',
      status: box.status
    });
    setShowModal(true);
  };

  // Open modal for new box
  const openNewBoxModal = () => {
    setEditingBox(null);
    setFormData({ description: '', price: '', state: '', city: '', status: 'active' });
    setShowModal(true);
  };

  useEffect(() => {
    fetchBoxes();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <TopBar showSearchByDefault={false} showSearchIcon={false} />
        <div className="flex items-center justify-center h-96 pt-[76px]">
          <p className="text-gray-600">Please sign in to view your buy boxes.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Buy Boxes</h1>
            <p className="text-gray-600 mt-2">Manage your property search criteria</p>
          </div>
          <button
            onClick={openNewBoxModal}
            className="bg-gray-900 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            Create New Box
          </button>
        </div>

        {/* Boxes Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your boxes...</p>
          </div>
        ) : boxes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No buy boxes yet</p>
            <button
              onClick={openNewBoxModal}
              className="bg-gray-900 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Create Your First Box
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boxes.map((box) => (
              <div key={box.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    box.status === 'active' ? 'bg-green-100 text-green-800' :
                    box.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    box.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {box.status}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editBox(box)}
                      className="text-gray-600 hover:text-gray-900 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBox(box.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {box.description && (
                    <p className="text-gray-900 font-medium">{box.description}</p>
                  )}
                  {box.price && (
                    <p className="text-gray-600">${box.price.toLocaleString()}</p>
                  )}
                  {(box.city || box.state) && (
                    <p className="text-gray-600">
                      {[box.city, box.state].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Created {new Date(box.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {/* 3-Step Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBox ? 'Edit Box' : 'Create New Box'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Step Progress */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={saveBox} className="space-y-4">
              {/* Step 1: Basic Info (Required) */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      What are you looking for? *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g., 3-bedroom investment property in downtown area"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Budget *
                    </label>
                    <input
                      type="number"
                      value={formData.budget_max}
                      onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                      placeholder="e.g., 350000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="City"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="State"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Property Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Property Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Type
                    </label>
                    <select
                      value={formData.property_type}
                      onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    >
                      <option value="">Select property type</option>
                      <option value="single_family">Single Family</option>
                      <option value="condo">Condo</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="duplex">Duplex</option>
                      <option value="multi_family">Multi-Family</option>
                      <option value="land">Land</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Buyer Type
                    </label>
                    <select
                      value={formData.buyer_type}
                      onChange={(e) => setFormData({ ...formData, buyer_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    >
                      <option value="">Select buyer type</option>
                      <option value="first_time_buyer">First Time Buyer</option>
                      <option value="investor">Investor</option>
                      <option value="move_up_buyer">Move-Up Buyer</option>
                      <option value="downsizing">Downsizing</option>
                      <option value="relocating">Relocating</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      How will you use this property?
                    </label>
                    <select
                      value={formData.occupant_intent}
                      onChange={(e) => setFormData({ ...formData, occupant_intent: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    >
                      <option value="">Select intent</option>
                      <option value="primary_residence">Primary Residence</option>
                      <option value="investment">Investment</option>
                      <option value="vacation_home">Vacation Home</option>
                      <option value="rental">Rental Property</option>
                      <option value="flip">Fix & Flip</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timeline to Close
                    </label>
                    <select
                      value={formData.timeline_to_close}
                      onChange={(e) => setFormData({ ...formData, timeline_to_close: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    >
                      <option value="">Select timeline</option>
                      <option value="asap">ASAP</option>
                      <option value="1_month">1 Month</option>
                      <option value="3_months">3 Months</option>
                      <option value="6_months">6 Months</option>
                      <option value="1_year">1 Year</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: Preferences */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Condition
                    </label>
                    <select
                      value={formData.preferred_condition}
                      onChange={(e) => setFormData({ ...formData, preferred_condition: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    >
                      <option value="">Select condition</option>
                      <option value="turnkey">Turnkey</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="needs_work">Needs Work</option>
                      <option value="any">Any</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Financing Method
                    </label>
                    <select
                      value={formData.financing_details}
                      onChange={(e) => setFormData({ ...formData, financing_details: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    >
                      <option value="">Select financing</option>
                      <option value="cash">Cash</option>
                      <option value="conventional">Conventional Loan</option>
                      <option value="fha">FHA Loan</option>
                      <option value="va">VA Loan</option>
                      <option value="seller_finance">Seller Finance</option>
                      <option value="hard_money">Hard Money</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hoa_ok"
                      checked={formData.hoa_ok}
                      onChange={(e) => setFormData({ ...formData, hoa_ok: e.target.checked })}
                      className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                    />
                    <label htmlFor="hoa_ok" className="ml-2 block text-sm text-gray-700">
                      HOA is okay
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lot Size (sq ft)
                      </label>
                      <input
                        type="number"
                        value={formData.lot_size}
                        onChange={(e) => setFormData({ ...formData, lot_size: e.target.value })}
                        placeholder="e.g., 5000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year Built
                      </label>
                      <input
                        type="number"
                        value={formData.year_built}
                        onChange={(e) => setFormData({ ...formData, year_built: e.target.value })}
                        placeholder="e.g., 2010"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deal Breakers
                    </label>
                    <textarea
                      value={formData.deal_breakers}
                      onChange={(e) => setFormData({ ...formData, deal_breakers: e.target.value })}
                      placeholder="e.g., No busy roads, must have garage, no foundation issues"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any other preferences or requirements..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
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
                
                {currentStep < 3 ? (
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
                    className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    {editingBox ? 'Update Box' : 'Create Box'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
