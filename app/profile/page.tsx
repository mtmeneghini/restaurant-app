'use client'

import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Restaurant } from '../../types/database'
import Modal from '../../components/Modal'
import NavigationHeader from '../../components/NavigationHeader'
import { colors, typography } from '../../styles/design-system'
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  Squares2X2Icon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

// Types for database function results
interface MonthlyRevenue {
  month: string
  total_revenue: number
}

interface MonthlyOrders {
  month: string
  order_count: number
}

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [restaurantInfo, setRestaurantInfo] = useState<Restaurant | null>(null)
  const [loadingRestaurant, setLoadingRestaurant] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Restaurant>>({})
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showAllInfo, setShowAllInfo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [revenueData, setRevenueData] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] })
  const [ordersData, setOrdersData] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] })
  const [loadingCharts, setLoadingCharts] = useState(true)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    async function fetchRestaurantInfo() {
      if (user) {
        try {
          // Try to get the existing restaurant first
          const { data: existingRestaurant, error: fetchError } = await supabase
            .from('restaurants')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()

          // If we got a restaurant, use it
          if (existingRestaurant) {
            setRestaurantInfo(existingRestaurant)
            setEditForm(existingRestaurant)
            // Fetch chart data after getting restaurant info
            await fetchChartData(existingRestaurant.id)
            return
          }

          // If there was an actual error (not just no data), throw it
          if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError
          }

          // If no restaurant exists, try to create one with upsert to handle race conditions
          const { data: restaurant, error: createError } = await supabase
            .from('restaurants')
            .upsert(
              {
                user_id: user.id,
                name: 'My Restaurant',
                address: 'Add address',
                phone_number: '+1234567890'
              },
              {
                onConflict: 'user_id',
                ignoreDuplicates: false
              }
            )
            .select()
            .single()

          if (createError) {
            console.error('Error creating restaurant:', createError)
            throw new Error(`Failed to create restaurant: ${createError.message}`)
          }

          if (!restaurant) {
            throw new Error('Failed to create restaurant: No data returned')
          }

          setRestaurantInfo(restaurant)
          setEditForm(restaurant)
          // Show welcome modal for new users instead of edit form
          setShowWelcome(true)
          // Fetch chart data after getting restaurant info
          await fetchChartData(restaurant.id)
        } catch (error) {
          console.error('Error fetching/creating restaurant:', error)
          setError(error instanceof Error ? error.message : 'An unexpected error occurred')
        } finally {
          setLoadingRestaurant(false)
        }
      }
    }

    fetchRestaurantInfo()
  }, [user])

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

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    setUpdateError(null)
    if (!isEditing) {
      setEditForm(restaurantInfo || {})
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    // Clear any previous errors
    setUpdateError(null)

    // Validate restaurant ID
    if (!restaurantInfo?.id) {
      setUpdateError('Restaurant ID is missing')
      return
    }

    // Get and validate form values
    const name = editForm.name?.trim() || ''
    const address = editForm.address?.trim() || ''
    const phone_number = editForm.phone_number?.trim() || ''

    // Check for missing fields
    const missingFields = []
    if (!name) missingFields.push('Restaurant Name')
    if (!address) missingFields.push('Address')
    if (!phone_number) missingFields.push('Phone Number')

    if (missingFields.length > 0) {
      setUpdateError(`Missing required fields: ${missingFields.join(', ')}`)
      return
    }

    // Validate phone number format
    const phoneRegex = /^[\d\s\-\(\)\+]+$/
    if (!phoneRegex.test(phone_number)) {
      setUpdateError('Phone number can only contain numbers, spaces, hyphens, parentheses, and plus sign')
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          name,
          address,
          phone_number
        })
        .eq('id', restaurantInfo.id)

      if (error) throw error

      // Refresh restaurant info
      const { data, error: fetchError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantInfo.id)
        .single()

      if (fetchError) throw fetchError

      if (data) {
        setRestaurantInfo(data)
        setIsEditing(false)
      } else {
        throw new Error('Failed to fetch updated restaurant data')
      }
    } catch (error) {
      console.error('Error updating restaurant:', error)
      setUpdateError(error instanceof Error ? error.message : 'An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  // Function to fetch chart data
  const fetchChartData = async (restaurantId: string) => {
    setLoadingCharts(true)
    setError(null) // Clear any previous errors
    
    try {
      console.log('Starting fetchChartData for restaurant:', restaurantId)
      
      // Calculate date range (last 6 months)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(endDate.getMonth() - 5) // Get previous 6 months
      startDate.setDate(1) // Start from beginning of month
      startDate.setHours(0, 0, 0, 0) // Start of day

      endDate.setDate(endDate.getDate() + 1) // Include today
      endDate.setHours(0, 0, 0, 0) // Start of day

      // Format dates in America/Sao_Paulo timezone
      const formatDateToSaoPaulo = (date: Date) => {
        const [month, day, year] = date.toLocaleString('en-US', {
          timeZone: 'America/Sao_Paulo',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).split('/')
        return `${year}-${month}-${day}`
      }

      const formattedStartDate = formatDateToSaoPaulo(startDate)
      const formattedEndDate = formatDateToSaoPaulo(endDate)

      console.log('Date range:', { 
        startDate: formattedStartDate, 
        endDate: formattedEndDate,
        rawStartDate: startDate.toISOString(),
        rawEndDate: endDate.toISOString()
      })

      // Fetch revenue data
      console.log('Fetching revenue data with params:', {
        restaurant_id: restaurantId,
        start_date: formattedStartDate,
        end_date: formattedEndDate
      })

      const revenueResult = await supabase.rpc(
        'get_monthly_revenue',
        {
          restaurant_id: restaurantId,
          start_date: formattedStartDate,
          end_date: formattedEndDate
        }
      )

      console.log('Revenue query result:', {
        error: revenueResult.error,
        data: revenueResult.data,
        status: revenueResult.status
      })

      if (revenueResult.error) {
        console.error('Revenue query error:', revenueResult.error)
        throw new Error(`Error fetching revenue data: ${revenueResult.error.message || 'Unknown error'}`)
      }

      // Fetch orders data
      console.log('Fetching orders data with params:', {
        restaurant_id: restaurantId,
        start_date: formattedStartDate,
        end_date: formattedEndDate
      })

      const ordersResult = await supabase.rpc(
        'get_monthly_orders',
        {
          restaurant_id: restaurantId,
          start_date: formattedStartDate,
          end_date: formattedEndDate
        }
      )

      console.log('Orders query result:', {
        error: ordersResult.error,
        data: ordersResult.data,
        status: ordersResult.status
      })

      if (ordersResult.error) {
        console.error('Orders query error:', ordersResult.error)
        throw new Error(`Error fetching orders data: ${ordersResult.error.message || 'Unknown error'}`)
      }

      // Validate data structure
      if (!Array.isArray(revenueResult.data)) {
        console.error('Invalid revenue data structure:', revenueResult.data)
        throw new Error('Revenue data has invalid format')
      }

      if (!Array.isArray(ordersResult.data)) {
        console.error('Invalid orders data structure:', ordersResult.data)
        throw new Error('Orders data has invalid format')
      }

      // Process revenue data
      console.log('Processing revenue data:', revenueResult.data)
      const revenueLabels = revenueResult.data.map((item: MonthlyRevenue) => {
        if (!item.month) {
          console.error('Invalid revenue item:', item)
          throw new Error('Revenue data missing month field')
        }
        const [year, month] = item.month.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1, 1)
        return date.toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: 'numeric'
        })
      })
      const revenueValues = revenueResult.data.map((item: MonthlyRevenue) => {
        if (typeof item.total_revenue !== 'number' && typeof item.total_revenue !== 'string') {
          console.error('Invalid revenue value:', item)
          throw new Error('Revenue data has invalid total_revenue')
        }
        return Number(item.total_revenue)
      })

      // Process orders data
      console.log('Processing orders data:', ordersResult.data)
      const ordersLabels = ordersResult.data.map((item: MonthlyOrders) => {
        if (!item.month) {
          console.error('Invalid order item:', item)
          throw new Error('Orders data missing month field')
        }
        const [year, month] = item.month.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1, 1)
        return date.toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: 'numeric'
        })
      })
      const ordersValues = ordersResult.data.map((item: MonthlyOrders) => {
        if (typeof item.order_count !== 'number' && typeof item.order_count !== 'string') {
          console.error('Invalid order count:', item)
          throw new Error('Orders data has invalid order_count')
        }
        return Number(item.order_count)
      })

      console.log('Final processed data:', {
        revenue: { labels: revenueLabels, values: revenueValues },
        orders: { labels: ordersLabels, values: ordersValues }
      })

      setRevenueData({ labels: revenueLabels, data: revenueValues })
      setOrdersData({ labels: ordersLabels, data: ordersValues })
    } catch (error) {
      console.error('Detailed error in fetchChartData:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      
      setError(
        error instanceof Error 
          ? `Erro ao carregar dados dos gráficos: ${error.message}`
          : 'Erro desconhecido ao carregar dados dos gráficos'
      )

      // Initialize empty data to prevent chart errors
      setRevenueData({ labels: [], data: [] })
      setOrdersData({ labels: [], data: [] })
    } finally {
      setLoadingCharts(false)
    }
  }

  if (loading || loadingRestaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div 
      className={`min-h-screen bg-gray-50 ${isSidebarExpanded ? 'pl-52' : 'pl-14'} transition-all duration-300`}
      style={{ fontFamily: typography.fontFamily.primary }}
    >
      <NavigationHeader selectionPath="Profile" />
      
      {error && (
        <div className="max-w-7xl p-6 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative">
            <strong className="font-medium">Erro: </strong>
            <span style={{ fontSize: typography.fontSize.base }}>{error}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl p-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 
              style={{ 
                fontSize: typography.headings.h2.fontSize,
                lineHeight: typography.headings.h2.lineHeight,
                fontWeight: typography.headings.h2.fontWeight,
                letterSpacing: typography.headings.h2.letterSpacing,
                color: colors.brand.primary
              }}
            >
              Perfil do Restaurante
            </h2>
            <button
              onClick={handleEditToggle}
              className="px-4 py-2 rounded-full text-white transition-colors hover:bg-gray-800"
              style={{ 
                backgroundColor: colors.brand.primary,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium
              }}
            >
              Editar Informações
            </button>
          </div>
          
          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label 
                className="block mb-1"
                style={{ 
                  fontSize: 'calc(var(--body-size) * 0.875)',
                  fontWeight: typography.fontWeight.medium,
                  color: colors.ui.gray[600]
                }}
              >
                Email
              </label>
              <div style={{ fontSize: 'var(--body-size)', color: colors.ui.gray[900] }}>
                {user.email}
              </div>
            </div>
            <div>
              <label 
                className="block mb-1"
                style={{ 
                  fontSize: 'calc(var(--body-size) * 0.875)',
                  fontWeight: typography.fontWeight.medium,
                  color: colors.ui.gray[600]
                }}
              >
                Planos
              </label>
              <div style={{ fontSize: 'var(--body-size)', color: colors.ui.gray[900] }}>
                Plano Gratuito
              </div>
            </div>
            <div>
              <label 
                className="block mb-1"
                style={{ 
                  fontSize: 'calc(var(--body-size) * 0.875)',
                  fontWeight: typography.fontWeight.medium,
                  color: colors.ui.gray[600]
                }}
              >
                Nome do Restaurante
              </label>
              <div style={{ fontSize: 'var(--body-size)', color: colors.ui.gray[900] }}>
                {restaurantInfo?.name}
              </div>
            </div>
            <div>
              <label 
                className="block mb-1"
                style={{ 
                  fontSize: 'calc(var(--body-size) * 0.875)',
                  fontWeight: typography.fontWeight.medium,
                  color: colors.ui.gray[600]
                }}
              >
                Telefone
              </label>
              <div style={{ fontSize: 'var(--body-size)', color: colors.ui.gray[900] }}>
                {restaurantInfo?.phone_number}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {showAllInfo && (
            <div className="border-t pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label 
                  className="block mb-1"
                  style={{ 
                    fontSize: 'calc(var(--body-size) * 0.875)',
                    fontWeight: typography.fontWeight.medium,
                    color: colors.ui.gray[600]
                  }}
                >
                  Endereço
                </label>
                <div style={{ fontSize: 'var(--body-size)', color: colors.ui.gray[900] }}>
                  {restaurantInfo?.address}
                </div>
              </div>
              <div>
                <label 
                  className="block mb-1"
                  style={{ 
                    fontSize: 'calc(var(--body-size) * 0.875)',
                    fontWeight: typography.fontWeight.medium,
                    color: colors.ui.gray[600]
                  }}
                >
                  Criado em
                </label>
                <div style={{ fontSize: 'var(--body-size)', color: colors.ui.gray[900] }}>
                  {new Date(restaurantInfo?.created_at || '').toLocaleDateString()}
                </div>
              </div>
              <div>
                <label 
                  className="block mb-1"
                  style={{ 
                    fontSize: 'calc(var(--body-size) * 0.875)',
                    fontWeight: typography.fontWeight.medium,
                    color: colors.ui.gray[600]
                  }}
                >
                  Última Atualização
                </label>
                <div style={{ fontSize: 'var(--body-size)', color: colors.ui.gray[900] }}>
                  {new Date(restaurantInfo?.updated_at || '').toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          {/* See More/Less Button */}
          <button
            onClick={() => setShowAllInfo(!showAllInfo)}
            className="mt-4 flex items-center transition-colors"
            style={{ 
              fontSize: 'var(--body-size)',
              color: colors.brand.tertiary
            }}
          >
            {showAllInfo ? (
              <>
                Mostrar Menos <ChevronUpIcon className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                Mostrar Mais <ChevronDownIcon className="h-4 w-4 ml-1" />
              </>
            )}
          </button>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Graph */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6" />
              </div>
              <h3 
                style={{ 
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.ui.gray[900]
                }}
              >
                Receita por Mês
              </h3>
            </div>
            <div className="h-64">
              {loadingCharts ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Carregando...
                </div>
              ) : revenueData.labels.length > 0 ? (
                <Bar
                  data={{
                    labels: revenueData.labels,
                    datasets: [{
                      data: revenueData.data,
                      backgroundColor: colors.brand.tertiary,
                      borderRadius: 4
                    }]
                  }}
                  options={chartOptions}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Nenhum dado disponível
                </div>
              )}
            </div>
          </div>

          {/* Orders Graph */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <ClipboardDocumentListIcon className="h-6 w-6" />
              </div>
              <h3 
                style={{ 
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.ui.gray[900]
                }}
              >
                Pedidos por Mês
              </h3>
            </div>
            <div className="h-64">
              {loadingCharts ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Carregando...
                </div>
              ) : ordersData.labels.length > 0 ? (
                <Bar
                  data={{
                    labels: ordersData.labels,
                    datasets: [{
                      data: ordersData.data,
                      backgroundColor: colors.brand.primary,
                      borderRadius: 4
                    }]
                  }}
                  options={chartOptions}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Nenhum dado disponível
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Modal */}
      <Modal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        title="Bem-vindo ao Zarpar!"
      >
        <div className="space-y-6 py-4">
          <div className="text-center">
            <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Squares2X2Icon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Vamos Começar!
            </h3>
            <p className="text-gray-600">
              Bem-vindo ao seu painel de gestão de restaurante. Criamos um perfil padrão para seu restaurante.
              Você pode personalizá-lo a qualquer momento clicando no botão &ldquo;Editar Informações&rdquo;.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Guia Rápido:</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 flex-shrink-0 text-sm">1</span>
                  Personalize o perfil do seu restaurante
                </li>
                <li className="flex items-center">
                  <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 flex-shrink-0 text-sm">2</span>
                  Crie seu primeiro cardápio
                </li>
                <li className="flex items-center">
                  <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 flex-shrink-0 text-sm">3</span>
                  Configure suas mesas
                </li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowWelcome(false)
                setIsEditing(true)
              }}
              className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Editar Informações
            </button>
            <button
              onClick={() => setShowWelcome(false)}
              className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Começar
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditing}
        onClose={handleEditToggle}
        title="Editar Informações do Restaurante"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Restaurante</label>
            <input
              type="text"
              name="name"
              value={editForm.name || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2"
              placeholder="Digite o nome do restaurante"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Endereço</label>
            <input
              type="text"
              name="address"
              value={editForm.address || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2"
              placeholder="Digite o endereço"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Telefone</label>
            <input
              type="text"
              name="phone_number"
              value={editForm.phone_number || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2"
              placeholder="Digite o telefone"
            />
          </div>
          {updateError && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
              {updateError}
            </p>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleEditToggle}
              className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2 text-sm font-medium rounded-md text-white ${
                isSaving 
                  ? 'bg-green-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              } transition-colors duration-200`}
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
} 