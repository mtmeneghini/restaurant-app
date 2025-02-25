'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../../contexts/AuthContext'
import { supabase } from '../../../../utils/supabase'
import { colors, typography } from '../../../../styles/design-system'
import NavigationHeader from '../../../../components/NavigationHeader'
import ConfirmDialog from '../../../../components/ConfirmDialog'
import { 
  CreditCardIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

interface SubscriptionDetails {
  tier: string
  status: string
  current_period_end: string
  cancel_at_period_end: boolean
  billing_period: 'monthly' | 'semester' | 'yearly'
  is_trial: boolean
  trial_end: string | null
  custom_features: Array<{
    id: string
    name: string
    description: string
    enabled: boolean
  }>
}

export default function ManageSubscriptionPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmText: string
    cancelText: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    onConfirm: () => {}
  })
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }
    
    const fetchSubscription = async () => {
      try {
        setIsLoading(true)
        
        const { data, error } = await supabase.rpc('get_subscription_details', {
          p_user_id: user?.id
        })
        
        if (error) throw error
        
        setSubscription(data)
      } catch (err) {
        console.error('Error fetching subscription:', err)
        setError('Failed to load subscription details')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSubscription()
    
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
  
  const handleCancelSubscription = async () => {
    try {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('stripe_subscription_id')
        .eq('user_id', user?.id)
        .single()
      
      if (!restaurant?.stripe_subscription_id) {
        throw new Error('No subscription found')
      }
      
      const { error } = await supabase.rpc('cancel_subscription', {
        p_subscription_id: restaurant.stripe_subscription_id
      })
      
      if (error) throw error
      
      // Update local state
      setSubscription(prev => prev ? {
        ...prev,
        cancel_at_period_end: true
      } : null)
      
      setConfirmDialog(prev => ({ ...prev, isOpen: false }))
    } catch (err) {
      console.error('Error canceling subscription:', err)
      setError('Failed to cancel subscription')
    }
  }
  
  const handleReactivateSubscription = async () => {
    try {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('stripe_subscription_id')
        .eq('user_id', user?.id)
        .single()
      
      if (!restaurant?.stripe_subscription_id) {
        throw new Error('No subscription found')
      }
      
      const { error } = await supabase.rpc('reactivate_subscription', {
        p_subscription_id: restaurant.stripe_subscription_id
      })
      
      if (error) throw error
      
      // Update local state
      setSubscription(prev => prev ? {
        ...prev,
        cancel_at_period_end: false
      } : null)
    } catch (err) {
      console.error('Error reactivating subscription:', err)
      setError('Failed to reactivate subscription')
    }
  }
  
  const showCancelConfirmation = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancelar assinatura?',
      message: 'Sua assinatura continuará ativa até o final do período atual. Após isso, você será rebaixado para o plano gratuito.',
      confirmText: 'Sim, cancelar',
      cancelText: 'Não, manter',
      onConfirm: handleCancelSubscription
    })
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  const getBillingPeriodLabel = (period: 'monthly' | 'semester' | 'yearly') => {
    switch (period) {
      case 'monthly': return 'Mensal'
      case 'semester': return 'Semestral'
      case 'yearly': return 'Anual'
      default: return period
    }
  }
  
  if (isLoading) {
    return (
      <div className={`flex flex-col min-h-screen ${isSidebarExpanded ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <NavigationHeader title="Gerenciar Assinatura" />
        <div className="flex items-center justify-center flex-1">
          <div className="animate-pulse">Carregando detalhes da assinatura...</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`flex flex-col min-h-screen ${isSidebarExpanded ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
      <NavigationHeader title="Gerenciar Assinatura" />
      
      <div className="max-w-4xl mx-auto w-full px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}
        
        {subscription?.tier === 'free' ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 style={{ 
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold
              }}>
                Plano Atual: Gratuito
              </h2>
            </div>
            
            <div className="p-6">
              <p className="mb-6">
                Você está usando a versão gratuita do aplicativo. Atualize para o plano Pro para acessar recursos avançados.
              </p>
              
              <button
                onClick={() => router.push('/subscription')}
                className={`px-6 py-2 rounded-lg font-medium text-white bg-${colors.brand.primary} hover:bg-${colors.brand.primaryDark} transition-colors`}
              >
                Atualizar para o Plano Pro
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200">
                <h2 style={{ 
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.semibold
                }}>
                  Plano Atual: {subscription?.tier === 'pro' ? 'Pro' : 'Personalizado'}
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                {subscription?.is_trial && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                    <InformationCircleIcon className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-700">Período de teste ativo</p>
                      <p className="text-sm text-blue-600">
                        Seu teste termina em {formatDate(subscription.trial_end || '')}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Período de cobrança</p>
                    <p className="font-medium">{getBillingPeriodLabel(subscription?.billing_period || 'monthly')}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <CalendarIcon className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Próxima cobrança</p>
                    <p className="font-medium">
                      {subscription?.current_period_end ? formatDate(subscription.current_period_end) : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <CreditCardIcon className="w-5 h-5 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex items-center">
                      {subscription?.status === 'active' ? (
                        <>
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                          <p className="font-medium text-green-700">Ativa</p>
                        </>
                      ) : (
                        <>
                          <ExclamationCircleIcon className="w-4 h-4 text-yellow-500 mr-1" />
                          <p className="font-medium text-yellow-700">{subscription?.status}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {subscription?.cancel_at_period_end && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="font-medium text-yellow-700">
                      Sua assinatura será cancelada em {formatDate(subscription.current_period_end || '')}
                    </p>
                    <button
                      onClick={handleReactivateSubscription}
                      className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Reativar assinatura
                    </button>
                  </div>
                )}
              </div>
              
              {!subscription?.cancel_at_period_end && (
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={showCancelConfirmation}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Cancelar assinatura
                  </button>
                </div>
              )}
            </div>
            
            {subscription?.custom_features && subscription.custom_features.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 style={{ 
                    fontSize: typography.fontSize.xl,
                    fontWeight: typography.fontWeight.semibold
                  }}>
                    Recursos Personalizados
                  </h2>
                </div>
                
                <div className="p-6">
                  <ul className="space-y-4">
                    {subscription.custom_features.map(feature => (
                      <li key={feature.id} className="flex items-start">
                        <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                          feature.enabled 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <CheckIcon className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="font-medium">{feature.name}</p>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
} 