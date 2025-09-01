'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/features/shared/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  BuildingOfficeIcon, 
  GlobeAltIcon,
  MapPinIcon,
  LanguageIcon,
  DocumentTextIcon,
  PhotoIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

// Form validation schema matching your database
const newAgentSchema = z.object({
  // Basic Information
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  
  // Professional Details
  company_name: z.string().optional(),
  license_number: z.string().optional(),
  license_state: z.string().optional(),
  
  // Service Information
  service_areas: z.array(z.string()).min(1, 'At least one service area is required'),
  languages: z.array(z.string()).optional(),
  
  // Profile Content
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(500, 'Bio must be less than 500 characters'),
  profile_image: z.string().optional(),
  cover_image: z.string().optional(),
  
  // Social Media
  website: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  facebook: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  
  // SEO
  slug: z.string().min(1, 'Profile URL is required').regex(/^[a-z0-9-]+$/, 'Profile URL can only contain lowercase letters, numbers, and hyphens'),
  search_keywords: z.array(z.string()).optional(),
});

export type NewAgentFormData = z.infer<typeof newAgentSchema>;

const stateOptions = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const languageOptions = [
  'English', 'Spanish', 'Mandarin', 'French', 'German', 'Italian',
  'Portuguese', 'Russian', 'Japanese', 'Korean', 'Arabic', 'Hindi'
];

interface NewAgentFormProps {
  onSubmit: (data: NewAgentFormData) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function NewAgentForm({ onSubmit, isSubmitting = false, onCancel }: NewAgentFormProps) {
  const [searchKeywords, setSearchKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');

  const form = useForm<NewAgentFormData>({
    resolver: zodResolver(newAgentSchema),
    defaultValues: {
      service_areas: [''],
      languages: ['English'],
      search_keywords: [],
      profile_image: '',
      cover_image: '',
      slug: '',
    },
  });

  // Add service area
  const addServiceArea = () => {
    const currentAreas = form.getValues('service_areas') || [];
    form.setValue('service_areas', [...currentAreas, '']);
  };

  // Remove service area
  const removeServiceArea = (index: number) => {
    const currentAreas = form.getValues('service_areas') || [];
    form.setValue('service_areas', currentAreas.filter((_, i) => i !== index));
  };

  // Add search keyword
  const addSearchKeyword = () => {
    if (newKeyword.trim() && !searchKeywords.includes(newKeyword.trim())) {
      const updatedKeywords = [...searchKeywords, newKeyword.trim()];
      setSearchKeywords(updatedKeywords);
      form.setValue('search_keywords', updatedKeywords);
      setNewKeyword('');
    }
  };

  // Remove search keyword
  const removeSearchKeyword = (keyword: string) => {
    const updatedKeywords = searchKeywords.filter(k => k !== keyword);
    setSearchKeywords(updatedKeywords);
    form.setValue('search_keywords', updatedKeywords);
  };

  const handleSubmit = async (data: NewAgentFormData) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserIcon className="w-6 h-6 text-blue-600" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Your personal and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input placeholder="john@example.com" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input placeholder="(555) 123-4567" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BuildingOfficeIcon className="w-6 h-6 text-green-600" />
              Professional Details
            </CardTitle>
            <CardDescription>
              Your real estate credentials and company information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Smith Realty Group" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="license_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="TX123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="license_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License State</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select State</option>
                        {stateOptions.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Service Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPinIcon className="w-6 h-6 text-purple-600" />
              Service Information
            </CardTitle>
            <CardDescription>
              Your service areas and language capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service Areas */}
            <div>
              <FormLabel>Service Areas *</FormLabel>
              <div className="space-y-2">
                {(form.watch('service_areas') || []).map((_area: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`service_areas.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Austin, TX" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      onClick={() => removeServiceArea(index)}
                      variant="outline"
                      size="sm"
                      className="px-3"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addServiceArea}
                  variant="outline"
                  size="sm"
                  className="px-4"
                >
                  Add Service Area
                </Button>
              </div>
              <FormMessage />
            </div>

            {/* Languages */}
            <div>
              <FormLabel className="flex items-center gap-2">
                <LanguageIcon className="w-4 h-4" />
                Languages Spoken
              </FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {languageOptions.map((language) => {
                  const currentLanguages = form.getValues('languages') || [];
                  const isSelected = currentLanguages.includes(language);
                  return (
                    <button
                      key={language}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          form.setValue('languages', currentLanguages.filter((l: string) => l !== language));
                        } else {
                          form.setValue('languages', [...currentLanguages, language]);
                        }
                      }}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {language}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <DocumentTextIcon className="w-6 h-6 text-orange-600" />
              Profile Content
            </CardTitle>
            <CardDescription>
              Your professional bio and profile images
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="profile_image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <PhotoIcon className="w-4 h-4" />
                      Profile Image URL
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/profile.jpg" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-gray-600">
                      Enter the URL of your professional headshot
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cover_image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <PhotoIcon className="w-4 h-4" />
                      Cover Image URL
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/cover.jpg" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-gray-600">
                      Enter the URL of your cover/banner image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Bio *</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell potential clients about your experience, specialties, and what makes you unique..."
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-gray-600">
                    {field.value?.length || 0}/500 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <LinkIcon className="w-6 h-6 text-indigo-600" />
              Social Media & Website
            </CardTitle>
            <CardDescription>
              Your online presence and professional links
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <GlobeAltIcon className="w-4 h-4" />
                      Website
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl>
                      <Input placeholder="https://facebook.com/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="https://instagram.com/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO & Discovery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <GlobeAltIcon className="w-6 h-6 text-teal-600" />
              SEO & Discovery
            </CardTitle>
            <CardDescription>
              Help potential clients find you online
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile URL */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile URL *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input 
                        placeholder="john-smith-austin" 
                        className="pl-10" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-sm text-gray-600">
                    This will be your public profile URL: alset-so.com/agents/{field.value || 'your-url'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Search Keywords */}
            <div>
              <FormLabel>Search Keywords</FormLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a keyword (e.g., luxury homes, first-time buyers)"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSearchKeyword())}
                  />
                  <Button
                    type="button"
                    onClick={addSearchKeyword}
                    variant="outline"
                    size="sm"
                    className="px-4"
                  >
                    Add
                  </Button>
                </div>
                {searchKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {searchKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-2"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeSearchKeyword(keyword)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <FormDescription className="text-sm text-gray-600">
                  Add keywords that potential clients might search for to find you
                </FormDescription>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="px-8 py-3"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold"
          >
            {isSubmitting ? 'Creating Profile...' : 'Create Agent Profile'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
