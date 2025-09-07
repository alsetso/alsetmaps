'use client';

import { useEffect, useRef } from 'react';
import { TopBar } from '../components/TopBar';
import mapboxgl from 'mapbox-gl';

export default function SellPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  // Minnesota bounds coordinates [west, south, east, north] - moved outside useEffect
  const minnesotaBounds: [number, number, number, number] = [
    -97.239209, 43.499356, -89.491982, 49.384358
  ];

  // Function to add or update marker - moved outside useEffect
  const addMarker = (lng: number, lat: number, address?: string) => {
    if (map.current) {
      // Remove existing marker if it exists
      if (marker.current) {
        marker.current.remove();
      }
      
      // Create new marker with red circle
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.cssText = `
        background-color: #ef4444;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      `;
      
      marker.current = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(map.current);

      // Add iOS-style popup if address is provided
      if (address) {
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: false,
          className: 'ios-popup'
        })
          .setHTML(`
            <div class="ios-popup-content">
              <div class="ios-popup-header">
                <div class="ios-popup-title">Property Type</div>
                <div class="ios-popup-subtitle">${address}</div>
              </div>
              <div class="ios-popup-actions">
                <button class="ios-action-button" onclick="handlePropertyType('residential')">
                  <div class="ios-action-icon">🏠</div>
                  <div class="ios-action-text">
                    <div class="ios-action-title">Residential</div>
                    <div class="ios-action-subtitle">Homes & Properties</div>
                  </div>
                </button>
                <button class="ios-action-button" onclick="handlePropertyType('commercial')">
                  <div class="ios-action-icon">🏢</div>
                  <div class="ios-action-text">
                    <div class="ios-action-title">Commercial</div>
                    <div class="ios-action-subtitle">Business Properties</div>
                  </div>
                </button>
              </div>
            </div>
          `);
        
        marker.current.setPopup(popup);
        
        // Add global function to handle property type selection
        (window as any).handlePropertyType = (type: string) => {
          console.log('Property type selected:', type, 'at address:', address);
          // Show step 2: Owner/Contract question
          showOwnerContractStep(type, address, lng, lat);
        };
      }
    }
  };

  // Step 2: Owner/Contract question
  const showOwnerContractStep = (propertyType: string, address: string, lng: number, lat: number) => {
    if (marker.current && marker.current.getPopup()) {
      const popup = marker.current.getPopup();
      popup.setHTML(`
        <div class="ios-popup-content">
          <div class="ios-popup-header">
            <div class="ios-popup-nav">
              <button class="ios-nav-button" onclick="goBackToStep1('${address}', ${lng}, ${lat})">
                <span class="ios-nav-arrow">‹</span>
              </button>
              <div class="ios-nav-title">Property Rights</div>
              <div class="ios-nav-spacer"></div>
            </div>
            <div class="ios-popup-subtitle">${address}</div>
            <div class="ios-response-summary">
              <span class="ios-response-label">Property Type:</span>
              <span class="ios-response-value">${propertyType === 'residential' ? '🏠 Residential' : '🏢 Commercial'}</span>
            </div>
          </div>
          <div class="ios-popup-actions">
            <button class="ios-action-button" onclick="handleOwnerContract('owner', '${propertyType}', '${address}', ${lng}, ${lat})">
              <div class="ios-action-icon">👤</div>
              <div class="ios-action-text">
                <div class="ios-action-title">I'm the Owner</div>
                <div class="ios-action-subtitle">I own this property</div>
              </div>
            </button>
            <button class="ios-action-button" onclick="handleOwnerContract('contract', '${propertyType}', '${address}', ${lng}, ${lat})">
              <div class="ios-action-icon">📋</div>
              <div class="ios-action-text">
                <div class="ios-action-title">Under Contract</div>
                <div class="ios-action-subtitle">I have this under contract</div>
              </div>
            </button>
          </div>
        </div>
      `);
    }
  };

  // Step 3: Property condition
  const showConditionStep = (propertyType: string, ownership: string, address: string, lng: number, lat: number) => {
    if (marker.current && marker.current.getPopup()) {
      const popup = marker.current.getPopup();
      popup.setHTML(`
        <div class="ios-popup-content">
          <div class="ios-popup-header">
            <div class="ios-popup-nav">
              <button class="ios-nav-button" onclick="goBackToStep2('${propertyType}', '${address}', ${lng}, ${lat})">
                <span class="ios-nav-arrow">‹</span>
              </button>
              <div class="ios-nav-title">Property Condition</div>
              <div class="ios-nav-spacer"></div>
            </div>
            <div class="ios-popup-subtitle">${address}</div>
            <div class="ios-response-summary">
              <div class="ios-response-item">
                <span class="ios-response-label">Property Type:</span>
                <span class="ios-response-value">${propertyType === 'residential' ? '🏠 Residential' : '🏢 Commercial'}</span>
              </div>
              <div class="ios-response-item">
                <span class="ios-response-label">Ownership:</span>
                <span class="ios-response-value">${ownership === 'owner' ? '👤 Owner' : '📋 Under Contract'}</span>
              </div>
            </div>
          </div>
          <div class="ios-popup-actions">
            <button class="ios-action-button" onclick="handleCondition('excellent', '${propertyType}', '${ownership}', '${address}', ${lng}, ${lat})">
              <div class="ios-action-icon">✨</div>
              <div class="ios-action-text">
                <div class="ios-action-title">Excellent</div>
                <div class="ios-action-subtitle">Move-in ready</div>
              </div>
            </button>
            <button class="ios-action-button" onclick="handleCondition('good', '${propertyType}', '${ownership}', '${address}', ${lng}, ${lat})">
              <div class="ios-action-icon">👍</div>
              <div class="ios-action-text">
                <div class="ios-action-title">Good</div>
                <div class="ios-action-subtitle">Minor repairs needed</div>
              </div>
            </button>
            <button class="ios-action-button" onclick="handleCondition('fair', '${propertyType}', '${ownership}', '${address}', ${lng}, ${lat})">
              <div class="ios-action-icon">⚠️</div>
              <div class="ios-action-text">
                <div class="ios-action-title">Fair</div>
                <div class="ios-action-subtitle">Some repairs needed</div>
              </div>
            </button>
            <button class="ios-action-button" onclick="handleCondition('needs-work', '${propertyType}', '${ownership}', '${address}', ${lng}, ${lat})">
              <div class="ios-action-icon">🔧</div>
              <div class="ios-action-text">
                <div class="ios-action-title">Needs Work</div>
                <div class="ios-action-subtitle">Major repairs required</div>
              </div>
            </button>
          </div>
        </div>
      `);
    }
  };

  // Step 4: Timeline to close
  const showTimelineStep = (propertyType: string, ownership: string, condition: string, address: string, lng: number, lat: number) => {
    if (marker.current && marker.current.getPopup()) {
      const popup = marker.current.getPopup();
      popup.setHTML(`
        <div class="ios-popup-content">
          <div class="ios-popup-header">
            <div class="ios-popup-nav">
              <button class="ios-nav-button" onclick="goBackToStep3('${propertyType}', '${ownership}', '${address}', ${lng}, ${lat})">
                <span class="ios-nav-arrow">‹</span>
              </button>
              <div class="ios-nav-title">Timeline to Close</div>
              <div class="ios-nav-spacer"></div>
            </div>
            <div class="ios-popup-subtitle">${address}</div>
            <div class="ios-response-summary">
              <div class="ios-response-item">
                <span class="ios-response-label">Property Type:</span>
                <span class="ios-response-value">${propertyType === 'residential' ? '🏠 Residential' : '🏢 Commercial'}</span>
              </div>
              <div class="ios-response-item">
                <span class="ios-response-label">Ownership:</span>
                <span class="ios-response-value">${ownership === 'owner' ? '👤 Owner' : '📋 Under Contract'}</span>
              </div>
              <div class="ios-response-item">
                <span class="ios-response-label">Condition:</span>
                <span class="ios-response-value">${condition === 'excellent' ? '✨ Excellent' : condition === 'good' ? '👍 Good' : condition === 'fair' ? '⚠️ Fair' : '🔧 Needs Work'}</span>
              </div>
            </div>
          </div>
          <div class="ios-popup-actions">
            <button class="ios-action-button" onclick="handleTimeline('asap', '${propertyType}', '${ownership}', '${condition}', '${address}', ${lng}, ${lat})">
              <div class="ios-action-icon">⚡</div>
              <div class="ios-action-text">
                <div class="ios-action-title">ASAP</div>
                <div class="ios-action-subtitle">Within 30 days</div>
              </div>
            </button>
            <button class="ios-action-button" onclick="handleTimeline('1-2-months', '${propertyType}', '${ownership}', '${condition}', '${address}', ${lng}, ${lat})">
              <div class="ios-action-icon">📅</div>
              <div class="ios-action-text">
                <div class="ios-action-title">1-2 Months</div>
                <div class="ios-action-subtitle">Quick but flexible</div>
              </div>
            </button>
            <button class="ios-action-button" onclick="handleTimeline('2-3-months', '${propertyType}', '${ownership}', '${condition}', '${address}', ${lng}, ${lat})">
              <div class="ios-action-icon">📆</div>
              <div class="ios-action-text">
                <div class="ios-action-title">2-3 Months</div>
                <div class="ios-action-subtitle">Standard timeline</div>
              </div>
            </button>
            <button class="ios-action-button" onclick="handleTimeline('flexible', '${propertyType}', '${ownership}', '${condition}', '${address}', ${lng}, ${lat})">
              <div class="ios-action-icon">🔄</div>
              <div class="ios-action-text">
                <div class="ios-action-title">Flexible</div>
                <div class="ios-action-subtitle">No rush</div>
              </div>
            </button>
          </div>
        </div>
      `);
    }
  };

  // Step 5: Basic property details (final step)
  const showPropertyDetailsStep = (propertyType: string, ownership: string, condition: string, timeline: string, address: string, lng: number, lat: number) => {
    if (marker.current && marker.current.getPopup()) {
      const popup = marker.current.getPopup();
      popup.setHTML(`
        <div class="ios-popup-content">
          <div class="ios-popup-header">
            <div class="ios-popup-nav">
              <button class="ios-nav-button" onclick="goBackToStep4('${propertyType}', '${ownership}', '${condition}', '${address}', ${lng}, ${lat})">
                <span class="ios-nav-arrow">‹</span>
              </button>
              <div class="ios-nav-title">Property Details</div>
              <div class="ios-nav-spacer"></div>
            </div>
            <div class="ios-popup-subtitle">${address}</div>
            <div class="ios-response-summary">
              <div class="ios-response-item">
                <span class="ios-response-label">Property Type:</span>
                <span class="ios-response-value">${propertyType === 'residential' ? '🏠 Residential' : '🏢 Commercial'}</span>
              </div>
              <div class="ios-response-item">
                <span class="ios-response-label">Ownership:</span>
                <span class="ios-response-value">${ownership === 'owner' ? '👤 Owner' : '📋 Under Contract'}</span>
              </div>
              <div class="ios-response-item">
                <span class="ios-response-label">Condition:</span>
                <span class="ios-response-value">${condition === 'excellent' ? '✨ Excellent' : condition === 'good' ? '👍 Good' : condition === 'fair' ? '⚠️ Fair' : '🔧 Needs Work'}</span>
              </div>
              <div class="ios-response-item">
                <span class="ios-response-label">Timeline:</span>
                <span class="ios-response-value">${timeline === 'asap' ? '⚡ ASAP' : timeline === '1-2-months' ? '📅 1-2 Months' : timeline === '2-3-months' ? '📆 2-3 Months' : '🔄 Flexible'}</span>
              </div>
            </div>
          </div>
          <div class="ios-popup-form">
            <div class="ios-form-group">
              <label class="ios-form-label">Asking Price</label>
              <input type="text" id="askingPrice" class="ios-form-input" placeholder="$500,000" />
            </div>
            <div class="ios-form-group">
              <label class="ios-form-label">Contact Email</label>
              <input type="email" id="contactEmail" class="ios-form-input" placeholder="your@email.com" />
            </div>
            <div class="ios-form-actions">
              <button class="ios-form-button" onclick="handlePropertySubmit('${propertyType}', '${ownership}', '${condition}', '${timeline}', '${address}', ${lng}, ${lat})">
                List Property
              </button>
            </div>
          </div>
        </div>
      `);
    }
  };

  // Navigation functions
  (window as any).goBackToStep1 = (address: string, lng: number, lat: number) => {
    if (marker.current && marker.current.getPopup()) {
      const popup = marker.current.getPopup();
      popup.setHTML(`
        <div class="ios-popup-content">
          <div class="ios-popup-header">
            <div class="ios-popup-title">Property Type</div>
            <div class="ios-popup-subtitle">${address}</div>
          </div>
          <div class="ios-popup-actions">
            <button class="ios-action-button" onclick="handlePropertyType('residential')">
              <div class="ios-action-icon">🏠</div>
              <div class="ios-action-text">
                <div class="ios-action-title">Residential</div>
                <div class="ios-action-subtitle">Homes & Properties</div>
              </div>
            </button>
            <button class="ios-action-button" onclick="handlePropertyType('commercial')">
              <div class="ios-action-icon">🏢</div>
              <div class="ios-action-text">
                <div class="ios-action-title">Commercial</div>
                <div class="ios-action-subtitle">Business Properties</div>
              </div>
            </button>
          </div>
        </div>
      `);
    }
  };

  (window as any).goBackToStep2 = (propertyType: string, address: string, lng: number, lat: number) => {
    showOwnerContractStep(propertyType, address, lng, lat);
  };

  (window as any).goBackToStep3 = (propertyType: string, ownership: string, address: string, lng: number, lat: number) => {
    showConditionStep(propertyType, ownership, address, lng, lat);
  };

  (window as any).goBackToStep4 = (propertyType: string, ownership: string, condition: string, address: string, lng: number, lat: number) => {
    showTimelineStep(propertyType, ownership, condition, address, lng, lat);
  };

  // Handle owner/contract selection
  (window as any).handleOwnerContract = (ownership: string, propertyType: string, address: string, lng: number, lat: number) => {
    console.log('Ownership selected:', ownership, 'Property type:', propertyType);
    showConditionStep(propertyType, ownership, address, lng, lat);
  };

  // Handle condition selection
  (window as any).handleCondition = (condition: string, propertyType: string, ownership: string, address: string, lng: number, lat: number) => {
    console.log('Condition selected:', condition);
    showTimelineStep(propertyType, ownership, condition, address, lng, lat);
  };

  // Handle timeline selection
  (window as any).handleTimeline = (timeline: string, propertyType: string, ownership: string, condition: string, address: string, lng: number, lat: number) => {
    console.log('Timeline selected:', timeline);
    showPropertyDetailsStep(propertyType, ownership, condition, timeline, address, lng, lat);
  };

  // Handle final property submission
  (window as any).handlePropertySubmit = (propertyType: string, ownership: string, condition: string, timeline: string, address: string, lng: number, lat: number) => {
    const askingPrice = (document.getElementById('askingPrice') as HTMLInputElement)?.value;
    const contactEmail = (document.getElementById('contactEmail') as HTMLInputElement)?.value;
    
    if (!askingPrice || !contactEmail) {
      alert('Please fill in all fields');
      return;
    }

    console.log('Property listing submitted:', {
      propertyType,
      ownership,
      condition,
      timeline,
      address,
      coordinates: { lng, lat },
      askingPrice,
      contactEmail
    });

    // Close popup and show success
    if (marker.current && marker.current.getPopup()) {
      marker.current.getPopup()?.remove();
    }
    
    alert('Property listed successfully!');
  };

  // Listen for flyToLocation events from TopBar - moved outside useEffect
  const handleFlyToLocation = (event: CustomEvent) => {
    console.log('Received flyToLocation event:', event.detail);
    const { lng, lat, zoom, address } = event.detail;
    if (map.current) {
      console.log('Map exists, checking bounds for:', { lng, lat });
      // Check if the location is within Minnesota bounds [west, south, east, north]
      const isWithinBounds = 
        lng >= minnesotaBounds[0] && lng <= minnesotaBounds[2] &&
        lat >= minnesotaBounds[1] && lat <= minnesotaBounds[3];
      
      console.log('Is within bounds:', isWithinBounds, 'Bounds:', minnesotaBounds);
      
      if (isWithinBounds) {
        console.log('Adding marker and flying to location');
        // Add marker at the location with address popup
        addMarker(lng, lat, address);
        
        // Fly to the location
        map.current.flyTo({
          center: [lng, lat],
          zoom: Math.min(zoom || 15, 18), // Cap zoom at 18 to prevent over-zooming
          duration: 2000
        });
      } else {
        console.warn('Location is outside Minnesota bounds');
      }
    } else {
      console.error('Map is not initialized');
    }
  };

  useEffect(() => {
    if (map.current) return; // initialize map only once
    
    // Set Mapbox access token
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
    
    if (!mapboxgl.accessToken) {
      console.error('Mapbox access token is not set. Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your environment variables.');
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v12',
      bounds: minnesotaBounds, // Set the initial view to Minnesota
      maxBounds: minnesotaBounds, // Restrict panning and zooming to Minnesota
      fitBoundsOptions: {
        padding: 50 // Add some padding around the bounds
      }
    });

    // Wait for map to load before setting up event listeners
    map.current.on('load', () => {
      console.log('Map loaded, setting up event listeners');
      window.addEventListener('flyToLocation', handleFlyToLocation as EventListener);
    });

    return () => {
      window.removeEventListener('flyToLocation', handleFlyToLocation as EventListener);
    };
  }, []);

  return (
    <div className="h-screen w-screen">
      <TopBar showSearchByDefault={true} showSearchIcon={true} />
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ marginTop: '60px', height: 'calc(100vh - 60px)' }}
      />
    </div>
  );
}
