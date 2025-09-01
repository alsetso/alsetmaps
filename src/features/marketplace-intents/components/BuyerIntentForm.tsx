'use client';

import { useState, useEffect } from 'react';
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
import { 
  BuyerIntentData, 
  LocationPreference,
  PropertyCriteria,
  FinancialCriteria,
  PropertyType,
  FinancingType,
  Timeline,
  AgentPreference,
  InvestmentStrategy,
  PropertyCondition
} from '@/features/marketplace-intents/types/buyer-intent';
import { BuyerIntentService, PropertyMatch } from '@/features/marketplace-intents/services/buyer-intent-service';

// Form validation schema
const buyerIntentSchema = z.object({
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

type BuyerIntentFormData = z.infer<typeof buyerIntentSchema>;

const propertyTypeOptions: { value: PropertyType; label: string; icon: any }[] = [
  { value: 'single-family', label: 'Single Family', icon: HomeIcon },
  { value: 'multi-family', label: 'Multi-Family', icon: BuildingOfficeIcon },
  { value: 'condo', label: 'Condominium', icon: BuildingOfficeIcon },
  { value: 'townhouse', label: 'Townhouse', icon: BuildingOfficeIcon },
  { value: 'land', label: 'Land/Lot', icon: MapPinIcon },
  { value: 'commercial', label: 'Commercial', icon: BuildingOfficeIcon },
  { value: 'investment', label: 'Investment', icon: CurrencyDollarIcon },
  { value: 'fixer-upper', label: 'Fixer Upper', icon: HomeIcon },
  { value: 'new-construction', label: 'New Construction', icon: HomeIcon },
];

const conditionOptions: { value: PropertyCondition; label: string }[] = [
  { value: 'move-in-ready', label: 'Move-in Ready' },
  { value: 'minor-updates', label: 'Minor Updates' },
  { value: 'major-renovation', label: 'Major Renovation' },
  { value: 'tear-down', label: 'Tear Down' },
  { value: 'new-construction', label: 'New Construction' },
];

const financingOptions: { value: FinancingType; label: string; description: string }[] = [
  { value: 'cash', label: 'Cash', description: 'Full cash purchase' },
  { value: 'conventional', label: 'Conventional', description: 'Traditional mortgage' },
  { value: 'fha', label: 'FHA', description: 'Government-backed loan' },
  { value: 'va', label: 'VA', description: 'Veterans loan' },
  { value: 'usda', label: 'USDA', description: 'Rural development loan' },
  { value: 'hard-money', label: 'Hard Money', description: 'Short-term financing' },
  { value: 'private-money', label: 'Private Money', description: 'Private lender' },
  { value: 'seller-financing', label: 'Seller Financing', description: 'Owner financing' },
  { value: 'lease-option', label: 'Lease Option', description: 'Rent-to-own' },
];

const timelineOptions: { value: Timeline; label: string }[] = [
  { value: 'asap', label: 'ASAP' },
  { value: '1-3months', label: '1-3 Months' },
  { value: '3-6months', label: '3-6 Months' },
  { value: '6-12months', label: '6-12 Months' },
  { value: 'flexible', label: 'Flexible' },
  { value: 'investor', label: 'Investor Timeline' },
];

const agentOptions: { value: AgentPreference; label: string; description: string }[] = [
  { value: 'working-with-agent', label: 'Working with Agent', description: 'Already have representation' },
  { value: 'no-agent', label: 'No Agent', description: 'Direct purchase' },
  { value: 'need-agent-referral', label: 'Need Agent Referral', description: 'Looking for representation' },
  { value: 'open-to-agent', label: 'Open to Agent', description: 'Flexible on representation' },
];

const strategyOptions: { value: InvestmentStrategy; label: string; description: string }[] = [
  { value: 'primary-residence', label: 'Primary Residence', description: 'Home to live in' },
  { value: 'rental-income', label: 'Rental Income', description: 'Investment property' },
  { value: 'flip', label: 'Flip', description: 'Buy, renovate, sell' },
  { value: 'wholesale', label: 'Wholesale', description: 'Contract assignment' },
  { value: 'land-development', label: 'Land Development', description: 'Develop the land' },
  { value: 'commercial-use', label: 'Commercial Use', description: 'Business purposes' },
];

interface BuyerIntentFormProps {
  onIntentSubmitted?: (intent: BuyerIntentData) => void;
  onFindMatches?: (matches: PropertyMatch[]) => void;
}

export function BuyerIntentForm({ onIntentSubmitted, onFindMatches }: BuyerIntentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFinancingCalculator, setShowFinancingCalculator] = useState(false);
  const [financingResults, setFinancingResults] = useState<any>(null);
  const [marketInsights, setMarketInsights] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [mustHaveInput, setMustHaveInput] = useState('');
  const [dealBreakerInput, setDealBreakerInput] = useState('');

  const form = useForm<BuyerIntentFormData>({
    resolver: zodResolver(buyerIntentSchema),
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

  const onSubmit = async (data: BuyerIntentFormData) => {
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
          propertyType: data.propertyTypes as PropertyType[],
          condition: data.condition as PropertyCondition[],
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
          financingType: data.financingTypes as FinancingType[],
        },
        
        timeline: data.timeline as Timeline,
        agentPreference: data.agentPreference as AgentPreference,
        investmentStrategy: data.investmentStrategy as InvestmentStrategy,
        
        mustHaves: data.mustHaves,
        dealBreakers: data.dealBreakers,
        additionalNotes: data.additionalNotes,
        
        searchRadius: data.searchRadius,
        emailAlerts: data.emailAlerts,
        smsAlerts: data.smsAlerts,
        
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Submit intent
      const result = await BuyerIntentService.submitBuyerIntent(buyerIntent);
      
      if (result.success) {
        // Save locally
        await BuyerIntentService.saveBuyerIntent(buyerIntent);
        
        // Get market insights
        const insights = await BuyerIntentService.getMarketInsights(buyerIntent.locationPreference);
        setMarketInsights(insights);
        
        // Find matching properties
        const matches = await BuyerIntentService.findMatchingProperties(buyerIntent);
        
        // Callbacks
        onIntentSubmitted?.(buyerIntent);
        onFindMatches?.(matches);
        
        // Move to next step
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('Error submitting buyer intent:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateFinancing = () => {
    const price = form.getValues('maxPrice');
    const downPayment = form.getValues('downPayment') || 0;
    
    if (price && downPayment) {
      const results = BuyerIntentService.calculateFinancing(price, downPayment);
      setFinancingResults(results);
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
            We're analyzing your preferences and finding the best matches for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {marketInsights && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Market Insights for {form.getValues('city')}, {form.getValues('state')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-blue-700">Avg Price</div>
                  <div className="font-semibold">${marketInsights.averagePrice.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-blue-700">Price/Sqft</div>
                  <div className="font-semibold">${marketInsights.pricePerSqft}</div>
                </div>
                <div>
                  <div className="text-blue-700">Days on Market</div>
                  <div className="font-semibold">{marketInsights.daysOnMarket}</div>
                </div>
                <div>
                  <div className="text-blue-700">Market Trend</div>
                  <div className="font-semibold capitalize">{marketInsights.marketTrend}</div>
                </div>
              </div>
            </div>
          )}
          
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
              View Properties
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserIcon className="w-6 h-6 text-blue-600" />
              Contact Information
            </CardTitle>
            <CardDescription>
              How can we reach you about properties that match your criteria?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              Tell us about your preferred location and search area
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    {propertyTypeOptions.map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.value.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, option.value]);
                            } else {
                              field.onChange(field.value.filter(v => v !== option.value));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{option.label}</span>
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
                    {conditionOptions.map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.value.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, option.value]);
                            } else {
                              field.onChange(field.value.filter(v => v !== option.value));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{option.label}</span>
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
                    {financingOptions.map((option) => (
                      <label key={option.value} className="flex items-start space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.value.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, option.value]);
                            } else {
                              field.onChange(field.value.filter(v => v !== option.value));
                            }
                          }}
                          className="rounded border-gray-300 mt-1"
                        />
                        <div>
                          <div className="text-sm font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
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
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowFinancingCalculator(!showFinancingCalculator);
                    if (!showFinancingCalculator) {
                      calculateFinancing();
                    }
                  }}
                  className="w-full"
                >
                  <CalculatorIcon className="w-4 h-4 mr-2" />
                  {showFinancingCalculator ? 'Hide' : 'Show'} Payment Calculator
                </Button>
              </div>
            </div>

            {showFinancingCalculator && financingResults && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Estimated Monthly Payment</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Loan Amount</div>
                    <div className="font-semibold">${financingResults.loanAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Monthly Payment</div>
                    <div className="font-semibold">${financingResults.monthlyPayment.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Total Interest</div>
                    <div className="font-semibold">${financingResults.totalInterest.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Total Payment</div>
                    <div className="font-semibold">${financingResults.totalPayment.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}
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
                        {timelineOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
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
                        {agentOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
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
                        {strategyOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
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
                  <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {item}
                    <button
                      type="button"
                      onClick={() => removeDealBreaker(index)}
                      className="text-red-600 hover:text-red-800"
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

        {/* Submit Section */}
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
              'Submit Buyer Intent & Find Properties'
            )}
          </Button>
          
          <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto">
            By submitting this form, you agree to be contacted about properties that match your criteria. 
            Your information is secure and will only be used to help you find your perfect property.
          </p>
        </div>
      </form>
    </Form>
  );
}
