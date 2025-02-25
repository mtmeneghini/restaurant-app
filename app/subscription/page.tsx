'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../utils/supabase'
import { colors, typography } from '../../styles/design-system'
import NavigationHeader from '../../components/NavigationHeader'
import { CheckIcon } from '@heroicons/react/24/outline'

type BillingPeriod = 'monthly' | 'semester' | 'yearly'

interface PriceOption {
  stripe_price_id: string
  billing_period: BillingPeriod
  amount: number
  currency: string
}

interface SubscriptionPageProps {}

export default function SubscriptionPage({}: SubscriptionPageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [prices, setPrices] = useState<PriceOption[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>('monthly')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }
    
    const fetchPrices = async () => {
      try {
        setIsLoading(true)
        
        // Fetch product prices from your Supabase function
        const { data, error } = await supabase.rpc('get_product_prices', {
          p_product_id: 'prod_Rp2zLXduAGNayh' // Your Pro plan product ID
        })
        
        if (error) throw error
        
        setPrices(data)
      } catch (err) {
        console.error('Error fetching prices:', err)
        setError('Failed to load subscription options')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPrices()
    
    // Handle sidebar state
    const storedValue = localStorage.getItem('sidebarExpanded')
    setIsSidebarExpanded(storedValue === null ? true : storedValue === 'true')
    
    const handleSidebarChange = (e: StorageEvent) => {
      if (e.key === 'sidebarExpanded') {
        setIsSidebarExpanded(e.newValue === 'true')
      }
    }
    
    window.addEventListener('storage', handleSidebarChange)
    return () => window.removeEventListener('storage', handleSidebarChange)
  }, [user, loading, router])
  
  const handleSubscribe = async () => {
    try {
      setIsProcessing(true)
      
      // Find the selected price option
      const selectedPrice = prices.find(price => price.billing_period === selectedPeriod)
      
      if (!selectedPrice) {
        throw new Error('No price selected')
      }
      
      // Create subscription with 14-day trial
      const { data, error } = await supabase.rpc('create_subscription', {
        p_user_id: user?.id,
        p_price_id: selectedPrice.stripe_price_id,
        p_billing_period: selectedPeriod,
        p_trial_days: 14
      })
      
      if (error) throw error
      
      // Redirect to success page or dashboard
      router.push('/subscription/success')
    } catch (err) {
      console.error('Error creating subscription:', err)
      setError('Failed to create subscription. Please try again.')
      setIsProcessing(false)
    }
  }
  
  const formatPrice = (amount: number, period: BillingPeriod) => {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
    
    return formatter.format(amount)
  }
  
  const getPeriodLabel = (period: BillingPeriod) => {
    switch (period) {
      case 'monthly': return 'Mensal'
      case 'semester': return 'Semestral'
      case 'yearly': return 'Anual'
    }
  }
  
  const getDiscountLabel = (period: BillingPeriod) => {
    switch (period) {
      case 'semester': return 'Economize 10%'
      case 'yearly': return 'Economize 20%'
      default: return null
    }
  }
  
  if (isLoading) {
    return (
      <div className={`flex flex-col min-h-screen ${isSidebarExpanded ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <NavigationHeader title="Assinatura" />
        <div className="flex items-center justify-center flex-1">
          <div className="animate-pulse">Carregando opções de assinatura...</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`flex flex-col min-h-screen ${isSidebarExpanded ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
      <NavigationHeader title="Assinatura" />
      
      <div className="max-w-4xl mx-auto w-full px-4 py-8">
        <div className="mb-8 text-center">
          <h1 style={{ 
            fontSize: typography.headings.h1.fontSize,
            lineHeight: typography.headings.h1.lineHeight,
            fontWeight: typography.fontWeight.bold,
            color: colors.brand.primary
          }}>
            Plano Pro
          </h1>
          <p style={{ 
            fontSize: typography.fontSize.lg,
            color: colors.ui.gray[600],
            maxWidth: '600px',
            margin: '1rem auto'
          }}>
            Desbloqueie recursos avançados para o seu restaurante com o plano Pro
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 style={{ 
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold
            }}>
              Escolha seu período de cobrança
            </h2>
          </div>
          
          <div className="p-6 space-y-4">
            {prices.map((price) => (
              <div 
                key={price.stripe_price_id}
                className={`flex items-center justify-between p-4 rounded-lg cursor-pointer border-2 ${
                  selectedPeriod === price.billing_period 
                    ? `border-${colors.brand.primary} bg-${colors.brand.primaryLight}` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPeriod(price.billing_period)}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    selectedPeriod === price.billing_period 
                      ? `border-${colors.brand.primary} bg-${colors.brand.primary}` 
                      : 'border-gray-300'
                  }`}>
                    {selectedPeriod === price.billing_period && (
                      <CheckIcon className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{getPeriodLabel(price.billing_period)}</div>
                    {getDiscountLabel(price.billing_period) && (
                      <div className="text-sm text-green-600 font-medium">
                        {getDiscountLabel(price.billing_period)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-lg font-semibold">
                  {formatPrice(price.amount, price.billing_period)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 style={{ 
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold
            }}>
              O que está incluído
            </h2>
          </div>
          
          <div className="p-6">
            <ul className="space-y-3">
              {[
                'Mesas ilimitadas',
                'Cardápio digital personalizado',
                'Pedidos online e QR Code',
                'Suporte prioritário',
                'Relatórios avançados',
                'Integrações com plataformas de delivery',
                'Backup diário dos seus dados',
                'Acesso a recursos beta'
              ].map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">Teste grátis de 14 dias</h3>
              <p className="text-sm text-gray-600">Cancele a qualquer momento durante o período de teste</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className={`px-8 py-3 rounded-lg font-medium text-white ${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : `bg-${colors.brand.primary} hover:bg-${colors.brand.primaryDark}`
            } transition-colors`}
          >
            {isProcessing ? 'Processando...' : 'Iniciar teste grátis'}
          </button>
        </div>
      </div>
    </div>
  )
} 