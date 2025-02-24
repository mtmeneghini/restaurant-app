'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { colors, typography } from '../../../styles/design-system'
import NavigationHeader from '../../../components/NavigationHeader'

interface SubscriptionDetails {
  tier: 'free' | 'pro' | 'custom'
  status: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  billingPeriod?: 'monthly' | 'semester' | 'yearly'
}

export default function SubscriptionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchSubscriptionDetails()
  }, [user, router])

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_subscription' })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch subscription details')
      }

      const data = await response.json()
      setSubscription(data)
    } catch (err) {
      console.error('Error fetching subscription:', err)
      setError('Failed to load subscription details')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return
    }

    try {
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel_subscription' })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      await fetchSubscriptionDetails()
    } catch (err) {
      console.error('Error canceling subscription:', err)
      setError('Failed to cancel subscription')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader selectionPath="Settings" />

      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 
            className="mb-6"
            style={{ 
              fontSize: typography.headings.h2.fontSize,
              lineHeight: typography.headings.h2.lineHeight,
              fontWeight: typography.fontWeight.semibold,
              color: colors.brand.primary
            }}
          >
            Gerenciar Assinatura
          </h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {subscription && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Plano Atual
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Plano</div>
                      <div className="font-medium">
                        {subscription.tier === 'pro' ? 'Plano Pro' : 'Plano Gratuito'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <div className="font-medium">
                        {subscription.status === 'active' ? 'Ativo' : 'Inativo'}
                      </div>
                    </div>
                    {subscription.currentPeriodEnd && (
                      <div>
                        <div className="text-sm text-gray-500">Próxima Cobrança</div>
                        <div className="font-medium">
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    {subscription.billingPeriod && (
                      <div>
                        <div className="text-sm text-gray-500">Período</div>
                        <div className="font-medium">
                          {subscription.billingPeriod === 'monthly' ? 'Mensal' :
                           subscription.billingPeriod === 'semester' ? 'Semestral' : 'Anual'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {subscription.tier === 'pro' && (
                <div className="border-t pt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Ações
                  </h2>
                  <div className="space-x-4">
                    <button
                      onClick={() => router.push('/pricing')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Mudar Plano
                    </button>
                    <button
                      onClick={handleCancelSubscription}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancelar Assinatura
                    </button>
                  </div>
                  {subscription.cancelAtPeriodEnd && (
                    <p className="mt-4 text-sm text-gray-500">
                      Sua assinatura será cancelada ao final do período atual.
                    </p>
                  )}
                </div>
              )}

              {subscription.tier === 'free' && (
                <div className="border-t pt-6">
                  <button
                    onClick={() => router.push('/pricing')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Fazer Upgrade
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 