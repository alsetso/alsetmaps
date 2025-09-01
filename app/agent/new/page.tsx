'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { NewAgentForm, NewAgentFormData } from '@/features/agents/components/NewAgentForm';
import { AgentsService } from '@/features/agents/services/agents-service';
import { useAuth } from '@/features/authentication/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function NewAgentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const handleSubmit = async (data: NewAgentFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Create the agent profile
      await AgentsService.createAgent(data, user?.id);
      
      setSubmitStatus('success');
      
      // Redirect to success page or show success message
      setTimeout(() => {
        router.push('/agents?status=pending');
      }, 3000);
      
    } catch (error) {
      console.error('Error creating agent profile:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create agent profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/agents');
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
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <CheckCircleIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Join Our Agent Network
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Create your professional agent profile and start receiving qualified leads from potential buyers and sellers in your area.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Success Message */}
          {submitStatus === 'success' && (
            <Card className="mb-8 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-green-800">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-lg">Profile Submitted Successfully!</h3>
                    <p className="text-green-700">
                      Your agent profile has been submitted and is under review. You'll be notified once it's approved.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {submitStatus === 'error' && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 text-red-800">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-lg">Submission Failed</h3>
                    <p className="text-red-700">{errorMessage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Agent Profile Information</CardTitle>
              <CardDescription>
                Fill out the form below to create your agent profile. All fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NewAgentForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                onCancel={handleCancel}
              />
            </CardContent>
          </Card>

          {/* Information Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Quick Approval</h3>
                <p className="text-gray-600 text-sm">
                  Most profiles are reviewed and approved within 24-48 hours
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Qualified Leads</h3>
                <p className="text-gray-600 text-sm">
                  Receive pre-screened leads from serious buyers and sellers
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Featured Opportunities</h3>
                <p className="text-gray-600 text-sm">
                  Get featured in our directory for increased visibility
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Process Information */}
          <Card className="mt-8 bg-gray-50">
            <CardHeader>
              <CardTitle className="text-xl">What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Profile Submission</h4>
                    <p className="text-gray-600 text-sm">
                      Your profile is submitted and enters our review queue
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Review Process</h4>
                    <p className="text-gray-600 text-sm">
                      Our team reviews your credentials and profile information
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Approval & Activation</h4>
                    <p className="text-gray-600 text-sm">
                      Once approved, your profile goes live and you start receiving leads
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SharedLayout>
  );
}
