import { Suspense } from 'react'
import NavigationHeader from '../../components/NavigationHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import MenuManagerClient from './MenuManagerClient'

export default async function MenuManagerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader selectionPath="Menu Manager" />
      <Suspense fallback={<LoadingSpinner />}>
        <MenuManagerClient />
      </Suspense>
    </div>
  )
} 