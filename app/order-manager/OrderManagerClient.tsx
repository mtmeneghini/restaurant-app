'use client'

import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { OrderWithDetails, OrderStatus, ItemStatus, Table, TableStatus } from '../../types/orders'
import { colors, typography } from '../../styles/design-system'
import { PlusIcon, EllipsisVerticalIcon, MagnifyingGlassIcon, FunnelIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import ConfirmDialog from '../../components/ConfirmDialog'
import TableManager from '../../components/TableManager'
import OrderList from '../../components/OrderList'
import HowItWorksModal from '../../components/HowItWorksModal'

export default function OrderManagerClient() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [menuItems, setMenuItems] = useState<Array<{ 
    id: string
    name: string
    price: number
    group_id: string 
  }>>([])
  const [menuGroups, setMenuGroups] = useState<Array<{ id: string; name: string }>>([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [activeDropdowns, setActiveDropdowns] = useState<Set<string>>(new Set())
  
  // Modal states
  const [isTableModalOpen, setIsTableModalOpen] = useState(false)
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  
  // Form states
  const [tableForm, setTableForm] = useState({ label: '' })
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null)
  const [itemForm, setItemForm] = useState({
    menuItemId: '',
    quantity: 1,
    observations: ''
  })
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
  const [isHowItWorksModalOpen, setIsHowItWorksModalOpen] = useState(false)

  const toggleDropdown = (id: string) => {
    setActiveDropdowns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdowns.size > 0) {
        const dropdowns = document.querySelectorAll('.dropdown-content')
        let clickedInside = false
        
        dropdowns.forEach(dropdown => {
          if (dropdown.contains(event.target as Node) || 
              (event.target as Element).closest('.dropdown-trigger')) {
            clickedInside = true
          }
        })
        
        if (!clickedInside) {
          setActiveDropdowns(new Set())
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeDropdowns])

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

  // Fetch initial data
  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    async function fetchRestaurantAndData() {
      try {
        if (!user?.id) {
          setError('User not authenticated')
          return
        }

        // Get restaurant ID
        const { data: restaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (restaurantError) {
          console.error('Restaurant fetch error:', restaurantError)
          setError(`Failed to fetch restaurant: ${restaurantError.message}`)
          return
        }

        if (!restaurant) {
          setError('No restaurant found for this user')
          return
        }

          setRestaurantId(restaurant.id)

        // Fetch menu groups and items
        const { data: menuGroupsData, error: menuGroupsError } = await supabase
          .from('menu_groups')
          .select(`
            id,
            name,
            menu:menu_id (
              restaurant_id
            )
          `)
          .eq('menu.restaurant_id', restaurant.id)
          .order('name', { ascending: true })

        if (menuGroupsError) {
          console.error('Menu groups fetch error:', menuGroupsError)
          setError(`Failed to fetch menu groups: ${menuGroupsError.message}`)
          return
        }

        setMenuGroups(menuGroupsData || [])

        // Fetch menu items
        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from('menu_items')
          .select(`
            id,
            name,
            price,
            group_id,
            group:group_id (
              menu:menu_id (
                restaurant_id
              )
            )
          `)
          .eq('group.menu.restaurant_id', restaurant.id)
          .order('name', { ascending: true })

        if (menuItemsError) {
          console.error('Menu items fetch error:', menuItemsError)
          setError(`Failed to fetch menu items: ${menuItemsError.message}`)
          return
        }

        setMenuItems(menuItemsData || [])

          // Fetch tables
          const { data: tablesData, error: tablesError } = await supabase
            .from('tables')
            .select('*')
            .eq('restaurant_id', restaurant.id)
          .order('created_at', { ascending: true })

        if (tablesError) {
          console.error('Tables fetch error:', tablesError)
          setError(`Failed to fetch tables: ${tablesError.message}`)
          return
        }

        setTables(tablesData || [])

        // Fetch orders with details
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select(`
              *,
            table:tables!inner (*),
            items:order_items (
              *,
              menu_item:menu_items (*)
            )
          `)
          .eq('table.restaurant_id', restaurant.id)
            .order('created_at', { ascending: false })

        if (ordersError) {
          console.error('Orders fetch error:', ordersError)
          setError(`Failed to fetch orders: ${ordersError.message}`)
          return
        }

        setOrders(ordersData as OrderWithDetails[] || [])
      } catch (error) {
        console.error('Unexpected error:', error)
        setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      } finally {
        setLoadingData(false)
      }
    }

    fetchRestaurantAndData()
  }, [user, router])

  // Table CRUD operations
  const handleCreateTable = async () => {
    if (!restaurantId || !tableForm.label.trim()) return

    try {
      const { data, error } = await supabase
        .from('tables')
        .insert([{
          restaurant_id: restaurantId,
          label: tableForm.label,
          status: 'available' as TableStatus
        }])
        .select()
        .single()

      if (error) throw error

      setTables(prev => [...prev, data])
      setTableForm({ label: '' })
      setIsTableModalOpen(false)
    } catch (error) {
      console.error('Error creating table:', error)
      setError('Failed to create table')
    }
  }

  const handleUpdateTable = async (tableId: string, newLabel: string) => {
    try {
      const { error } = await supabase
        .from('tables')
        .update({ label: newLabel })
        .eq('id', tableId)

      if (error) throw error

      // Update tables state
      setTables(prev => prev.map(table =>
        table.id === tableId ? { ...table, label: newLabel } : table
      ))

      // Update orders state to reflect the new table label
      setOrders(prev => prev.map(order => {
        if (order.table.id === tableId) {
          return {
            ...order,
            table: {
              ...order.table,
              label: newLabel
            }
          }
        }
        return order
      }))

      setSelectedTable(null)
      setTableForm({ label: '' })
      setIsTableModalOpen(false)
    } catch (error) {
      console.error('Error updating table:', error)
      setError('Failed to update table')
    }
  }

  const handleDeleteTable = async (tableId: string) => {
    try {
      // Check if table has active orders
      const hasActiveOrders = orders.some(order => 
        order.table.id === tableId && order.status === 'active'
      )

      if (hasActiveOrders) {
        setConfirmDialog({
          isOpen: true,
          title: 'Excluir Mesa com Pedidos Ativos',
          message: 'Esta mesa possui pedidos ativos. Excluir a mesa também excluirá todos os pedidos associados. Deseja continuar?',
          onConfirm: async () => {
            try {
              // First, close all active orders for this table
              const activeOrders = orders.filter(order => 
                order.table.id === tableId && order.status === 'active'
              )

              for (const order of activeOrders) {
                const { error: orderError } = await supabase
                  .from('orders')
                  .update({ status: 'closed' })
                  .eq('id', order.id)

                if (orderError) throw orderError
              }

              // Then delete the table
              const { error: tableError } = await supabase
                .from('tables')
                .delete()
                .eq('id', tableId)

              if (tableError) throw tableError

              // Update local state
              setTables(prev => prev.filter(table => table.id !== tableId))
              setOrders(prev => prev.filter(order => order.table.id !== tableId))
              
              if (selectedTable?.id === tableId) {
                setSelectedTable(null)
              }
            } catch (error) {
              console.error('Error deleting table:', error)
              setError('Failed to delete table and associated orders')
            }
          }
        })
        return
      }

      // If no active orders, proceed with normal deletion
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', tableId)

      if (error) throw error

      setTables(prev => prev.filter(table => table.id !== tableId))
      setOrders(prev => prev.filter(order => order.table.id !== tableId))
      
      if (selectedTable?.id === tableId) {
        setSelectedTable(null)
      }
    } catch (error) {
      console.error('Error deleting table:', error)
      setError('Failed to delete table')
    }
  }

  // Order CRUD operations
  const handleCreateOrder = async () => {
    if (!selectedTable || !restaurantId) return

    try {
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([{
          restaurant_id: restaurantId,
          table_id: selectedTable.id,
          status: 'active' as OrderStatus,
          total_amount: 0
        }])
        .select(`
          *,
          table:tables (*),
          items:order_items (
            *,
            menu_item:menu_items (*)
          )
        `)
        .single()

      if (orderError) throw orderError

      // Update table status
      const { error: tableError } = await supabase
        .from('tables')
        .update({ status: 'occupied' as TableStatus })
        .eq('id', selectedTable.id)

      if (tableError) throw tableError
      
      setOrders(prev => [newOrder, ...prev])
      setTables(prev => prev.map(table => 
        table.id === selectedTable.id ? { ...table, status: 'occupied' } : table
      ))
      setSelectedTable(prev => prev ? { ...prev, status: 'occupied' } : null)
      setIsCreateOrderModalOpen(false)
    } catch (error) {
      console.error('Error creating order:', error)
      setError('Failed to create order')
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))

      // If order is closed, update table status
      if (newStatus === 'closed') {
        const order = orders.find(o => o.id === orderId)
        if (order) {
          const { error: tableError } = await supabase
            .from('tables')
            .update({ status: 'available' as TableStatus })
            .eq('id', order.table_id)

          if (tableError) throw tableError

          setTables(prev => prev.map(table =>
            table.id === order.table_id ? { ...table, status: 'available' } : table
          ))
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      setError('Failed to update order status')
    }
  }

  // Order Item CRUD operations
  const handleAddItem = async (orderId: string) => {
    if (!itemForm.menuItemId || itemForm.quantity < 1) return

    try {
      // Get the menu item with its price
      const { data: menuItem, error: menuItemError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', itemForm.menuItemId)
        .single()

      if (menuItemError) {
        console.error('Error fetching menu item:', menuItemError)
        setError(`Failed to fetch menu item: ${menuItemError.message}`)
        return
      }

      if (!menuItem) {
        setError('Menu item not found')
        return
      }

      // Insert the new order item
      const { data: newItem, error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: orderId,
          menu_item_id: itemForm.menuItemId,
          quantity: itemForm.quantity,
          observations: itemForm.observations,
          item_status: 'pending',
          unit_price: menuItem.price
        })
        .select(`
          *,
          menu_item:menu_items (*)
        `)
        .single()

      if (itemError) {
        console.error('Error creating order item:', itemError)
        setError(`Failed to create order item: ${itemError.message}`)
        return
      }

      // Get current order to update total
      const { data: currentOrder, error: orderError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('id', orderId)
        .single()

      if (orderError) {
        console.error('Error fetching order:', orderError)
        setError(`Failed to fetch order: ${orderError.message}`)
        return
      }

      // Calculate new total
      const itemTotal = menuItem.price * itemForm.quantity
      const newTotal = (currentOrder.total_amount || 0) + itemTotal

      // Update order total
      const { error: updateError } = await supabase
        .from('orders')
        .update({ total_amount: newTotal })
        .eq('id', orderId)

      if (updateError) {
        console.error('Error updating order total:', updateError)
        setError(`Failed to update order total: ${updateError.message}`)
        return
      }

      // Update local state
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            items: [...order.items, newItem],
            total_amount: newTotal
          }
        }
        return order
      }))

      // Reset form and close modal
      setItemForm({ menuItemId: '', quantity: 1, observations: '' })
      setSelectedGroup(null)
      setIsAddItemModalOpen(false)
    } catch (error) {
      console.error('Error adding item:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    }
  }

  const handleUpdateItemStatus = async (itemId: string, newStatus: ItemStatus) => {
    try {
      const { error } = await supabase
        .from('order_items')
        .update({ item_status: newStatus })
        .eq('id', itemId)

      if (error) throw error

      setOrders(prev => prev.map(order => ({
        ...order,
        items: order.items.map(item =>
          item.id === itemId ? { ...item, item_status: newStatus } : item
        )
      })))
    } catch (error) {
      console.error('Error updating item status:', error)
      setError('Failed to update item status')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      // Find the order and item to calculate new total
      const orderItem = orders.flatMap(order => order.items).find(item => item.id === itemId)
      if (!orderItem) {
        throw new Error('Item not found')
      }

      const order = orders.find(order => order.items.some(item => item.id === itemId))
      if (!order) {
        throw new Error('Order not found')
      }

      // Calculate new total
      const itemTotal = orderItem.menu_item.price * orderItem.quantity
      const newTotal = order.total_amount - itemTotal

      // Delete the item
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('id', itemId)

      if (deleteError) throw deleteError

      // Update order total
      const { error: updateError } = await supabase
        .from('orders')
        .update({ total_amount: newTotal })
        .eq('id', order.id)

      if (updateError) throw updateError

      // Update local state
      setOrders(prev => prev.map(o => {
        if (o.id === order.id) {
          return {
            ...o,
            items: o.items.filter(item => item.id !== itemId),
            total_amount: newTotal
          }
        }
        return o
      }))
    } catch (error) {
      console.error('Error deleting item:', error)
      setError('Failed to delete item')
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    try {
      // First delete all items in the order
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId)

      if (itemsError) throw itemsError

      // Then delete the order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (orderError) throw orderError

      // Update local state
      const order = orders.find(o => o.id === orderId)
      if (order) {
        // Update table status if this was the only active order
        const otherActiveOrders = orders.filter(o => 
          o.id !== orderId && 
          o.table_id === order.table_id && 
          o.status === 'active'
        )

        if (otherActiveOrders.length === 0) {
          const { error: tableError } = await supabase
            .from('tables')
            .update({ status: 'available' })
            .eq('id', order.table_id)

          if (tableError) throw tableError

          setTables(prev => prev.map(table =>
            table.id === order.table_id ? { ...table, status: 'available' } : table
          ))
        }
      }

      setOrders(prev => prev.filter(o => o.id !== orderId))
    } catch (error) {
      console.error('Error deleting order:', error)
      setError('Failed to delete order')
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.table.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => 
        item.menu_item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    const matchesTable = !selectedTable || order.table_id === selectedTable.id
    // Only show active orders
    return order.status === 'active' && matchesSearch && matchesTable
  })

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className={`${isSidebarExpanded ? 'pl-52' : 'pl-14'} transition-all duration-300`}>
      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
                <h2 
                  style={{ 
              fontSize: typography.headings.h2.fontSize,
              lineHeight: typography.headings.h2.lineHeight,
              fontWeight: typography.headings.h2.fontWeight,
              letterSpacing: typography.headings.h2.letterSpacing,
                    color: colors.brand.primary
                  }}
                >
            Pedidos
                </h2>
          <button
            onClick={() => setIsHowItWorksModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            style={{ fontSize: typography.fontSize.sm }}
          >
            <QuestionMarkCircleIcon className="h-5 w-5" />
            Como Funciona
          </button>
              </div>

        {/* Search and Filter Section */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pedidos por mesa ou itens..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:ring-1 focus:ring-black focus:border-black"
              style={{ fontSize: typography.fontSize.base }}
            />
          </div>
            </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-8">
          {/* Table Management Section */}
          <div className="col-span-3">
            <TableManager
              tables={tables}
              setTables={setTables}
              onTableSelect={setSelectedTable}
              selectedTable={selectedTable}
              restaurantId={restaurantId}
              onCreateOrderClick={() => setIsCreateOrderModalOpen(true)}
              orders={orders}
              setOrders={setOrders}
            />
          </div>

          {/* Orders List Section */}
          <div className="col-span-9">
            <h3 
              className="font-medium mb-4"
              style={{ fontSize: typography.fontSize.xl, color: colors.brand.primary }}
            >
              Lista de Pedidos
            </h3>
            <OrderList
              orders={filteredOrders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdateItemStatus={handleUpdateItemStatus}
              onAddItem={(order) => {
                                setSelectedOrder(order)
                                setIsAddItemModalOpen(true)
                              }}
              onDeleteOrder={handleDeleteOrder}
              onDeleteItem={handleDeleteItem}
              toggleDropdown={toggleDropdown}
              activeDropdowns={activeDropdowns}
              setConfirmDialog={setConfirmDialog}
              />
            </div>
              </div>

        {/* Modal for creating orders */}
        {isCreateOrderModalOpen && selectedTable && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">
                Criar Pedido - Mesa {selectedTable.label}
              </h3>
              <p className="text-gray-500 mb-6">
                Deseja criar um novo pedido para esta mesa?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsCreateOrderModalOpen(false)
                    setSelectedTable(null)
                  }}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateOrder}
                  className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Criar Pedido
                </button>
                </div>
            </div>
            </div>
        )}

        {/* Modal for adding items to order */}
        {isAddItemModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
              {/* Header with buttons */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium">
                Adicionar Item ao Pedido - Mesa {selectedOrder.table.label}
              </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsAddItemModalOpen(false)
                      setSelectedOrder(null)
                      setItemForm({ menuItemId: '', quantity: 1, observations: '' })
                      setSelectedGroup(null)
                    }}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleAddItem(selectedOrder.id)}
                    disabled={!itemForm.menuItemId || itemForm.quantity < 1}
                    className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Content with auto scroll */}
              <div className="p-6 overflow-y-auto">
              {!selectedGroup ? (
                // Show menu groups
                  <div className="grid grid-cols-3 gap-4">
                  {menuGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroup(group.id)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-black transition-colors text-left"
                    >
                      <h4 className="font-medium mb-1">{group.name}</h4>
                      <p className="text-sm text-gray-500">
                        {menuItems.filter(item => item.group_id === group.id).length} itens
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                // Show items from selected group
                  <div>
                  <button
                    onClick={() => setSelectedGroup(null)}
                    className="mb-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    ← Voltar para categorias
                  </button>
                    <div className="grid grid-cols-3 gap-4">
                    {menuItems
                      .filter(item => item.group_id === selectedGroup)
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setItemForm(prev => ({ ...prev, menuItemId: item.id }))}
                          className={`p-4 border rounded-lg transition-colors text-left ${
                            itemForm.menuItemId === item.id
                              ? 'border-black bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <h4 className="font-medium mb-1">{item.name}</h4>
                          <p className="text-sm text-gray-500">
                            R$ {item.price.toFixed(2)}
                          </p>
                        </button>
                      ))}
                  </div>
                  </div>
              )}

              {itemForm.menuItemId && (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (itemForm.menuItemId && itemForm.quantity >= 1) {
                        handleAddItem(selectedOrder.id)
                      }
                    }}
                    className="space-y-4 mt-6 border-t border-gray-200 pt-6"
                  >
                    <div className="flex gap-6">
                      <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={itemForm.quantity}
                          onChange={(e) => setItemForm(prev => ({ 
                            ...prev, 
                            quantity: Number(e.target.value) || 1 
                          }))}
                          onFocus={(e) => e.target.select()}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                      <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      value={itemForm.observations}
                      onChange={(e) => setItemForm(prev => ({ ...prev, observations: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                          rows={1}
                      placeholder="Opcional"
                    />
                  </div>
                </div>
                    {/* Hidden submit button to handle enter key */}
                    <button type="submit" className="hidden" />
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
      onConfirm={() => {
        confirmDialog.onConfirm()
        setConfirmDialog(prev => ({ ...prev, isOpen: false }))
      }}
      onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        />

        {/* Add HowItWorksModal before the closing div */}
        <HowItWorksModal
          isOpen={isHowItWorksModalOpen}
          onClose={() => setIsHowItWorksModalOpen(false)}
        />
      </div>
    </div>
  )
} 