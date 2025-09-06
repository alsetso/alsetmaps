'use client';

import { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { 
  CodeBracketIcon,
  PlayIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface DebugApiEditorProps {
  propertyId: string;
  onDataUpdate?: (data: any) => void;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
}

export function DebugApiEditor({ propertyId, onDataUpdate }: DebugApiEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [method, setMethod] = useState<'GET' | 'PUT' | 'POST' | 'DELETE'>('GET');
  const [endpoint, setEndpoint] = useState(`/api/pins/${propertyId}`);
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiCall = useCallback(async () => {
    if (!endpoint) {
      setError('Endpoint is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const options: RequestInit = {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method !== 'GET' && requestBody.trim()) {
        try {
          options.body = JSON.stringify(JSON.parse(requestBody));
        } catch (parseError) {
          setError('Invalid JSON in request body');
          setLoading(false);
          return;
        }
      }

      const apiResponse = await fetch(endpoint, options);
      const data = await apiResponse.json();

      setResponse({
        success: apiResponse.ok,
        data,
        error: apiResponse.ok ? undefined : data.error || data.message || 'Unknown error',
        status: apiResponse.status
      });

      // If this was a successful update, notify parent component
      if (apiResponse.ok && onDataUpdate) {
        onDataUpdate(data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      setResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Network error'
      });
    } finally {
      setLoading(false);
    }
  }, [method, endpoint, requestBody, onDataUpdate]);

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800';
    if (status >= 400 && status < 500) return 'bg-yellow-100 text-yellow-800';
    if (status >= 500) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const presetEndpoints = [
    { label: 'Get Property', method: 'GET' as const, endpoint: `/api/pins/${propertyId}` },
    { label: 'Update Property', method: 'PUT' as const, endpoint: `/api/pins/${propertyId}` },
    { label: 'Update Visibility', method: 'PUT' as const, endpoint: `/api/pins/${propertyId}/visibility` },
    { label: 'Update Sharing', method: 'PUT' as const, endpoint: `/api/pins/${propertyId}/sharing` },
    { label: 'Update Terms', method: 'PUT' as const, endpoint: `/api/pins/${propertyId}/terms` },
    { label: 'Make Public', method: 'PUT' as const, endpoint: `/api/pins/${propertyId}/make-public` },
  ];

  const presetBodies = {
    'Update Property': JSON.stringify({
      name: "Updated Property Name",
      notes: "Updated notes",
      is_for_sale: true,
      listing_price: 500000
    }, null, 2),
    'Update Visibility': JSON.stringify({
      is_public: true
    }, null, 2),
    'Update Sharing': JSON.stringify({
      isPublic: true,
      seoTitle: "Custom SEO Title",
      seoDescription: "Custom SEO Description",
      allowInquiries: true,
      contactMethod: "email"
    }, null, 2),
    'Update Terms': JSON.stringify({
      requiresTermsAgreement: true,
      customTerms: "Custom terms and conditions"
    }, null, 2),
  };

  const handlePresetSelect = (preset: typeof presetEndpoints[0]) => {
    setMethod(preset.method);
    setEndpoint(preset.endpoint);
    
    const bodyKey = preset.label as keyof typeof presetBodies;
    if (presetBodies[bodyKey]) {
      setRequestBody(presetBodies[bodyKey]);
    } else {
      setRequestBody('');
    }
  };

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CodeBracketIcon className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg text-orange-900">Debug API Editor</CardTitle>
            <Badge variant="outline" className="text-orange-700 border-orange-300">
              Development
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-orange-700 hover:text-orange-900"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Preset Endpoints */}
          <div>
            <Label className="text-sm font-medium text-orange-900 mb-2 block">
              Quick Actions
            </Label>
            <div className="flex flex-wrap gap-2">
              {presetEndpoints.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetSelect(preset)}
                  className="text-orange-700 border-orange-300 hover:bg-orange-100"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Request Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="method" className="text-sm font-medium text-orange-900">
                HTTP Method
              </Label>
              <Select value={method} onValueChange={(value: any) => setMethod(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="endpoint" className="text-sm font-medium text-orange-900">
                Endpoint
              </Label>
              <Input
                id="endpoint"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="/api/pins/..."
                className="mt-1"
              />
            </div>
          </div>

          {/* Request Body */}
          {method !== 'GET' && (
            <div>
              <Label htmlFor="body" className="text-sm font-medium text-orange-900">
                Request Body (JSON)
              </Label>
              <Textarea
                id="body"
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder='{"key": "value"}'
                className="mt-1 font-mono text-sm"
                rows={6}
              />
            </div>
          )}

          {/* Execute Button */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleApiCall}
              disabled={loading || !endpoint}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <PlayIcon className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Executing...' : 'Execute Request'}
            </Button>
            
            {error && (
              <div className="flex items-center space-x-1 text-red-600">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          {/* Response */}
          {response && (
            <div className="border rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Response</h4>
                <div className="flex items-center space-x-2">
                  {response.status && (
                    <Badge className={getStatusColor(response.status)}>
                      {response.status}
                    </Badge>
                  )}
                  <Badge className={response.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {response.success ? (
                      <>
                        <CheckIcon className="h-3 w-3 mr-1" />
                        Success
                      </>
                    ) : (
                      <>
                        <XMarkIcon className="h-3 w-3 mr-1" />
                        Error
                      </>
                    )}
                  </Badge>
                </div>
              </div>

              {response.error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  <div className="flex items-center space-x-1">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <span className="font-medium">Error:</span>
                  </div>
                  <p className="mt-1">{response.error}</p>
                </div>
              )}

              {response.data && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Response Data:
                  </Label>
                  <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto border">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded">
            <InformationCircleIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Debug API Editor</p>
              <p className="mt-1">
                This tool allows you to test API endpoints directly. Use the quick actions above for common operations,
                or customize the request manually. All requests include authentication cookies.
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
