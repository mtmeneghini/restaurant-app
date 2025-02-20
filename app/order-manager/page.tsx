import { Suspense } from 'react'
import NavigationHeader from '../../components/NavigationHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import OrderManagerClient from './OrderManagerClient'

export default async function OrderManagerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader selectionPath="Order Manager" />
      <Suspense fallback={<LoadingSpinner />}>
        <OrderManagerClient />
      </Suspense>
    </div>
  )
} 