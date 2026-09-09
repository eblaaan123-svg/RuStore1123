import { RuStoreApp } from '@/components/rustore-app'
import { getHomeCollections } from '@/lib/rustore'

export const revalidate = 3600

export default async function Page() {
  const initialCollections = await getHomeCollections()
  return <RuStoreApp initialCollections={initialCollections} />
}
