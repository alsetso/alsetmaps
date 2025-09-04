import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { MapPin, Plus, Loader2 } from 'lucide-react';
import { PinCreationData } from '../types';

interface CreatePropertyPinProps {
  pinData: PinCreationData;
  onBack: () => void;
  onCreate: () => void;
  onNameChange: (name: string) => void;
  onImagesChange: (images: string[]) => void;
  onNotesChange: (notes: string) => void;
  isLoading: boolean;
}

export const CreatePropertyPin: React.FC<CreatePropertyPinProps> = ({
  pinData,
  onBack,
  onCreate,
  onNameChange,
  onImagesChange,
  onNotesChange,
  isLoading
}) => {
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-gray-200">
              <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-gray-900">Create Property Pin</CardTitle>
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              ← Back to Search
            </Button>
          </div>
        </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Location Display */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">
                  {pinData.address}
                </div>
                <div className="text-xs text-gray-500">
                  {pinData.searchType === 'basic' ? 'Basic' : 'Smart'} • {pinData.latitude.toFixed(4)}, {pinData.longitude.toFixed(4)}
                </div>
              </div>
            </div>
          </div>

          {/* Property Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Property Name *</label>
            <Input
              value={pinData.name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter property name..."
              className="w-full h-10 text-sm border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={pinData.notes || ''}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add property details..."
              className="w-full p-3 border border-gray-200 rounded-lg resize-none h-16 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>





          {/* Create Button */}
          <Button
            onClick={onCreate}
            disabled={isLoading}
            className="w-full h-10 text-sm font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Pin
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
