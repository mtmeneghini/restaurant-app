import { Suspense } from 'react'
import NavigationHeader from '../../components/NavigationHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import KitchenClient from './KitchenClient'

export default function KitchenPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader selectionPath="Kitchen" />
      <Suspense fallback={<LoadingSpinner />}>
        <KitchenClient />
      </Suspense>
    </div>
  )
} 