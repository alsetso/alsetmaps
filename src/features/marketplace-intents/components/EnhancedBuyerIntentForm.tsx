'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/features/shared/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  HomeIcon, 
  UserIcon, 
  BuildingOfficeIcon, 
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  XMarkIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { BuyerIntentData } from '@/features/marketplace-intents/types/buyer-intent';
import { BuyerIntentService } from '@/features/marketplace-intents/services/buyer-intent-service';

// Enhanced form validation schema
const enhancedBuyerIntentSchema = z.object({
  contactName: z.string().min(1, 'Contact name is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().min(10, 'Valid phone number is required'),
  
  // Location
  specificAddress: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().optional(),
  searchRadius: z.number().min(1).max(100),
  
  // Property Criteria
  propertyTypes: z.array(z.string()).min(1, 'Select at least one property type'),
  condition: z.array(z.string()).min(1, 'Select at least one condition'),
  minBeds: z.number().optional(),
  maxBeds: z.number().optional(),
  minBaths: z.number().optional(),
  maxBaths: z.number().optional(),
  minSqft: z.number().optional(),
  maxSqft: z.number().optional(),
  
  // Financial
  maxPrice: z.number().min(10000, 'Maximum price must be at least $10,000'),
  minPrice: z.number().optional(),
  downPayment: z.number().optional(),
  financingTypes: z.array(z.string()).min(1, 'Select at least one financing type'),
  
  // Intent
  timeline: z.string(),
  agentPreference: z.string(),
  investmentStrategy: z.string(),
  
  // Additional
  mustHaves: z.array(z.string()),
  dealBreakers: z.array(z.string()),
  additionalNotes: z.string().optional(),
  
  // Preferences
  emailAlerts: z.boolean(),
  smsAlerts: z.boolean(),
});

type EnhancedBuyerIntentFormData = z.infer<typeof enhancedBuyerIntentSchema>;

const buyerTypeOptions: { value: string; label: string; icon: any; description: string }[] = [
  { value: 'family', label: 'Family', icon: HomeIcon, description: 'Looking for a home to live in' },
  { value: 'investor', label: 'Investor', icon: BuildingOfficeIcon, description: 'Building investment portfolio' },
  { value: 'wholesaler', label: 'Wholesaler', icon: MagnifyingGlassIcon, description: 'Finding deals for other buyers' },
  { value: 'developer', label: 'Developer', icon: BuildingOfficeIcon, description: 'Land development projects' },
  { value: 'agent', label: 'Agent', icon: UserIcon, description: 'Representing clients' },
  { value: 'other', label: 'Other', icon: UserIcon, description: 'Other buying purpose' },
];

const locationScopeOptions: { value: string; label: string; description: string }[] = [
  { value: 'specific_address', label: 'Specific Address', description: 'Looking for a particular property or area' },
  { value: 'city_level', label: 'City Level', description: 'Open to properties throughout the city' },
  { value: 'neighborhood', label: 'Neighborhood', description: 'Specific neighborhood or district' },
  { value: 'county', label: 'County', description: 'Wider area search' },
  { value: 'state', label: 'State', description: 'State-wide search' },
];

const urgencyLevelOptions: { value: string; label: string; description: string }[] = [
  { value: 'low', label: 'Low', description: 'No rush, exploring options' },
  { value: 'medium', label: 'Medium', description: 'Ready to buy within timeline' },
  { value: 'high', label: 'High', description: 'Need to find property soon' },
  { value: 'urgent', label: 'Urgent', description: 'Need to close quickly' },
];

const listingVisibilityOptions: { value: string; label: string; description: string }[] = [
  { value: 'public', label: 'Public', description: 'Visible to everyone' },
  { value: 'private', label: 'Private', description: 'Only visible to you' },
  { value: 'agent_only', label: 'Agent Only', description: 'Visible to agents only' },
];

interface EnhancedBuyerIntentFormProps {
  onIntentSubmitted?: (intent: any) => void;
  onFindMatches?: (matches: any[]) => void;
}

export function EnhancedBuyerIntentForm({ onIntentSubmitted, onFindMatches }: EnhancedBuyerIntentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [mustHaveInput, setMustHaveInput] = useState('');
  const [dealBreakerInput, setDealBreakerInput] = useState('');

  const form = useForm<EnhancedBuyerIntentFormData>({
    resolver: zodResolver(enhancedBuyerIntentSchema),
    defaultValues: {
      searchRadius: 25,
      propertyTypes: ['single-family'],
      condition: ['move-in-ready'],
      financingTypes: ['conventional'],
      timeline: 'flexible',
      agentPreference: 'open-to-agent',
      investmentStrategy: 'primary-residence',
      mustHaves: [],
      dealBreakers: [],
      emailAlerts: true,
      smsAlerts: false,
    },
  });

  const onSubmit = async (data: EnhancedBuyerIntentFormData) => {
    setIsSubmitting(true);
    
    try {
      // Transform form data to BuyerIntentData
      const buyerIntent: BuyerIntentData = {
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        
        locationPreference: {
          specificAddress: data.specificAddress,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          radius: data.searchRadius,
        },
        
        propertyCriteria: {
          propertyType: data.propertyTypes as any[],
          condition: data.condition as any[],
          minBeds: data.minBeds,
          maxBeds: data.maxBeds,
          minBaths: data.minBaths,
          maxBaths: data.maxBaths,
          minSqft: data.minSqft,
          maxSqft: data.maxSqft,
        },
        
        financialCriteria: {
          maxPrice: data.maxPrice,
          minPrice: data.minPrice,
          downPayment: data.downPayment,
          financingType: data.financingTypes as any[],
        },
        
        timeline: data.timeline as any,
        agentPreference: data.agentPreference as any,
        investmentStrategy: data.investmentStrategy as any,
        
        mustHaves: data.mustHaves,
        dealBreakers: data.dealBreakers,
        additionalNotes: data.additionalNotes,
        
        searchRadius: data.searchRadius,
        emailAlerts: data.emailAlerts,
        smsAlerts: data.smsAlerts,
        
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await BuyerIntentService.submitBuyerIntent(buyerIntent);
      
      if (result.success) {
        onIntentSubmitted?.(buyerIntent);
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Error submitting buyer intent:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addMustHave = () => {
    if (mustHaveInput.trim()) {
      const current = form.getValues('mustHaves');
      form.setValue('mustHaves', [...current, mustHaveInput.trim()]);
      setMustHaveInput('');
    }
  };

  const removeMustHave = (index: number) => {
    const current = form.getValues('mustHaves');
    form.setValue('mustHaves', current.filter((_, i) => i !== index));
  };

  const addDealBreaker = () => {
    if (dealBreakerInput.trim()) {
      const current = form.getValues('dealBreakers');
      form.setValue('dealBreakers', [...current, dealBreakerInput.trim()]);
      setDealBreakerInput('');
    }
  };

  const removeDealBreaker = (index: number) => {
    const current = form.getValues('dealBreakers');
    form.setValue('dealBreakers', current.filter((_, i) => i !== index));
  };

  if (currentStep === 2) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-800">Buyer Intent Submitted!</CardTitle>
          <CardDescription className="text-lg">
            Your enhanced buyer intent has been submitted successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <Button 
              onClick={() => setCurrentStep(1)}
              variant="outline"
              className="mr-2"
            >
              Edit Intent
            </Button>
            <Button 
              onClick={() => window.location.href = '/buy'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              View Directory
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Buyer Type & Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserIcon className="w-6 h-6 text-blue-600" />
              Who Are You & What Are You Looking For?
            </CardTitle>
            <CardDescription>
              Tell us about yourself and your buying goals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
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
            
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
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
          </CardContent>
        </Card>

        {/* Location Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPinIcon className="w-6 h-6 text-blue-600" />
              Where Do You Want to Buy?
            </CardTitle>
            <CardDescription>
              Define your search area and location preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="specificAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Address (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State *</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="searchRadius"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search Radius: {field.value} miles</FormLabel>
                  <FormControl>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Property Criteria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <HomeIcon className="w-6 h-6 text-blue-600" />
              What Are You Looking For?
            </CardTitle>
            <CardDescription>
              Describe your ideal property
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="propertyTypes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Types</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['single-family', 'multi-family', 'condo', 'townhouse', 'land', 'commercial', 'investment', 'fixer-upper', 'new-construction'].map((type) => (
                      <label key={type} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.value.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, type]);
                            } else {
                              field.onChange(field.value.filter(v => v !== type));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm capitalize">{type.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Condition</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['move-in-ready', 'minor-updates', 'major-renovation', 'tear-down', 'new-construction'].map((condition) => (
                      <label key={condition} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.value.includes(condition)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, condition]);
                            } else {
                              field.onChange(field.value.filter(v => v !== condition));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm capitalize">{condition.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="minBeds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Beds</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Any" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxBeds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Beds</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Any" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minBaths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Baths</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Any" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxBaths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Baths</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Any" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minSqft"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Square Feet</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Any" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxSqft"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Square Feet</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Any" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Criteria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
              Financial Information
            </CardTitle>
            <CardDescription>
              Your budget and financing preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Price *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input 
                          type="number" 
                          placeholder="500,000" 
                          className="pl-10"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Price (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input 
                          type="number" 
                          placeholder="200,000" 
                          className="pl-10"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="financingTypes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Financing Options</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['cash', 'conventional', 'fha', 'va', 'usda', 'hard-money', 'private-money', 'seller-financing', 'lease-option'].map((type) => (
                      <label key={type} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.value.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, type]);
                            } else {
                              field.onChange(field.value.filter(v => v !== type));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm capitalize">{type.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="downPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Down Payment (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input 
                          type="number" 
                          placeholder="100,000" 
                          className="pl-10"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Buying Intent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
              Buying Intent & Timeline
            </CardTitle>
            <CardDescription>
              When and how do you plan to buy?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeline to Buy</FormLabel>
                    <FormControl>
                      <select 
                        {...field}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {['asap', '1-3months', '3-6months', '6-12months', 'flexible', 'investor'].map((timeline) => (
                          <option key={timeline} value={timeline}>
                            {timeline === 'asap' ? 'ASAP' : 
                             timeline === '1-3months' ? '1-3 Months' :
                             timeline === '3-6months' ? '3-6 Months' :
                             timeline === '6-12months' ? '6-12 Months' :
                             timeline === 'flexible' ? 'Flexible' :
                             'Investor Timeline'}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agentPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Preference</FormLabel>
                    <FormControl>
                      <select 
                        {...field}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {['working-with-agent', 'no-agent', 'need-agent-referral', 'open-to-agent'].map((pref) => (
                          <option key={pref} value={pref}>
                            {pref === 'working-with-agent' ? 'Working with Agent' :
                             pref === 'no-agent' ? 'No Agent' :
                             pref === 'need-agent-referral' ? 'Need Agent Referral' :
                             'Open to Agent'}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="investmentStrategy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Strategy</FormLabel>
                    <FormControl>
                      <select 
                        {...field}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {['primary-residence', 'rental-income', 'flip', 'wholesale', 'land-development', 'commercial-use'].map((strategy) => (
                          <option key={strategy} value={strategy}>
                            {strategy === 'primary-residence' ? 'Primary Residence' :
                             strategy === 'rental-income' ? 'Rental Income' :
                             strategy === 'flip' ? 'Flip' :
                             strategy === 'wholesale' ? 'Wholesale' :
                             strategy === 'land-development' ? 'Land Development' :
                             'Commercial Use'}
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

        {/* Must Haves & Deal Breakers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <HeartIcon className="w-6 h-6 text-blue-600" />
              Must Haves & Deal Breakers
            </CardTitle>
            <CardDescription>
              What's essential and what's a no-go?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <FormLabel>Must Haves</FormLabel>
              <div className="flex gap-2 mb-2">
                <Input
                  value={mustHaveInput}
                  onChange={(e) => setMustHaveInput(e.target.value)}
                  placeholder="e.g., garage, pool, basement"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMustHave())}
                />
                <Button type="button" onClick={addMustHave} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.watch('mustHaves').map((item, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeMustHave(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <FormLabel>Deal Breakers</FormLabel>
              <div className="flex gap-2 mb-2">
                <Input
                  value={dealBreakerInput}
                  onChange={(e) => setDealBreakerInput(e.target.value)}
                  placeholder="e.g., busy street, no parking, HOA fees"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDealBreaker())}
                />
                <Button type="button" onClick={addDealBreaker} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.watch('dealBreakers').map((item, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeDealBreaker(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Any other details about what you're looking for..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Search Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MagnifyingGlassIcon className="w-6 h-6 text-blue-600" />
              Search Preferences
            </CardTitle>
            <CardDescription>
              How would you like to receive property updates?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="emailAlerts"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="rounded border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">Email alerts for new properties</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="smsAlerts"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="rounded border-gray-300"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">SMS alerts for urgent opportunities</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="text-center">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </div>
            ) : (
              'Submit Enhanced Buyer Intent'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
