'use client';

import { TopBar } from '../components/TopBar';
import { Footer } from '../components/Footer';
import { useState, useEffect, useRef } from 'react';

interface Region {
  name: string;
  west: number;
  east: number;
  north: number;
  south: number;
  color: string;
}

const regions: Region[] = [
  {
    name: 'Minnesota (statewide)',
    west: -97.5,
    east: -89.0,
    north: 49.5,
    south: 43.0,
    color: 'rgba(34, 197, 94, 0.3)' // green-500 with opacity
  },
  {
    name: 'Twin Cities metropolitan area',
    west: -94.01,
    east: -92.73,
    north: 45.42,
    south: 44.47,
    color: 'rgba(239, 68, 68, 0.3)' // red-500 with opacity
  }
];

export default function CountiesPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const container = svgRef.current.parentElement;
        if (container) {
          setDimensions({
            width: Math.min(container.clientWidth - 40, 1000),
            height: Math.min(container.clientHeight - 100, 700)
          });
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Convert geographic coordinates to SVG coordinates
  const geoToSvg = (lng: number, lat: number) => {
    // Find the bounds of all regions
    const allLngs = regions.flatMap(r => [r.west, r.east]);
    const allLats = regions.flatMap(r => [r.north, r.south]);
    
    const minLng = Math.min(...allLngs);
    const maxLng = Math.max(...allLngs);
    const minLat = Math.min(...allLats);
    const maxLat = Math.max(...allLats);
    
    // Add padding
    const padding = 0.1;
    const lngRange = maxLng - minLng;
    const latRange = maxLat - minLat;
    
    const paddedMinLng = minLng - lngRange * padding;
    const paddedMaxLng = maxLng + lngRange * padding;
    const paddedMinLat = minLat - latRange * padding;
    const paddedMaxLat = maxLat + latRange * padding;
    
    const x = ((lng - paddedMinLng) / (paddedMaxLng - paddedMinLng)) * dimensions.width;
    const y = ((paddedMaxLat - lat) / (paddedMaxLat - paddedMinLat)) * dimensions.height;
    
    return { x, y };
  };

  // Create rectangle path for a region
  const createRegionPath = (region: Region) => {
    const topLeft = geoToSvg(region.west, region.north);
    const bottomRight = geoToSvg(region.east, region.south);
    
    const width = bottomRight.x - topLeft.x;
    const height = bottomRight.y - topLeft.y;
    
    return `M ${topLeft.x} ${topLeft.y} L ${topLeft.x + width} ${topLeft.y} L ${topLeft.x + width} ${topLeft.y + height} L ${topLeft.x} ${topLeft.y + height} Z`;
  };

  return (
    <div className="min-h-screen bg-white">
      <TopBar showSearchByDefault={false} showSearchIcon={false} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Minnesota Regions</h1>
          <p className="text-lg text-gray-600">
            Interactive map showing the geographic boundaries of Minnesota regions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Container */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
              <div className="aspect-video w-full">
                <svg
                  ref={svgRef}
                  width={dimensions.width}
                  height={dimensions.height}
                  viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                  className="w-full h-full border border-gray-300 rounded"
                >
                  {/* Grid lines for reference */}
                  <defs>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Render regions */}
                  {regions.map((region, index) => {
                    const path = createRegionPath(region);
                    const isSelected = selectedRegion === region.name;
                    
                    return (
                      <g key={index}>
                        <path
                          d={path}
                          fill={isSelected ? region.color.replace('0.3', '0.6') : region.color}
                          stroke={isSelected ? '#1f2937' : '#6b7280'}
                          strokeWidth={isSelected ? 3 : 2}
                          className="cursor-pointer transition-all duration-200 hover:opacity-80"
                          onClick={() => setSelectedRegion(selectedRegion === region.name ? null : region.name)}
                        />
                        
                        {/* Region label */}
                        <text
                          x={geoToSvg((region.west + region.east) / 2, (region.north + region.south) / 2).x}
                          y={geoToSvg((region.west + region.east) / 2, (region.north + region.south) / 2).y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-sm font-semibold fill-gray-800 pointer-events-none"
                        >
                          {region.name}
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Coordinate labels */}
                  <g className="text-xs fill-gray-500">
                    {regions.map((region, index) => (
                      <g key={`coords-${index}`}>
                        <text x={geoToSvg(region.west, region.south).x} y={geoToSvg(region.west, region.south).y + 15}>
                          W: {region.west}°
                        </text>
                        <text x={geoToSvg(region.east, region.south).x} y={geoToSvg(region.east, region.south).y + 15}>
                          E: {region.east}°
                        </text>
                        <text x={geoToSvg(region.west, region.north).x} y={geoToSvg(region.west, region.north).y - 5}>
                          N: {region.north}°
                        </text>
                        <text x={geoToSvg(region.west, region.south).x} y={geoToSvg(region.west, region.south).y - 5}>
                          S: {region.south}°
                        </text>
                      </g>
                    ))}
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Region Information Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Region Details</h2>
              
              {regions.map((region, index) => (
                <div
                  key={index}
                  className={`mb-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedRegion === region.name
                      ? 'border-gray-800 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedRegion(selectedRegion === region.name ? null : region.name)}
                >
                  <div className="flex items-center mb-2">
                    <div
                      className="w-4 h-4 rounded mr-3"
                      style={{ backgroundColor: region.color }}
                    ></div>
                    <h3 className="font-semibold text-gray-900">{region.name}</h3>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>West:</strong> {region.west}°</div>
                    <div><strong>East:</strong> {region.east}°</div>
                    <div><strong>North:</strong> {region.north}°</div>
                    <div><strong>South:</strong> {region.south}°</div>
                  </div>
                  
                  {selectedRegion === region.name && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-700">
                        <div><strong>Width:</strong> {(region.east - region.west).toFixed(2)}°</div>
                        <div><strong>Height:</strong> {(region.north - region.south).toFixed(2)}°</div>
                        <div><strong>Area:</strong> {((region.east - region.west) * (region.north - region.south)).toFixed(2)} square degrees</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
                <p className="text-sm text-blue-800">
                  Click on any region in the map or the information panel to highlight it and view additional details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
