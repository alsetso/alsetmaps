import { Metadata } from 'next'
import { generatePropertyMetadata } from '@/lib/metadata'
import { fetchPropertyData, propertyDataToMetadataConfig } from '@/lib/property-metadata-service'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const propertyData = await fetchPropertyData(params.id)
  
  if (!propertyData) {
    return generatePropertyMetadata({
      title: 'Property Not Found',
      description: 'The requested property could not be found.',
      url: `/property/${params.id}`,
    })
  }

  const metadataConfig = propertyDataToMetadataConfig(propertyData)
  return generatePropertyMetadata(metadataConfig)
}

export default function PropertyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
