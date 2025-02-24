'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { colors, typography } from '../../styles/design-system'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { useAuth } from '../../contexts/AuthContext'

interface SubscriptionDetails {
  tier: string
  status: string
  current_period_end: string
  cancel_at_period_end: boolean
  billing_period: 'monthly' | 'semester' | 'yearly'
  is_trial: boolean
  trial_end: string
}

export default function SubscriptionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null)

  useEffect(() => {
    if (user) {
      fetchSubscriptionDetails()
    }
  }, [user])

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await fetch('/api/subscription/details', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      setSubscription(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription details')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) return

    try {
      setLoading(true)
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        credentials: 'include'
      })
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      await fetchSubscriptionDetails()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/subscription/reactivate', {
        method: 'POST',
        credentials: 'include'
      })
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error)
      
      await fetchSubscriptionDetails()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reactivate subscription')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getSubscriptionStatus = () => {
    if (!subscription) return null

    if (subscription.is_trial) {
      return {
        label: 'Período de Teste',
        description: `Seu período de teste termina em ${formatDate(subscription.trial_end)}`,
        action: {
          label: 'Assinar Agora',
          href: '/pricing'
        }
      }
    }

    if (subscription.tier === 'pro') {
      if (subscription.cancel_at_period_end) {
        return {
          label: 'Cancelamento Agendado',
          description: `Sua assinatura será cancelada em ${formatDate(subscription.current_period_end)}`,
          action: {
            label: 'Reativar Assinatura',
            onClick: handleReactivateSubscription
          }
        }
      }

      return {
        label: 'Assinatura Ativa',
        description: `Próxima cobrança em ${formatDate(subscription.current_period_end)}`,
        action: {
          label: 'Cancelar Assinatura',
          onClick: handleCancelSubscription
        }
      }
    }

    return {
      label: 'Sem Assinatura',
      description: 'Você não possui uma assinatura ativa',
      action: {
        label: 'Ver Planos',
        href: '/pricing'
      }
    }
  }

  const status = getSubscriptionStatus()

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        fontFamily: typography.fontFamily.primary,
        backgroundColor: colors.ui.white
      }}
    >
      <Header />

      <main className="flex-grow py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 
            className="mb-8"
            style={{ 
              fontSize: typography.headings.h1.fontSize,
              lineHeight: typography.headings.h1.lineHeight,
              fontWeight: typography.fontWeight.semibold,
              color: colors.brand.primary
            }}
          >
            Gerenciar Assinatura
          </h1>

          {error && (
            <div className="mb-8 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">Carregando...</div>
          ) : status && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 
                      className="text-xl font-semibold mb-2"
                      style={{ color: colors.brand.primary }}
                    >
                      {status.label}
                    </h2>
                    <p 
                      className="text-gray-600"
                      style={{ fontSize: typography.fontSize.base }}
                    >
                      {status.description}
                    </p>
                  </div>
                  {'href' in status.action ? (
                    <a
                      href={status.action.href}
                      className="px-6 py-2 rounded-full text-white transition-colors"
                      style={{ 
                        backgroundColor: colors.brand.primary,
                        fontSize: typography.fontSize.base
                      }}
                    >
                      {status.action.label}
                    </a>
                  ) : (
                    <button
                      onClick={status.action.onClick}
                      disabled={loading}
                      className={`px-6 py-2 rounded-full transition-colors ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      style={{ 
                        backgroundColor: status.action.label.includes('Cancelar') 
                          ? 'transparent'
                          : colors.brand.primary,
                        color: status.action.label.includes('Cancelar')
                          ? colors.brand.primary
                          : colors.ui.white,
                        border: status.action.label.includes('Cancelar')
                          ? `1px solid ${colors.brand.primary}`
                          : 'none',
                        fontSize: typography.fontSize.base
                      }}
                    >
                      {loading ? 'Processando...' : status.action.label}
                    </button>
                  )}
                </div>
              </div>

              {subscription?.tier === 'pro' && !subscription.is_trial && (
                <div className="p-6">
                  <h3 
                    className="text-lg font-semibold mb-4"
                    style={{ color: colors.brand.primary }}
                  >
                    Detalhes do Plano
                  </h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-gray-500">Plano</dt>
                      <dd className="font-medium">Pro</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Período</dt>
                      <dd className="font-medium">
                        {subscription.billing_period === 'monthly' && 'Mensal'}
                        {subscription.billing_period === 'semester' && 'Semestral'}
                        {subscription.billing_period === 'yearly' && 'Anual'}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
} 