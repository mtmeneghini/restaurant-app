'use client'

import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type RestaurantInfo = {
  name: string
  address: string
  contact: string
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null)
  const [loadingRestaurant, setLoadingRestaurant] = useState(true)

  useEffect(() => {
    async function fetchRestaurantInfo() {
      if (user) {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (data) {
          setRestaurantInfo(data)
        }
        setLoadingRestaurant(false)
      }
    }

    fetchRestaurantInfo()
  }, [user])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  if (loading || loadingRestaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Profile</h2>
          
          {/* User & Restaurant Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">User Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <input
                  type="text"
                  disabled
                  value={user.email}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-gray-600"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Restaurant Details</h3>
              {restaurantInfo ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Restaurant Name</label>
                    <input
                      type="text"
                      disabled
                      value={restaurantInfo.name}
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Address</label>
                    <input
                      type="text"
                      disabled
                      value={restaurantInfo.address}
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Contact</label>
                    <input
                      type="text"
                      disabled
                      value={restaurantInfo.contact}
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-gray-600"
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">No restaurant information available</p>
              )}
            </div>
          </div>
        </div>

        {/* Feature Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => handleNavigation('/menu-manager')}
            className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 border border-gray-200 rounded-lg shadow-sm transition-colors duration-200 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-xl">🍽️</span>
            <span>Menu Manager</span>
          </button>
          
          <button
            onClick={() => handleNavigation('/order-manager')}
            className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 border border-gray-200 rounded-lg shadow-sm transition-colors duration-200 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-xl">📋</span>
            <span>Order Manager</span>
          </button>
          
          <button
            onClick={() => handleNavigation('/insights')}
            className="bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 border border-gray-200 rounded-lg shadow-sm transition-colors duration-200 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-xl">📊</span>
            <span>Insights</span>
          </button>
        </div>

        {/* Sign Out Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
} 