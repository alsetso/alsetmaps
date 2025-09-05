import { Metadata } from 'next'

export interface BaseMetadataConfig {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  siteName?: string
}

export interface PropertyMetadataConfig extends BaseMetadataConfig {
  propertyAddress?: string
  propertyType?: string
  listingPrice?: number
  bedrooms?: number
  bathrooms?: number
  squareFootage?: number
  estimatedValue?: number
  propertyId?: string
}

const DEFAULT_SITE_NAME = 'Alset Maps'
const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://alsetmaps.com'

/**
 * Generate dynamic metadata for static pages
 */
export function generateMetadata(config: BaseMetadataConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image,
    url,
    type = 'website',
    siteName = DEFAULT_SITE_NAME
  } = config

  const fullTitle = title ? `${title} | ${siteName}` : siteName
  const fullDescription = description || 'Transform your business with AI-powered automation, intelligent workflows, and autonomous agents.'
  const fullUrl = url ? `${DEFAULT_SITE_URL}${url}` : DEFAULT_SITE_URL
  const fullImage = image ? `${DEFAULT_SITE_URL}${image}` : `${DEFAULT_SITE_URL}/alset_emblem.svg`

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: keywords.join(', '),
    authors: [{ name: 'Alset Team' }],
    creator: 'Alset',
    publisher: 'Alset',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type,
      locale: 'en_US',
      url: fullUrl,
      title: fullTitle,
      description: fullDescription,
      siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [fullImage],
      creator: '@alset',
    },
    alternates: {
      canonical: fullUrl,
    },
    category: 'technology',
  }
}

/**
 * Generate metadata for property pages with custom data
 */
export function generatePropertyMetadata(config: PropertyMetadataConfig): Metadata {
  const {
    propertyAddress,
    propertyType,
    listingPrice,
    bedrooms,
    bathrooms,
    squareFootage,
    estimatedValue,
    propertyId,
    ...baseConfig
  } = config

  // Build dynamic title and description
  let title = baseConfig.title
  let description = baseConfig.description

  if (propertyAddress) {
    title = title || `Property at ${propertyAddress}`
    description = description || `View property details for ${propertyAddress}. ${propertyType ? `${propertyType} property` : 'Real estate listing'} with comprehensive market analysis and investment insights.`
  }

  if (listingPrice) {
    title = `${title} - $${listingPrice.toLocaleString()}`
    description = `${description} Listed at $${listingPrice.toLocaleString()}.`
  }

  if (bedrooms && bathrooms) {
    description = `${description} ${bedrooms} bed, ${bathrooms} bath property.`
  }

  if (squareFootage) {
    description = `${description} ${squareFootage.toLocaleString()} sq ft.`
  }

  if (estimatedValue) {
    description = `${description} Estimated value: $${estimatedValue.toLocaleString()}.`
  }

  // Add property-specific keywords
  const propertyKeywords = [
    'real estate',
    'property listing',
    'home for sale',
    'property details',
    'market analysis',
    'investment property',
    propertyType,
    propertyAddress?.split(',')[0], // City name
  ].filter(Boolean)

  const allKeywords = [...(baseConfig.keywords || []), ...propertyKeywords]

  return generateMetadata({
    ...baseConfig,
    title,
    description,
    keywords: allKeywords,
    type: 'article',
    url: propertyId ? `/property/${propertyId}` : baseConfig.url,
  })
}

/**
 * Predefined metadata configurations for common pages
 */
export const PAGE_METADATA = {
  home: {
    title: 'Alset Maps - AI-Powered Property Intelligence',
    description: 'Discover properties with AI-powered insights, market analysis, and investment opportunities. Transform your real estate experience with intelligent property data.',
    keywords: ['real estate', 'property search', 'AI', 'market analysis', 'investment', 'property intelligence'],
    url: '/',
  },
  dashboard: {
    title: 'Dashboard',
    description: 'Access your property portfolio, manage pins, view market insights, and track your real estate investments.',
    keywords: ['dashboard', 'property portfolio', 'market insights', 'real estate management'],
    url: '/dashboard',
  },
  buy: {
    title: 'Find Properties to Buy',
    description: 'Discover properties for sale with AI-powered market analysis, investment potential scoring, and comprehensive property insights.',
    keywords: ['buy property', 'property search', 'real estate investment', 'market analysis', 'property listings'],
    url: '/buy',
  },
  sell: {
    title: 'Sell Your Property',
    description: 'List your property for sale with professional market analysis, pricing insights, and AI-powered marketing tools.',
    keywords: ['sell property', 'property listing', 'real estate marketing', 'property valuation', 'home selling'],
    url: '/sell',
  },
  loans: {
    title: 'Property Loans & Financing',
    description: 'Explore financing options for your property investments with AI-powered loan matching and rate analysis.',
    keywords: ['property loans', 'real estate financing', 'mortgage', 'investment loans', 'property financing'],
    url: '/loans',
  },
  settings: {
    title: 'Account Settings',
    description: 'Manage your account preferences, notification settings, and profile information.',
    keywords: ['account settings', 'profile', 'preferences', 'notifications'],
    url: '/settings',
  },
  searchHistory: {
    title: 'Search History',
    description: 'View your property search history and saved searches for easy access to previously viewed properties.',
    keywords: ['search history', 'saved searches', 'property history', 'search tracking'],
    url: '/search-history',
  },
  login: {
    title: 'Sign In',
    description: 'Sign in to your Alset Maps account to access your property portfolio and AI-powered insights.',
    keywords: ['login', 'sign in', 'account access', 'authentication'],
    url: '/login',
  },
  register: {
    title: 'Create Account',
    description: 'Join Alset Maps to access AI-powered property intelligence, market analysis, and investment insights.',
    keywords: ['register', 'sign up', 'create account', 'join alset'],
    url: '/register',
  },
  verify: {
    title: 'Verify Account',
    description: 'Verify your email address to complete your Alset Maps account setup.',
    keywords: ['verify', 'email verification', 'account verification'],
    url: '/verify',
  },
  authCallback: {
    title: 'Authentication',
    description: 'Completing your authentication process...',
    keywords: ['authentication', 'login callback', 'oauth'],
    url: '/auth/callback',
  },
} as const

/**
 * Helper function to get metadata for a specific page
 */
export function getPageMetadata(page: keyof typeof PAGE_METADATA): Metadata {
  const config = PAGE_METADATA[page];
  return generateMetadata({
    ...config,
    keywords: [...config.keywords] // Convert readonly array to mutable array
  });
}
