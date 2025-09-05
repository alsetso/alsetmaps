import { Metadata } from 'next'
import { generatePropertyMetadata } from '@/lib/metadata'
import { fetchSharedPropertyData, sharedPropertyDataToMetadataConfig } from '@/lib/property-metadata-service'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const propertyData = await fetchSharedPropertyData(params.id)
  
  if (!propertyData) {
    return generatePropertyMetadata({
      title: 'Shared Property Not Found',
      description: 'The requested shared property could not be found or is not publicly available.',
      url: `/shared/property/${params.id}`,
    })
  }

  const metadataConfig = sharedPropertyDataToMetadataConfig(propertyData)
  return generatePropertyMetadata(metadataConfig)
}

export default function SharedPropertyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
