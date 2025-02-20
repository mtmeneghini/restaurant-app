'use client'

import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { OrderItemWithDetails, ItemStatus } from '../../types/orders'
import { colors, typography } from '../../styles/design-system'

export default function KitchenClient() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orderItems, setOrderItems] = useState<OrderItemWithDetails[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)

  useEffect(() => {
    const handleSidebarChange = (e: StorageEvent) => {
      if (e.key === 'sidebarExpanded') {
        setIsSidebarExpanded(e.newValue === 'true')
      }
    }

    const storedValue = localStorage.getItem('sidebarExpanded')
    setIsSidebarExpanded(storedValue === null ? true : storedValue === 'true')

    window.addEventListener('storage', handleSidebarChange)
    return () => window.removeEventListener('storage', handleSidebarChange)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    async function fetchOrderItems() {
      try {
        if (!user?.id) return

        // Get restaurant ID
        const { data: restaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (restaurantError) throw restaurantError

        // Fetch active order items that are not delivered
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            menu_item:menu_items (*),
            order:orders!inner (
              id,
              table:tables!inner (
                label
              )
            )
          `)
          .eq('order.restaurant_id', restaurant.id)
          .eq('order.status', 'active')
          .neq('item_status', 'delivered')
          .order('created_at', { ascending: true })

        if (itemsError) throw itemsError

        setOrderItems(items)
      } catch (error) {
        console.error('Error fetching order items:', error)
        setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      } finally {
        setLoadingData(false)
      }
    }

    fetchOrderItems()

    // Set up real-time subscription
    const channel = supabase
      .channel('kitchen-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items',
        },
        () => {
          fetchOrderItems()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user, loading, router])

  const handleStatusChange = async (itemId: string, newStatus: ItemStatus) => {
    try {
      const { error } = await supabase
        .from('order_items')
        .update({ item_status: newStatus })
        .eq('id', itemId)

      if (error) throw error

      setOrderItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, item_status: newStatus } : item
      ))
    } catch (error) {
      console.error('Error updating item status:', error)
      setError('Failed to update item status')
    }
  }

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div 
      className={`${isSidebarExpanded ? 'pl-52' : 'pl-14'} transition-all duration-300`}
      style={{ fontFamily: typography.fontFamily.primary }}
    >
      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-8">
          <h1 
            style={{ 
              fontSize: typography.headings.h2.fontSize,
              lineHeight: typography.headings.h2.lineHeight,
              fontWeight: typography.headings.h2.fontWeight,
              letterSpacing: typography.headings.h2.letterSpacing,
              color: colors.brand.primary
            }}
          >
            Cozinha
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Pending Column */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 
              className="mb-6 pb-4 border-b border-gray-200"
              style={{ 
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                color: colors.ui.gray[900]
              }}
            >
              Pendentes
            </h2>
            <div className="space-y-4">
              {orderItems
                .filter(item => item.item_status === 'pending')
                .map(item => (
                  <div 
                    key={item.id}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 
                        className="font-medium"
                        style={{ fontSize: typography.fontSize.base }}
                      >
                        {item.menu_item.name}
                      </h3>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">
                        Pendente
                      </span>
                    </div>
                    <p className="text-gray-500 mb-3" style={{ fontSize: typography.fontSize.sm }}>
                      Mesa {item.order?.table?.label || 'N/A'} • Qtd: {item.quantity}
                    </p>
                    {item.observations && (
                      <p className="text-gray-500 italic mb-3" style={{ fontSize: typography.fontSize.sm }}>
                        Obs: {item.observations}
                      </p>
                    )}
                    <button
                      onClick={() => handleStatusChange(item.id, 'preparing')}
                      className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      style={{ fontSize: typography.fontSize.sm }}
                    >
                      Iniciar Preparo
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Preparing Column */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 
              className="mb-6 pb-4 border-b border-gray-200"
              style={{ 
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                color: colors.ui.gray[900]
              }}
            >
              Preparando
            </h2>
            <div className="space-y-4">
              {orderItems
                .filter(item => item.item_status === 'preparing')
                .map(item => (
                  <div 
                    key={item.id}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 
                        className="font-medium"
                        style={{ fontSize: typography.fontSize.base }}
                      >
                        {item.menu_item.name}
                      </h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        Preparando
                      </span>
                    </div>
                    <p className="text-gray-500 mb-3" style={{ fontSize: typography.fontSize.sm }}>
                      Mesa {item.order?.table?.label || 'N/A'} • Qtd: {item.quantity}
                    </p>
                    {item.observations && (
                      <p className="text-gray-500 italic mb-3" style={{ fontSize: typography.fontSize.sm }}>
                        Obs: {item.observations}
                      </p>
                    )}
                    <button
                      onClick={() => handleStatusChange(item.id, 'ready')}
                      className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                      style={{ fontSize: typography.fontSize.sm }}
                    >
                      Marcar como Pronto
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Ready Column */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 
              className="mb-6 pb-4 border-b border-gray-200"
              style={{ 
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                color: colors.ui.gray[900]
              }}
            >
              Prontos
            </h2>
            <div className="space-y-4">
              {orderItems
                .filter(item => item.item_status === 'ready')
                .map(item => (
                  <div 
                    key={item.id}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 
                        className="font-medium"
                        style={{ fontSize: typography.fontSize.base }}
                      >
                        {item.menu_item.name}
                      </h3>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                        Pronto
                      </span>
                    </div>
                    <p className="text-gray-500 mb-3" style={{ fontSize: typography.fontSize.sm }}>
                      Mesa {item.order?.table?.label || 'N/A'} • Qtd: {item.quantity}
                    </p>
                    {item.observations && (
                      <p className="text-gray-500 italic mb-3" style={{ fontSize: typography.fontSize.sm }}>
                        Obs: {item.observations}
                      </p>
                    )}
                    <button
                      onClick={() => handleStatusChange(item.id, 'delivered')}
                      className="w-full px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      style={{ fontSize: typography.fontSize.sm }}
                    >
                      Marcar como Entregue
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 